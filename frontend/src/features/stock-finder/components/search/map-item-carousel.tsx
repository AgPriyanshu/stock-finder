import {
  Badge,
  Box,
  Button,
  HStack,
  IconButton,
  Image,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router";
import {
  FiChevronLeft,
  FiChevronRight,
  FiMapPin,
  FiMessageCircle,
  FiPhone,
  FiX,
} from "react-icons/fi";
import type { SfSearchItem } from "api/stock-finder";
import { ItemPlaceholder } from "../item-placeholder";

interface MapItemCarouselProps {
  items: SfSearchItem[];
  activeIndex: number;
  onNavigate: (index: number) => void;
  onClose: () => void;
}

const formatDistance = (distanceM: number | null) => {
  if (distanceM === null) return null;
  return distanceM < 1000
    ? `${Math.round(distanceM)} m`
    : `${(distanceM / 1000).toFixed(1)} km`;
};

export const MapItemCarousel = ({
  items,
  activeIndex,
  onNavigate,
  onClose,
}: MapItemCarouselProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const item = items[activeIndex];
  if (!item) return null;

  const primaryImage =
    item.images.find((img) => img.isPrimary)?.cardUrl ??
    item.images[0]?.cardUrl ??
    item.images[0]?.thumbUrl;
  const whatsappUrl = `https://wa.me/${item.shopPhone}?text=${encodeURIComponent(`Hi, is "${item.name}" still available?`)}`;
  const distance = formatDistance(item.distanceM);

  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex < items.length - 1;

  return (
    <Box
      className="map-item-carousel"
      position="absolute"
      bottom={0}
      left="50%"
      transform="translateX(-50%)"
      w={{ base: "90%", md: "33.333%" }}
      pb={3}
      pt={2}
      bg="transparent"
      pointerEvents="none"
    >
      <Box
        bg="bg.panel"
        borderRadius="xl"
        borderWidth="1px"
        borderColor="border.default"
        shadow="2xl"
        overflow="hidden"
        pointerEvents="auto"
      >
        {/* Header row: counter + close */}
        <HStack justify="space-between" px={4} pt={3} pb={1}>
          <Text fontSize="xs" color="fg.muted" fontWeight="medium">
            {activeIndex + 1} / {items.length}
          </Text>
          <IconButton
            size="xs"
            variant="ghost"
            aria-label="Close"
            onClick={onClose}
          >
            <FiX />
          </IconButton>
        </HStack>

        {/* Card content */}
        <HStack align="stretch" gap={0}>
          {/* Prev button */}
          <Box
            display="flex"
            alignItems="center"
            pl={2}
            pr={1}
            opacity={hasPrev ? 1 : 0.6}
            cursor={hasPrev ? "pointer" : "disabled"}
          >
            <IconButton
              size="sm"
              variant="ghost"
              aria-label="Previous item"
              onClick={() => onNavigate(activeIndex - 1)}
              disabled={!hasPrev}
            >
              <FiChevronLeft />
            </IconButton>
          </Box>

          {/* Clickable image + info — navigates to shop */}
          <Box
            display="flex"
            flex={1}
            minW={0}
            cursor="pointer"
            onClick={() =>
              navigate(`/shops/${item.shop}`, {
                state: { from: location, highlightItemId: item.id },
              })
            }
          >
            <Box w="100px" flexShrink={0} bg="bg.muted">
              {primaryImage ? (
                <Image
                  src={primaryImage}
                  alt={item.name}
                  w="full"
                  h="full"
                  minH="110px"
                  objectFit="cover"
                />
              ) : (
                <ItemPlaceholder
                  categorySlug={item.categorySlug}
                  itemName={item.name}
                  minH="110px"
                />
              )}
            </Box>

            <VStack align="stretch" gap={2} p={3} flex={1} minW={0}>
              <Box>
                <HStack
                  justify="space-between"
                  gap={2}
                  align="center"
                  w={"full"}
                >
                  <Text
                    fontWeight="semibold"
                    fontSize="sm"
                    lineClamp={1}
                    flex={1}
                  >
                    {item.name}
                  </Text>
                  {item.price ? (
                    <Text fontWeight="bold" fontSize="sm" flexShrink={0}>
                      ₹{item.price}
                    </Text>
                  ) : (
                    <Button
                      asChild
                      size="2xs"
                      variant="outline"
                      flexShrink={0}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <a href={whatsappUrl} target="_blank" rel="noreferrer">
                        Ask price
                      </a>
                    </Button>
                  )}
                </HStack>
                <Text fontSize="xs" color="fg.muted" lineClamp={1}>
                  {item.shopName}
                </Text>
              </Box>

              <HStack gap={1.5} wrap="wrap">
                {item.condition === "new" ? (
                  <Badge size="sm" variant="subtle" color="green.500">
                    New
                  </Badge>
                ) : (
                  <Badge size="sm" variant="subtle">
                    {item.condition.replace("_", " ")}
                  </Badge>
                )}
                {distance && (
                  <Badge size="sm" variant="subtle">
                    <FiMapPin /> {distance}
                  </Badge>
                )}
              </HStack>

              <HStack gap={1.5} wrap="wrap" mt="auto">
                <a
                  href={`tel:${item.shopPhone}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconButton size="xs" variant="outline" aria-label="Call">
                    <FiPhone />
                  </IconButton>
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconButton size="xs" variant="outline" aria-label="WhatsApp">
                    <FiMessageCircle />
                  </IconButton>
                </a>
              </HStack>
            </VStack>
          </Box>

          {/* Next button */}
          <Box
            display="flex"
            alignItems="center"
            pr={2}
            pl={1}
            opacity={hasNext ? 1 : 0.6}
            cursor={hasNext ? "pointer" : "disabled"}
          >
            <IconButton
              size="sm"
              variant="ghost"
              aria-label="Next item"
              onClick={() => onNavigate(activeIndex + 1)}
              disabled={!hasNext}
            >
              <FiChevronRight />
            </IconButton>
          </Box>
        </HStack>

        <Box h={3} />
      </Box>
    </Box>
  );
};
