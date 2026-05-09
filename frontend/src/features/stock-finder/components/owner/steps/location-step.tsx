import {
  Box,
  Button,
  Center,
  Heading,
  Input,
  InputGroup,
  List,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useCreateShop } from "api/stock-finder";
import { RoutePath } from "app/router/constants";
import { useEffect, useRef, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router";
import { MapView } from "shared/components/map-view";
import type { MapLibreMap } from "shared/components/map-view";
import type { ShopDetails } from "../../../hooks/use-onboarding-state";

const INDIA_CENTER: [number, number] = [78.9629, 20.5937];
const INDIA_ZOOM = 5;
const PIN_ZOOM = 16;

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationStepProps {
  shopDetails: ShopDetails;
}

export const LocationStep = ({ shopDetails }: LocationStepProps) => {
  const navigate = useNavigate();
  const mapRef = useRef<MapLibreMap | null>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { mutate: createShop, isPending } = useCreateShop();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");


  const searchAddress = (value: string) => {
    setQuery(value);
    setSelectedAddress("");

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    if (value.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    searchTimerRef.current = setTimeout(async () => {
      setIsSearching(true);

      try {
        const params = new URLSearchParams({
          q: value,
          format: "json",
          limit: "5",
          countrycodes: "in",
        });

        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?${params}`,
          { headers: { "Accept-Language": "en" } },
        );
        const data: NominatimResult[] = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
  };

  const handleSelectSuggestion = (result: NominatimResult) => {
    setQuery(result.display_name);
    setSelectedAddress(result.display_name);
    setShowSuggestions(false);
    setSuggestions([]);
    mapRef.current?.flyTo({
      center: [parseFloat(result.lon), parseFloat(result.lat)],
      zoom: PIN_ZOOM,
    });
  };

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const params = new URLSearchParams({ lat: String(lat), lon: String(lon), format: "json" });
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, {
        headers: { "Accept-Language": "en" },
      });
      const data = await res.json();
      const addr: string = data.display_name ?? "";
      setQuery(addr);
      setSelectedAddress(addr);
    } catch {
      setSelectedAddress("");
    }
  };

  const handleGps = () => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      mapRef.current?.flyTo({
        center: [pos.coords.longitude, pos.coords.latitude],
        zoom: PIN_ZOOM,
      });
      reverseGeocode(pos.coords.latitude, pos.coords.longitude);
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
        address: selectedAddress,
      },
      {
        onSuccess: () => {
          navigate(RoutePath.OwnerInventory, { replace: true });
        },
      },
    );
  };

  return (
    <VStack className="location-step" gap={4} w="full" maxW="sm" mx="auto">
      <VStack gap={1} w="full">
        <Heading size="lg" textAlign="center">
          Pin your location
        </Heading>
        <Text color="text.secondary" textAlign="center" fontSize="sm">
          Search for your address
        </Text>
      </VStack>

      {/* Address search */}
      <Box position="relative" w="full">
        <InputGroup
          startElement={isSearching ? <Spinner size="xs" /> : <FiSearch />}
        >
          <Input
            placeholder="Search address or landmark…"
            value={query}
            onChange={(e) => searchAddress(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            autoComplete="off"
          />
        </InputGroup>

        {showSuggestions && suggestions.length > 0 && (
          <Box
            position="absolute"
            top="100%"
            left={0}
            right={0}
            mt={1}
            bg="bg.panel"
            borderWidth="1px"
            borderColor="border.default"
            borderRadius="md"
            zIndex={20}
            maxH="200px"
            overflowY="auto"
            shadow="md"
          >
            <List.Root listStyle="none" p={0}>
              {suggestions.map((s) => (
                <List.Item
                  key={s.place_id}
                  px={3}
                  py={2}
                  fontSize="sm"
                  cursor="pointer"
                  _hover={{ bg: "bg.subtle" }}
                  onMouseDown={() => handleSelectSuggestion(s)}
                >
                  {s.display_name}
                </List.Item>
              ))}
            </List.Root>
          </Box>
        )}
      </Box>

      {/* Map with crosshair pin */}
      <Box
        position="relative"
        w="full"
        h="96"
        borderRadius="xl"
        overflow="hidden"
      >
        <MapView
          initialCenter={INDIA_CENTER}
          initialZoom={INDIA_ZOOM}
          onMapCreated={(map) => {
            mapRef.current = map;
            navigator.geolocation?.getCurrentPosition(
              (pos) => {
                map.flyTo({
                  center: [pos.coords.longitude, pos.coords.latitude],
                  zoom: PIN_ZOOM,
                });
              },
              () => {},
            );
            return () => {
              mapRef.current = null;
            };
          }}
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
          <Box transform="translateY(-10px)">
            <svg width="24" height="30" viewBox="0 0 32 40">
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
        Create Shop
      </Button>
    </VStack>
  );
};
