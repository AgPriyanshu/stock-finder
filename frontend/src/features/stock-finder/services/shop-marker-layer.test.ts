import { describe, expect, it } from "vitest";
import type { SfSearchItem } from "api/stock-finder";
import { toShopFeatureCollection } from "./shop-marker-layer";

const makeItem = (
  overrides: Partial<SfSearchItem> & { id: string; shop: string }
): SfSearchItem => ({
  shopName: `Shop ${overrides.shop}`,
  category: null,
  name: `Item ${overrides.id}`,
  sku: `SKU-${overrides.id}`,
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
  shopLat: 28.6,
  shopLng: 77.2,
  shopPhone: "9999999999",
  categorySlug: null,
  ...overrides,
});

describe("toShopFeatureCollection", () => {
  it("returns an empty FeatureCollection for an empty array", () => {
    const result = toShopFeatureCollection([]);
    expect(result.type).toBe("FeatureCollection");
    expect(result.features).toHaveLength(0);
  });

  it("filters out items where shopLat is null", () => {
    const item = makeItem({
      id: "1",
      shop: "s1",
      shopLat: null,
      shopLng: 77.2,
    });
    expect(toShopFeatureCollection([item]).features).toHaveLength(0);
  });

  it("filters out items where shopLng is null", () => {
    const item = makeItem({
      id: "1",
      shop: "s1",
      shopLat: 28.6,
      shopLng: null,
    });
    expect(toShopFeatureCollection([item]).features).toHaveLength(0);
  });

  it("filters out items where both coordinates are null", () => {
    const item = makeItem({
      id: "1",
      shop: "s1",
      shopLat: null,
      shopLng: null,
    });
    expect(toShopFeatureCollection([item]).features).toHaveLength(0);
  });

  it("keeps one feature per unique shop", () => {
    const items = [
      makeItem({ id: "1", shop: "s1", shopLat: 28.6, shopLng: 77.2 }),
      makeItem({ id: "2", shop: "s1", shopLat: 28.7, shopLng: 77.3 }),
      makeItem({ id: "3", shop: "s2", shopLat: 19.0, shopLng: 72.8 }),
    ];
    const result = toShopFeatureCollection(items);
    expect(result.features).toHaveLength(2);
    const shopIds = result.features.map((f) => f.properties.shopId);
    expect(shopIds).toEqual(["s1", "s2"]);
  });

  it("uses coordinates from the first item when a shop appears multiple times", () => {
    const items = [
      makeItem({ id: "1", shop: "s1", shopLat: 28.6, shopLng: 77.2 }),
      makeItem({ id: "2", shop: "s1", shopLat: 99.0, shopLng: 99.0 }),
    ];
    const [feature] = toShopFeatureCollection(items).features;
    expect(feature.geometry.coordinates).toEqual([77.2, 28.6]);
  });

  it("builds a valid GeoJSON Point feature for a located item", () => {
    const item = makeItem({
      id: "1",
      shop: "s1",
      shopLat: 28.6,
      shopLng: 77.2,
    });
    const [feature] = toShopFeatureCollection([item]).features;

    expect(feature.type).toBe("Feature");
    expect(feature.geometry.type).toBe("Point");
    expect(feature.geometry.coordinates).toEqual([77.2, 28.6]);
    expect(feature.properties).toMatchObject({
      itemId: "1",
      shopId: "s1",
      title: "Shop s1",
    });
  });

  it("places coordinates as [lng, lat] (GeoJSON order)", () => {
    const item = makeItem({
      id: "1",
      shop: "s1",
      shopLat: 13.1,
      shopLng: 80.3,
    });
    const [feature] = toShopFeatureCollection([item]).features;
    const [lng, lat] = feature.geometry.coordinates;
    expect(lng).toBe(80.3);
    expect(lat).toBe(13.1);
  });

  it("handles a mix of located and unlocated items", () => {
    const items = [
      makeItem({ id: "1", shop: "s1", shopLat: null, shopLng: null }),
      makeItem({ id: "2", shop: "s2", shopLat: 19.0, shopLng: 72.8 }),
    ];
    const result = toShopFeatureCollection(items);
    expect(result.features).toHaveLength(1);
    expect(result.features[0].properties.shopId).toBe("s2");
  });
});
