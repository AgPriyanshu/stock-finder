import { Box, IconButton, Text, VStack } from "@chakra-ui/react";
import maplibregl from "maplibre-gl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiCrosshair, FiMinus, FiPlus } from "react-icons/fi";
import type { SfSearchItem } from "api/stock-finder";
import {
  mountShopMarkers,
  shopMarkerLayerIds,
} from "../../services/shop-marker-layer";
import { MapView } from "shared/components/map-view";
import type { MapLibreMap } from "shared/components/map-view";
import { MapItemCarousel } from "./map-item-carousel";

interface ResultsMapProps {
  items: SfSearchItem[];
  lat?: number;
  lng?: number;
  myLat?: number | null;
  myLng?: number | null;
  radiusKm?: number;
  isVisible: boolean;
  hasQuery: boolean;
}

const programmaticFlyTo = (
  map: maplibregl.Map,
  isProgrammaticRef: React.MutableRefObject<boolean>,
  options: Parameters<maplibregl.Map["flyTo"]>[0]
) => {
  isProgrammaticRef.current = true;
  map.flyTo(options);
};

const flyToItem = (
  map: maplibregl.Map,
  item: SfSearchItem,
  isProgrammaticRef: React.MutableRefObject<boolean>
) => {
  if (item.shopLat === null || item.shopLng === null) return;
  programmaticFlyTo(map, isProgrammaticRef, {
    center: [item.shopLng, item.shopLat],
    zoom: Math.max(map.getZoom(), 14),
    duration: 600,
  });
};

export const ResultsMap = ({
  items,
  lat,
  lng,
  myLat,
  myLng,
  radiusKm,
  isVisible,
  hasQuery,
}: ResultsMapProps) => {
  const sortedItems = useMemo(
    () =>
      [...items].sort((a, b) => {
        if (a.distanceM === null) return 1;
        if (b.distanceM === null) return -1;
        return a.distanceM - b.distanceM;
      }),
    [items]
  );

  const mapRef = useRef<MapLibreMap | null>(null);
  const locationMarkerRef = useRef<maplibregl.Marker | null>(null);
  const itemsRef = useRef(sortedItems);
  const initialLatRef = useRef(lat);
  const initialLngRef = useRef(lng);
  const isProgrammaticMoveRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    itemsRef.current = sortedItems;
  }, [sortedItems]);

  const handleMapCreated = useCallback((map: MapLibreMap) => {
    mapRef.current = map;

    map.on("load", () => {
      void mountShopMarkers(map, itemsRef.current);

      map.on("moveend", () => {
        if (isProgrammaticMoveRef.current) {
          isProgrammaticMoveRef.current = false;
        }
      });

      map.on("click", shopMarkerLayerIds.points, (event) => {
        const itemId = event.features?.[0]?.properties?.itemId;
        const index = itemsRef.current.findIndex(
          (candidate) => candidate.id === itemId
        );
        if (index !== -1) {
          setActiveIndex(index);
          flyToItem(map, itemsRef.current[index]!, isProgrammaticMoveRef);
        }
      });

      map.on("click", shopMarkerLayerIds.clusters, async (event) => {
        const feature = event.features?.[0];
        const clusterId = feature?.properties?.cluster_id;
        const source = map.getSource(shopMarkerLayerIds.source) as
          | maplibregl.GeoJSONSource
          | undefined;
        if (!source || clusterId === undefined || !feature?.geometry) return;
        isProgrammaticMoveRef.current = true;
        const zoom = await source.getClusterExpansionZoom(clusterId);
        const coordinates = (feature.geometry as GeoJSON.Point).coordinates as [
          number,
          number,
        ];
        map.easeTo({ center: coordinates, zoom });
      });

      map.on("click", (event) => {
        const features = map.queryRenderedFeatures(event.point, {
          layers: [shopMarkerLayerIds.points, shopMarkerLayerIds.clusters],
        });
        if (features.length === 0) {
          setActiveIndex(null);
        }
      });
    });

    return () => {
      locationMarkerRef.current?.remove();
      locationMarkerRef.current = null;
      mapRef.current = null;
    };
  // Stable refs and setState — safe with empty deps.
   
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const fit = () => {
      void mountShopMarkers(map, sortedItems);

      // When a search center + radius are known, always show the full search area.
      if (lat && lng && radiusKm) {
        const latOff = radiusKm / 111;
        const lngOff = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
        isProgrammaticMoveRef.current = true;
        map.fitBounds(
          new maplibregl.LngLatBounds(
            [lng - lngOff, lat - latOff],
            [lng + lngOff, lat + latOff],
          ),
          { padding: 48, maxZoom: 15, duration: 600 },
        );
        return;
      }

      // Fallback: no search center — fit to available item locations.
      const located = sortedItems.filter(
        (item) => item.shopLat !== null && item.shopLng !== null,
      );
      if (located.length === 0) return;

      const seen = new Set<string>();
      const points = located.filter((item) => {
        if (seen.has(item.shop)) return false;
        seen.add(item.shop);
        return true;
      });

      const lngs = points.map((item) => item.shopLng as number);
      const lats = points.map((item) => item.shopLat as number);
      if (myLng != null) lngs.push(myLng);
      if (myLat != null) lats.push(myLat);

      const bounds = new maplibregl.LngLatBounds(
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      );
      isProgrammaticMoveRef.current = true;

      if (points.length === 1 && myLat == null) {
        map.flyTo({ center: bounds.getCenter(), zoom: 14, duration: 600 });
        return;
      }

      map.fitBounds(bounds, { padding: 80, maxZoom: 14, duration: 600 });
    };

    if (map.isStyleLoaded()) fit();
    else map.once("load", fit);
  }, [sortedItems, myLat, myLng, lat, lng, radiusKm]);

  // Keep the current-location marker in sync with the buyer's actual position.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || myLat == null || myLng == null) return;

    if (locationMarkerRef.current) {
      locationMarkerRef.current.setLngLat([myLng, myLat]);
      return;
    }

    const el = document.createElement("div");
    el.style.cssText = `
      position: relative;
      width: 18px;
      height: 18px;
    `;

    const pulse = document.createElement("div");
    pulse.style.cssText = `
      position: absolute;
      inset: -6px;
      border-radius: 50%;
      background: rgba(59,130,246,0.25);
      animation: location-pulse 1.8s ease-out infinite;
    `;

    const dot = document.createElement("div");
    dot.style.cssText = `
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #3b82f6;
      border: 3px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
    `;

    if (!document.getElementById("location-pulse-style")) {
      const style = document.createElement("style");
      style.id = "location-pulse-style";
      style.textContent = `
        @keyframes location-pulse {
          0%   { transform: scale(0.6); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    el.appendChild(pulse);
    el.appendChild(dot);

    const marker = new maplibregl.Marker({ element: el, anchor: "center" })
      .setLngLat([myLng, myLat])
      .addTo(map);

    locationMarkerRef.current = marker;
  }, [myLat, myLng]);

  // Fly to search center whenever lat/lng change to a new value.
  const prevLocationRef = useRef<{ lat: number; lng: number } | null>(null);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !lat || !lng) return;

    const prev = prevLocationRef.current;
    if (prev && prev.lat === lat && prev.lng === lng) return;
    prevLocationRef.current = { lat, lng };

    const fly = () =>
      programmaticFlyTo(map, isProgrammaticMoveRef, {
        center: [lng, lat],
        zoom: 13,
      });
    if (map.isStyleLoaded()) {
      fly();
    } else {
      map.once("load", fly);
    }
  }, [lat, lng]);

  useEffect(() => {
    if (isVisible) {
      window.setTimeout(() => mapRef.current?.resize(), 0);
    }
  }, [isVisible]);

  const handleNavigate = (index: number) => {
    setActiveIndex(index);
    const map = mapRef.current;
    const item = sortedItems[index];
    if (map && item) {
      flyToItem(map, item, isProgrammaticMoveRef);
    }
  };

  const handleZoomIn = useCallback(() => mapRef.current?.zoomIn(), []);
  const handleZoomOut = useCallback(() => mapRef.current?.zoomOut(), []);

  const handleMyLocation = useCallback(() => {
    const map = mapRef.current;
    if (!map || myLat == null || myLng == null) return;
    programmaticFlyTo(map, isProgrammaticMoveRef, {
      center: [myLng, myLat],
      zoom: 13,
      duration: 800,
    });
  }, [myLat, myLng]);

  const uniqueShopCount = new Set(sortedItems.map((i) => i.shop)).size;
  const resultCount = sortedItems.length;

  return (
    <Box className="results-map" position="relative" h="full">
      <MapView
        initialCenter={[
          initialLngRef.current ?? 77.209,
          initialLatRef.current ?? 28.6139,
        ]}
        initialZoom={initialLatRef.current && initialLngRef.current ? 13 : 4}
        onMapCreated={handleMapCreated}
        h="full"
        overflow="hidden"
      />

      {/* Result count badge — top left, only when an active query is present */}
      {hasQuery && resultCount > 0 && (
        <Box
          position="absolute"
          top={3}
          left={3}
          bg="bg.panel"
          borderWidth="1px"
          borderColor="border.default"
          borderRadius="full"
          px={3}
          py={1}
          shadow="md"
          pointerEvents="none"
        >
          <Text fontSize="xs" fontWeight="medium">
            {resultCount} {resultCount === 1 ? "item" : "items"} across{" "}
            {uniqueShopCount} {uniqueShopCount === 1 ? "shop" : "shops"}
          </Text>
        </Box>
      )}

      {/* Custom map controls — top right */}
      <VStack position="absolute" top={4} right={3} gap={1}>
        <IconButton
          size="sm"
          bg="white"
          color="gray.800"
          borderRadius="md"
          shadow="md"
          aria-label="Zoom in"
          onClick={handleZoomIn}
          _hover={{ bg: "gray.100" }}
        >
          <FiPlus />
        </IconButton>
        <IconButton
          size="sm"
          bg="white"
          color="gray.800"
          borderRadius="md"
          shadow="md"
          aria-label="Zoom out"
          onClick={handleZoomOut}
          _hover={{ bg: "gray.100" }}
        >
          <FiMinus />
        </IconButton>
        {myLat != null && myLng != null && (
          <IconButton
            size="sm"
            bg="white"
            color="gray.800"
            borderRadius="md"
            shadow="md"
            aria-label="Go to my location"
            onClick={handleMyLocation}
            _hover={{ bg: "gray.100" }}
          >
            <FiCrosshair />
          </IconButton>
        )}
      </VStack>

      {activeIndex !== null && resultCount > 0 && (
        <MapItemCarousel
          items={sortedItems}
          activeIndex={activeIndex}
          onNavigate={handleNavigate}
          onClose={() => setActiveIndex(null)}
        />
      )}
    </Box>
  );
};
