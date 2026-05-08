import { describe, expect, it } from "vitest";
import type { SfSearchItem } from "api/stock-finder";
import { flattenResults } from "./search-utils";

const makeItem = (id: string): SfSearchItem => ({
  id,
  shop: `shop-${id}`,
  shopName: `Shop ${id}`,
  category: null,
  name: `Item ${id}`,
  sku: `SKU-${id}`,
  description: "",
  quantity: 1,
  price: null,
  condition: "used",
  status: "active",
  staleAt: "2026-01-01T00:00:00Z",
  images: [],
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  distanceM: null,
  shopLat: null,
  shopLng: null,
  shopPhone: "",
  categorySlug: null,
});

describe("flattenResults", () => {
  it("returns an empty array when called with no argument", () => {
    expect(flattenResults()).toEqual([]);
  });

  it("returns an empty array for an empty pages array", () => {
    expect(flattenResults([])).toEqual([]);
  });

  it("returns items from a single page", () => {
    const items = [makeItem("1"), makeItem("2")];
    expect(flattenResults([{ items, nextCursor: null }])).toEqual(items);
  });

  it("concatenates items from multiple pages in order", () => {
    const page1 = [makeItem("1"), makeItem("2")];
    const page2 = [makeItem("3")];
    const result = flattenResults([
      { items: page1, nextCursor: "cursor-1" },
      { items: page2, nextCursor: null },
    ]);
    expect(result).toEqual([...page1, ...page2]);
  });

  it("handles pages with empty items arrays", () => {
    const items = [makeItem("1")];
    const result = flattenResults([
      { items: [], nextCursor: "cursor-1" },
      { items, nextCursor: null },
    ]);
    expect(result).toEqual(items);
  });
});
