import { Box } from "@chakra-ui/react";
import type { BoxProps } from "@chakra-ui/react";
import maplibregl from "maplibre-gl";
import type { Map as MapLibreMap, StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";

export type { Map as MapLibreMap } from "maplibre-gl";

const GOOGLE_MAPS_STYLE: StyleSpecification = {
  version: 8,
  glyphs: "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
  sources: {
    "google-maps": {
      type: "raster",
      tiles: [
        "https://mt0.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
        "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
        "https://mt2.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
        "https://mt3.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
      ],
      tileSize: 256,
      attribution: "© Google Maps",
    },
  },
  layers: [
    {
      id: "google-maps-base",
      type: "raster",
      source: "google-maps",
    },
  ],
};

export interface MapViewProps extends Omit<BoxProps, "ref"> {
  /** Initial map center as [lng, lat]. Defaults to India. */
  initialCenter?: [number, number];
  initialZoom?: number;
  interactive?: boolean;
  /**
   * Called once after the map is created. Return a cleanup function to run
   * before the map is destroyed (e.g. to remove markers).
   */
  onMapCreated?: (map: MapLibreMap) => (() => void) | void;
}

export const MapView = ({
  initialCenter = [77.209, 28.6139],
  initialZoom = 13,
  interactive = true,
  onMapCreated,
  ...boxProps
}: MapViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const map = new maplibregl.Map({
      container,
      style: GOOGLE_MAPS_STYLE,
      center: initialCenter,
      zoom: initialZoom,
      interactive,
      attributionControl: false,
    });

    const cleanup = onMapCreated?.(map);

    return () => {
      cleanup?.();
      map.remove();
    };
    // Intentionally run once on mount only — consumers drive subsequent updates via mapRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Box ref={containerRef} {...boxProps} />;
};
