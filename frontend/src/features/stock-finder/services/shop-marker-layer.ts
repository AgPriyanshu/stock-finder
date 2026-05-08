import type { GeoJSONSource, Map as MapLibreMap } from "maplibre-gl";
import type { DsSearchItem } from "api/dead-stock";

const SOURCE_ID = "dead-stock-shops";
const CLUSTERS_ID = "dead-stock-shop-clusters";
const CLUSTER_COUNT_ID = "dead-stock-shop-cluster-count";
const POINTS_ID = "dead-stock-shop-points";
const PIN_IMAGE_ID = "shop-pin";

export const shopMarkerLayerIds = {
  source: SOURCE_ID,
  clusters: CLUSTERS_ID,
  clusterCount: CLUSTER_COUNT_ID,
  points: POINTS_ID,
};

export const toShopFeatureCollection = (items: DsSearchItem[]) => {
  const seen = new Set<string>();
  return {
    type: "FeatureCollection" as const,
    features: items
      .filter((item) => item.shopLat !== null && item.shopLng !== null)
      .filter((item) => {
        if (seen.has(item.shop)) return false;
        seen.add(item.shop);
        return true;
      })
      .map((item) => ({
        type: "Feature" as const,
        properties: {
          itemId: item.id,
          shopId: item.shop,
          title: item.shopName,
        },
        geometry: {
          type: "Point" as const,
          coordinates: [item.shopLng as number, item.shopLat as number],
        },
      })),
  };
};

const PIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="44" viewBox="0 0 32 44">
  <path d="M16 0C7.16 0 0 7.16 0 16C0 28 16 44 16 44C16 44 32 28 32 16C32 7.16 24.84 0 16 0Z" fill="#ef4444" stroke="white" stroke-width="2.5"/>
  <circle cx="16" cy="16" r="6" fill="white"/>
</svg>`;

const loadPinImage = (map: MapLibreMap): Promise<void> =>
  new Promise((resolve, reject) => {
    if (map.hasImage(PIN_IMAGE_ID)) {
      resolve();
      return;
    }
    const img = new Image(32, 44);
    img.onload = () => {
      if (!map.hasImage(PIN_IMAGE_ID)) {
        map.addImage(PIN_IMAGE_ID, img, { pixelRatio: 2 });
      }
      resolve();
    };
    img.onerror = reject;
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(PIN_SVG)}`;
  });

export const mountShopMarkers = async (
  map: MapLibreMap,
  items: DsSearchItem[]
) => {
  const data = toShopFeatureCollection(items);
  const existingSource = map.getSource(SOURCE_ID) as GeoJSONSource | undefined;

  if (existingSource) {
    existingSource.setData(data);
    return;
  }

  await loadPinImage(map);

  // Re-check after the async image load in case a concurrent call already added the source.
  const raceSource = map.getSource(SOURCE_ID) as GeoJSONSource | undefined;

  if (raceSource) {
    raceSource.setData(data);
    return;
  }

  map.addSource(SOURCE_ID, {
    type: "geojson",
    data,
    cluster: true,
    clusterRadius: 50,
    clusterMaxZoom: 14,
  });

  map.addLayer({
    id: CLUSTERS_ID,
    type: "circle",
    source: SOURCE_ID,
    filter: ["has", "point_count"],
    paint: {
      "circle-color": "#222222",
      "circle-radius": ["step", ["get", "point_count"], 18, 20, 24, 100, 32],
      "circle-opacity": 0.9,
    },
  });

  map.addLayer({
    id: CLUSTER_COUNT_ID,
    type: "symbol",
    source: SOURCE_ID,
    filter: ["has", "point_count"],
    layout: {
      "text-field": ["get", "point_count_abbreviated"],
      "text-size": 12,
    },
    paint: { "text-color": "#ffffff" },
  });

  map.addLayer({
    id: POINTS_ID,
    type: "symbol",
    source: SOURCE_ID,
    filter: ["!", ["has", "point_count"]],
    layout: {
      "icon-image": PIN_IMAGE_ID,
      "icon-size": 1.7,
      "icon-anchor": "bottom",
      "icon-allow-overlap": true,
    },
  });
};
