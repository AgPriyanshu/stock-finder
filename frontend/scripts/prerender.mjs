#!/usr/bin/env node
/**
 * Post-build pre-rendering script.
 *
 * Starts a Vite preview server, visits each route with a real Chromium
 * browser, and saves the fully-rendered HTML into dist/ so each route has
 * its own index.html file. Nginx's `try_files $uri $uri/ /index.html` will
 * serve these files directly, making page content crawlable without JS.
 *
 * Usage:
 *   pnpm prerender
 *
 * To also pre-render shop profile pages, provide the API base URL:
 *   VITE_API_BASE_URL=https://api.example.com pnpm prerender
 *
 * Prerequisite: run `pnpm playwright install chromium` once in this directory.
 */

import { preview } from "vite";
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, "dist");
const PORT = 4274;
const BASE_URL = `http://localhost:${PORT}`;

// Always pre-render these static routes.
const STATIC_ROUTES = ["/", "/terms", "/privacy"];

async function fetchShopIds(apiBase) {
  try {
    const res = await fetch(`${apiBase}/api/shops/?limit=500`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const results = json.data?.results ?? json.data ?? [];
    return results.map((s) => s.id).filter(Boolean);
  } catch (err) {
    console.warn(`Could not fetch shop IDs: ${err.message}`);
    return [];
  }
}

async function renderRoute(context, route) {
  const page = await context.newPage();
  try {
    await page.goto(`${BASE_URL}${route}`, {
      waitUntil: "networkidle",
      timeout: 20_000,
    });
    // Brief settle for any post-load JS (e.g. Chakra colour-mode).
    await page.waitForTimeout(300);
    return await page.content();
  } finally {
    await page.close();
  }
}

async function writeRoute(route, html) {
  const segments = route === "/" ? [] : route.slice(1).split("/");
  const outDir = join(DIST, ...segments);
  await mkdir(outDir, { recursive: true });
  await writeFile(join(outDir, "index.html"), html, "utf-8");
}

async function prerender() {
  console.log("Starting pre-render…\n");

  const server = await preview({
    root: ROOT,
    preview: { port: PORT, host: "localhost", open: false },
  });

  // Optionally add shop profile routes if an API base URL is provided.
  const shopRoutes = [];
  const apiBase = process.env.VITE_API_BASE_URL;
  if (apiBase) {
    process.stdout.write(`Fetching shop IDs from ${apiBase}… `);
    const ids = await fetchShopIds(apiBase);
    shopRoutes.push(...ids.map((id) => `/shops/${id}`));
    console.log(`${ids.length} shop(s) found.\n`);
  }

  const routes = [...STATIC_ROUTES, ...shopRoutes];

  const browser = await chromium.launch();
  // Suppress the geolocation permission prompt so the search page settles fast.
  const context = await browser.newContext({ permissions: [] });

  let ok = 0;
  let fail = 0;

  for (const route of routes) {
    try {
      const html = await renderRoute(context, route);
      await writeRoute(route, html);
      console.log(`  ✓  ${route}`);
      ok++;
    } catch (err) {
      console.error(`  ✗  ${route}: ${err.message}`);
      fail++;
    }
  }

  await browser.close();
  await new Promise((resolve) => server.httpServer.close(resolve));

  console.log(`\nPre-render complete: ${ok} succeeded, ${fail} failed.`);
  if (fail > 0) process.exit(1);
}

prerender().catch((err) => {
  console.error(err);
  process.exit(1);
});
