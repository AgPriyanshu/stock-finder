import { Box, Button, Flex, HStack, Text, VStack } from "@chakra-ui/react";
import type { SfSearchParams } from "api/stock-finder";
import { useCategories, useSearchItems } from "api/stock-finder";
import { toaster } from "design-system/toaster/toaster-instance";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useSeo } from "shared/hooks/use-seo";
import {
  getOwnerToken,
  getSavedSearchLocation,
  setSavedSearchLocation,
} from "shared/local-storage";
import { useBuyerLocation } from "../../hooks/use-buyer-location";
import { BrandHeading } from "../brand-heading";
import { ViewToggle, type SearchView } from "./_view-toggle";
import { FilterChips } from "./filter-chips";
import { LocationPickerDialog } from "./location-picker-dialog";
import { ResultsList } from "./results-list";
import { ResultsMap } from "./results-map";
import { SearchBar } from "./search-bar";
import { flattenResults } from "./search-utils";

const numberParam = (value: string | null) =>
  value === null || value === "" ? undefined : Number(value);

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const buyerLocation = useBuyerLocation();
  const { data: categories = [] } = useCategories();
  const navigate = useNavigate();
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [customLocationLabel, setCustomLocationLabel] = useState<string | null>(
    () => getSavedSearchLocation()?.label ?? null,
  );

  const view = (searchParams.get("view") || "map") as SearchView;
  const params: SfSearchParams = useMemo(
    () => ({
      q: searchParams.get("q") || undefined,
      lat: numberParam(searchParams.get("lat")),
      lng: numberParam(searchParams.get("lng")),
      radiusKm: numberParam(searchParams.get("radiusKm")) ?? 5,
      category: searchParams.get("category") || undefined,
      minPrice: numberParam(searchParams.get("minPrice")),
      maxPrice: numberParam(searchParams.get("maxPrice")),
      sort: (searchParams.get("sort") as SfSearchParams["sort"]) || "distance",
    }),
    [searchParams],
  );

  useEffect(() => {
    if (searchParams.get("lat") || searchParams.get("lng")) return;
    const saved = getSavedSearchLocation();
    if (!saved) return;
    const next = new URLSearchParams(searchParams);
    next.set("lat", String(saved.lat));
    next.set("lng", String(saved.lng));
    next.set("radiusKm", next.get("radiusKm") || "5");
    setSearchParams(next, { replace: true });
    // Run once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      buyerLocation.isLoading ||
      buyerLocation.lat === null ||
      buyerLocation.lng === null
    )
      return;

    const newLat = String(buyerLocation.lat);
    const newLng = String(buyerLocation.lng);

    if (buyerLocation.source === "gps" && customLocationLabel === null) {
      // GPS is the most accurate source — always sync it to the URL so that
      // distance calculations match the blue dot, even if stale URL params exist.
      if (
        searchParams.get("lat") === newLat &&
        searchParams.get("lng") === newLng
      )
        return;
      const next = new URLSearchParams(searchParams);
      next.set("lat", newLat);
      next.set("lng", newLng);
      next.set("radiusKm", next.get("radiusKm") || "5");
      setSearchParams(next, { replace: true });
    } else if (!searchParams.get("lat") && !searchParams.get("lng")) {
      // IP-based fallback: only set if the URL has no location at all.
      const next = new URLSearchParams(searchParams);
      next.set("lat", newLat);
      next.set("lng", newLng);
      next.set("radiusKm", next.get("radiusKm") || "5");
      setSearchParams(next, { replace: true });
    }
  }, [buyerLocation, customLocationLabel, searchParams, setSearchParams]);

  const updateParams = useCallback(
    (patch: Partial<SfSearchParams> & { view?: SearchView }) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(patch).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      });
      setSearchParams(next);
    },
    [searchParams, setSearchParams],
  );

  const handleLocationConfirm = useCallback(
    async ({ lat, lng }: { lat: number; lng: number }) => {
      updateParams({ lat, lng });
      setCustomLocationLabel("Custom location");
      setSavedSearchLocation({ lat, lng, label: "Custom location" });
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=14`,
          { headers: { "Accept-Language": "en" } },
        );
        const data = (await response.json()) as {
          address?: {
            suburb?: string;
            neighbourhood?: string;
            city_district?: string;
            city?: string;
            town?: string;
            village?: string;
          };
        };
        const addr = data.address ?? {};
        const label =
          addr.suburb ??
          addr.neighbourhood ??
          addr.city_district ??
          addr.city ??
          addr.town ??
          addr.village ??
          "Custom location";
        setCustomLocationLabel(label);
        setSavedSearchLocation({ lat, lng, label });
      } catch {
        // Keep "Custom location" as fallback.
      }
    },
    [updateParams],
  );

  // Wait for location to resolve. If a location was found, also wait until
  // the useEffect above has written it into the URL (params.lat will be set).
  // This prevents a wasted query firing before coordinates are available.
  const locationReady =
    !buyerLocation.isLoading &&
    (buyerLocation.lat === null || params.lat !== undefined);
  const searchQuery = useSearchItems(params, {
    enabled: locationReady,
  });
  const items = flattenResults(searchQuery.data?.pages);

  const prevLoadingRef = useRef(false);
  useEffect(() => {
    const wasLoading = prevLoadingRef.current;
    prevLoadingRef.current = searchQuery.isLoading;
    if (
      wasLoading &&
      !searchQuery.isLoading &&
      items.length === 0 &&
      !!params.q
    ) {
      toaster.info({
        title: "No results found",
        description: "Try a different keyword, category, or location.",
      });
    }
  }, [searchQuery.isLoading, items.length, params.q]);

  const locationLabel =
    customLocationLabel ??
    (!buyerLocation.isLoading ? buyerLocation.label : undefined);

  const seoTitle = params.q
    ? `${params.q} near ${locationLabel ?? "you"}`
    : undefined;
  const seoDescription = params.q
    ? `Find shops near you selling "${params.q}". Browse inventory, compare prices, and contact sellers directly on Stock Finder.`
    : undefined;
  useSeo({ title: seoTitle, description: seoDescription });

  return (
    <VStack className="search-page" align="stretch" gap={0} h="full">
      <Box
        position="sticky"
        top={0}
        zIndex={5}
        bg="surface.page"
        borderBottomWidth="1px"
        borderColor="border.default"
        px={{ base: 3, md: 4 }}
        py={{ base: 2, md: 3 }}
      >
        <HStack
          justify="center"
          mb={{ base: 2, md: 3 }}
          mt={{ base: 2, md: 3 }}
        >
          <Link to="/">
            <BrandHeading size="2xl" />
          </Link>
        </HStack>
        <HStack
          justify="space-between"
          align="flex-start"
          wrap="wrap"
          gap={{ base: 2, md: 4 }}
        >
          <VStack
            align="stretch"
            gap={2}
            maxW="2xl"
            flex={1}
            minW={{ base: "full", md: "0" }}
          >
            <Flex
              gap={{ base: 2, md: 3 }}
              align="stretch"
              direction={{ base: "column", sm: "row" }}
            >
              <Box flex={1} minW={0}>
                <SearchBar
                  value={params.q || ""}
                  onChange={(q) => updateParams({ q: q || undefined })}
                />
              </Box>
              <Box alignSelf={{ base: "stretch", sm: "center" }}>
                <ViewToggle
                  value={view}
                  onChange={(nextView) => updateParams({ view: nextView })}
                />
              </Box>
            </Flex>
            <FilterChips
              params={params}
              categories={categories}
              onChange={updateParams}
              locationLabel={locationLabel}
              onEditLocation={() => setLocationPickerOpen(true)}
            />
          </VStack>

          <VStack
            gap={1}
            align={{ base: "stretch", md: "end" }}
            flexShrink={0}
            pt={1}
            w={{ base: "full", md: "auto" }}
          >
            {getOwnerToken() ? (
              <>
                <Text fontSize="xs" color="fg.muted" whiteSpace="nowrap">
                  Shop owner
                </Text>
                <Button size="xs" onClick={() => navigate("/owner/inventory")}>
                  My inventory
                </Button>
              </>
            ) : (
              <>
                <Text fontSize="xs" color="fg.muted" whiteSpace="nowrap">
                  Get your business discovered. List it free
                </Text>
                <HStack gap={2}>
                  <Button asChild size="xs" variant="outline">
                    <Link to="/register">Sign up</Link>
                  </Button>
                  <Button size="xs" onClick={() => navigate("/login")}>
                    Login
                  </Button>
                </HStack>
              </>
            )}
          </VStack>
        </HStack>
      </Box>

      <Box
        flex={1}
        minH={0}
        overflow="hidden"
        px={view === "map" ? 0 : 4}
        py={view === "map" ? 0 : 4}
      >
        <Box
          display={view === "list" ? "block" : "none"}
          h="full"
          overflowY="auto"
        >
          <ResultsList
            query={searchQuery}
            radiusKm={params.radiusKm || 5}
            onExpandRadius={() => updateParams({ radiusKm: 10 })}
          />
        </Box>
        <Box display={view === "map" ? "block" : "none"} h="full">
          <ResultsMap
            items={items}
            lat={params.lat}
            lng={params.lng}
            myLat={params.lat ?? null}
            myLng={params.lng ?? null}
            isVisible={view === "map"}
            hasQuery={!!params.q}
          />
        </Box>
      </Box>

      <LocationPickerDialog
        isOpen={locationPickerOpen}
        currentLat={params.lat}
        currentLng={params.lng}
        onClose={() => setLocationPickerOpen(false)}
        onConfirm={handleLocationConfirm}
      />
    </VStack>
  );
};
