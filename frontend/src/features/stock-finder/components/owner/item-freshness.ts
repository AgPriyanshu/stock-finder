import type { SfItem } from "api/stock-finder";

export type ItemFreshness = "hidden" | "stale" | "refresh-soon" | "active";

const REFRESH_SOON_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export const getItemFreshness = (item: SfItem): ItemFreshness => {
  if (item.status === "hidden") return "hidden";

  const now = Date.now();
  const staleAt = new Date(item.staleAt).getTime();

  if (staleAt < now) return "stale";
  if (staleAt < now + REFRESH_SOON_WINDOW_MS) return "refresh-soon";
  return "active";
};
