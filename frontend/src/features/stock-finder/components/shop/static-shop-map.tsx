import maplibregl from "maplibre-gl";
import type { SfShop } from "api/stock-finder";
import { MapView } from "shared/components/map-view";

interface StaticShopMapProps {
  shop: SfShop;
}

export const StaticShopMap = ({ shop }: StaticShopMapProps) => {
  if (shop.lat === null || shop.lng === null) return null;

  const { lat, lng } = shop;
  const addressLabel = [shop.address, shop.city, shop.pincode]
    .filter(Boolean)
    .join(", ");

  return (
    <MapView
      key={`${lat}-${lng}`}
      initialCenter={[lng, lat]}
      initialZoom={14.5}
      interactive={false}
      onMapCreated={(map) => {
        map.setPadding({ top: 80, bottom: 40, left: 40, right: 40 });

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
          .setLngLat([lng, lat]);

        const marker = new maplibregl.Marker({ color: "#ef4444" })
          .setLngLat([lng, lat])
          .addTo(map);

        map.on("load", () => popup.addTo(map));

        return () => {
          popup.remove();
          marker.remove();
        };
      }}
      h={{ base: "180px", md: "220px" }}
      borderRadius="md"
      overflow="hidden"
    />
  );
};
