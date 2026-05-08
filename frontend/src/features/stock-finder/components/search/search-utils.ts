import type { SfSearchPage } from "api/stock-finder";

export const flattenResults = (pages?: SfSearchPage[]) =>
  pages?.flatMap((page) => page.items) ?? [];
