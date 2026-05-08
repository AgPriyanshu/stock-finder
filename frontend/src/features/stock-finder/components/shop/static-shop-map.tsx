import { Box } from "@chakra-ui/react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import type { SfShop } from "api/stock-finder";
import { DS_MAP_STYLE } from "../../services/map-style";

interface StaticShopMapProps {
  shop: SfShop;
}

export const StaticShopMap = ({ shop }: StaticShopMapProps) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current || shop.lat === null || shop.lng === null) return;

    const map = new maplibregl.Map({
      container: ref.current,
      style: DS_MAP_STYLE,
      center: [shop.lng, shop.lat],
      zoom: 14.5,
      interactive: false,
      attributionControl: false,
    });

    map.setPadding({ top: 80, bottom: 40, left: 40, right: 40 });

    const addressLabel = [shop.address, shop.city, shop.pincode]
      .filter(Boolean)
      .join(", ");

    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      anchor: "bottom",
      offset: [0, -48],
      maxWidth: "240px",
    })
      .setHTML(
        `<span style="font-size:12px;font-weight:500;color:#111;">${addressLabel || shop.name}</span>`
      )
      .setLngLat([shop.lng, shop.lat]);

    const marker = new maplibregl.Marker({ color: "#ef4444" })
      .setLngLat([shop.lng, shop.lat])
      .addTo(map);

    map.on("load", () => popup.addTo(map));

    return () => {
      popup.remove();
      marker.remove();
      map.remove();
    };
  }, [shop.lat, shop.lng, shop.address, shop.city, shop.pincode, shop.name]);

  if (shop.lat === null || shop.lng === null) return null;

  return <Box ref={ref} h="220px" borderRadius="md" overflow="hidden" />;
};
