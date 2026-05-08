import { Box, Button, Center, Heading, Text, VStack } from "@chakra-ui/react";
import { useCreateShop } from "api/stock-finder";
import { RoutePath } from "app/router/constants";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { DS_MAP_STYLE } from "../../../services/map-style";
import type { ShopDetails } from "../../../hooks/use-onboarding-state";

const INDIA_CENTER: [number, number] = [78.9629, 20.5937];
const INDIA_ZOOM = 5;
const PIN_ZOOM = 16;

interface LocationStepProps {
  shopDetails: ShopDetails;
}

export const LocationStep = ({ shopDetails }: LocationStepProps) => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const { mutate: createShop, isPending } = useCreateShop();

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: DS_MAP_STYLE,
      center: INDIA_CENTER,
      zoom: INDIA_ZOOM,
      attributionControl: false,
    });

    mapRef.current = map;

    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        map.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: PIN_ZOOM,
        });
      },
      () => {
        // Keep the default India center on geolocation failure.
      }
    );

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const handleGps = () => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      mapRef.current?.flyTo({
        center: [pos.coords.longitude, pos.coords.latitude],
        zoom: PIN_ZOOM,
      });
    });
  };

  const handleConfirm = () => {
    const center = mapRef.current?.getCenter();

    if (!center) return;

    createShop(
      {
        name: shopDetails.name,
        phone: shopDetails.whatsapp,
        latitude: center.lat,
        longitude: center.lng,
      },
      {
        onSuccess: () => {
          navigate(RoutePath.OwnerInventory, { replace: true });
        },
      }
    );
  };

  return (
    <VStack className="location-step" gap={4} w="full" maxW="sm" mx="auto">
      <VStack gap={1} w="full">
        <Heading size="lg" textAlign="center">
          Pin your location
        </Heading>
        <Text color="text.secondary" textAlign="center" fontSize="sm">
          Move the map so the pin sits on your shop.
        </Text>
      </VStack>

      <Box
        position="relative"
        w="full"
        h="64"
        borderRadius="xl"
        overflow="hidden"
      >
        <Box
          ref={containerRef}
          className="location-picker-map"
          w="full"
          h="full"
        />
        <Center
          className="location-picker-crosshair"
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          pointerEvents="none"
          zIndex={10}
        >
          <Box transform="translateY(-14px)">
            <svg width="32" height="40" viewBox="0 0 32 40">
              <path
                d="M16 0C7.163 0 0 7.163 0 16c0 10 16 24 16 24s16-14 16-24C32 7.163 24.837 0 16 0z"
                fill="#E53E3E"
              />
              <circle cx="16" cy="16" r="6" fill="white" />
            </svg>
          </Box>
        </Center>
      </Box>

      <Button size="sm" variant="outline" onClick={handleGps} w="full">
        Use my current location
      </Button>

      <Button
        w="full"
        bg="intent.primary"
        color="text.onIntent"
        onClick={handleConfirm}
        loading={isPending}
        disabled={isPending}
      >
        Confirm — create shop
      </Button>
    </VStack>
  );
};
