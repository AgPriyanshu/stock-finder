/// <reference types="vitest/config" />
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default defineConfig((_) => {
  return {
    plugins: [react(), tsconfigPaths()],
    resolve: {
      alias: {
        api: path.resolve(dirname, "src/api"),
        app: path.resolve(dirname, "src/app"),
        "design-system": path.resolve(dirname, "src/design-system"),
        shared: path.resolve(dirname, "src/shared"),
      },
    },
    server: {
      port: 3000,
    },
    envDir: path.join(dirname, "env-files"),
    test: {
      projects: [
        {
          extends: true,
          plugins: [
            storybookTest({
              configDir: path.join(dirname, ".storybook"),
            }),
          ],
          test: {
            name: "storybook",
            browser: {
              enabled: true,
              headless: true,
              provider: playwright({}),
              instances: [
                {
                  browser: "chromium",
                },
              ],
            },
            setupFiles: [".storybook/vitest.setup.ts"],
          },
        },
        {
          extends: true,
          test: {
            name: "unit",
            environment: "node",
            include: ["src/**/*.test.ts"],
          },
        },
      ],
    },
  };
});
