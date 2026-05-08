import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Input,
  InputGroup,
  Portal,
  Text,
} from "@chakra-ui/react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { DS_MAP_STYLE } from "../../services/map-style";
import { useEffect, useRef, useState } from "react";
import { FiSearch } from "react-icons/fi";

interface LocationPickerDialogProps {
  isOpen: boolean;
  currentLat?: number;
  currentLng?: number;
  onClose: () => void;
  onConfirm: (location: { lat: number; lng: number }) => void;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

const PIN_COLOR = "#ef4444";

const CrosshairPin = () => (
  <Box
    className="location-crosshair-pin"
    position="absolute"
    top="50%"
    left="50%"
    transform="translate(-50%, -100%)"
    pointerEvents="none"
    zIndex={1}
  >
    <svg
      width="32"
      height="44"
      viewBox="0 0 32 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16 0C7.16 0 0 7.16 0 16C0 28 16 44 16 44C16 44 32 28 32 16C32 7.16 24.84 0 16 0Z"
        fill={PIN_COLOR}
      />
      <circle cx="16" cy="16" r="6" fill="white" />
    </svg>
  </Box>
);

export const LocationPickerDialog = ({
  isOpen,
  currentLat,
  currentLng,
  onClose,
  onConfirm,
}: LocationPickerDialogProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const searchTimeoutRef = useRef<number | undefined>(undefined);

  const [addressQuery, setAddressQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) return;
    const id = window.setTimeout(() => {
      setAddressQuery("");
      setSearchResults([]);
      setSearchOpen(false);
    }, 0);
    return () => window.clearTimeout(id);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      mapRef.current?.remove();
      mapRef.current = null;
      return;
    }

    // Wait one tick for the Portal to mount the container in the DOM.
    const timer = window.setTimeout(() => {
      if (!containerRef.current || mapRef.current) return;

      const map = new maplibregl.Map({
        container: containerRef.current,
        style: DS_MAP_STYLE,
        center: [currentLng ?? 77.209, currentLat ?? 28.6139],
        zoom: 13,
      });
      mapRef.current = map;

      map.on("load", () => map.resize());
    }, 50);

    return () => {
      window.clearTimeout(timer);
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [isOpen, currentLat, currentLng]);

  // Close search dropdown when clicking outside.
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (!searchContainerRef.current?.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  const handleAddressInput = (query: string) => {
    setAddressQuery(query);
    setSearchOpen(true);
    window.clearTimeout(searchTimeoutRef.current);

    if (query.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    searchTimeoutRef.current = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
          { headers: { "Accept-Language": "en" } }
        );
        const results = (await response.json()) as NominatimResult[];
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      }
    }, 400);
  };

  const selectAddress = (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    mapRef.current?.jumpTo({ center: [lng, lat], zoom: 15 });
    setAddressQuery(result.display_name);
    setSearchResults([]);
    setSearchOpen(false);
  };

  const handleConfirm = () => {
    const map = mapRef.current;
    if (!map) return;
    const { lat, lng } = map.getCenter();
    onConfirm({ lat, lng });
    onClose();
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(event) => !event.open && onClose()}
      placement="center"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="560px" w="full">
            <Dialog.Header>
              <Dialog.Title>Choose your location</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body p={0}>
              <Box px={4} pb={3} ref={searchContainerRef} position="relative">
                <InputGroup startElement={<FiSearch size={14} />}>
                  <Input
                    value={addressQuery}
                    onChange={(e) => handleAddressInput(e.target.value)}
                    onFocus={() =>
                      searchResults.length > 0 && setSearchOpen(true)
                    }
                    placeholder="Search for an address or area..."
                    size="sm"
                  />
                </InputGroup>

                {searchOpen && searchResults.length > 0 && (
                  <Box
                    position="absolute"
                    top="calc(100% - 4px)"
                    left={4}
                    right={4}
                    zIndex={10}
                    bg="bg.panel"
                    borderWidth="1px"
                    borderColor="border.default"
                    borderRadius="md"
                    shadow="lg"
                    overflow="hidden"
                  >
                    {searchResults.map((result) => (
                      <Box
                        key={result.place_id}
                        px={3}
                        py={2.5}
                        cursor="pointer"
                        _hover={{ bg: "bg.muted" }}
                        onMouseDown={(e) => {
                          // Prevent input blur before select fires.
                          e.preventDefault();
                          selectAddress(result);
                        }}
                      >
                        <Text fontSize="sm" lineClamp={2}>
                          {result.display_name}
                        </Text>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>

              <Text px={4} pb={3} fontSize="xs" color="fg.muted">
                Drag the map so the pin is on your location, then confirm.
              </Text>

              <Box position="relative" h="340px">
                <Box ref={containerRef} w="full" h="full" />
                <CrosshairPin />
              </Box>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="solid" onClick={handleConfirm}>
                Use this location
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
