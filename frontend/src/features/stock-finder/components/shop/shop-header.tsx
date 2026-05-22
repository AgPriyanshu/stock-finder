import {
  Badge,
  Box,
  Button,
  HStack,
  Heading,
  Image,
  Text,
  VStack,
} from "@chakra-ui/react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { FiMap, FiMessageCircle, FiPhone, FiStar } from "react-icons/fi";
import type { SfShop } from "api/stock-finder";
import { PhotoViewer } from "./photo-viewer";

const RatingStars = ({ avg, count }: { avg: number; count?: number }) => {
  if (!avg || avg === 0) return null;
  const full = Math.floor(avg);
  return (
    <HStack gap={1} align="center">
      {[1, 2, 3, 4, 5].map((s) => (
        <Box
          key={s}
          as={FiStar}
          color={s <= full ? "yellow.400" : "fg.muted"}
          fill={s <= full ? "currentColor" : "none"}
          boxSize="14px"
        />
      ))}
      <Text fontSize="xs" color="text.secondary">
        {avg.toFixed(1)}{count ? ` (${count})` : ""}
      </Text>
    </HStack>
  );
};

interface ShopHeaderProps {
  shop: SfShop;
}

export const ShopHeader = ({ shop }: ShopHeaderProps) => {
  const [viewerOpen, setViewerOpen] = useState(false);
  const coverImage = shop.images?.find((img) => img.isPrimary) ?? shop.images?.[0];
  const images = shop.images ?? [];

  const whatsappUrl = `https://wa.me/${shop.phone}?text=${encodeURIComponent(
    `Hi, I found ${shop.name} on Dead Stock Finder.`
  )}`;
  const directionsUrl =
    shop.lat !== null && shop.lng !== null
      ? `https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}`
      : undefined;

  return (
    <>
    <Box
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="md"
      p={5}
      bg="bg.panel"
    >
      <HStack gap={4} align="start">
        {coverImage?.url && (
          <Box
            flexShrink={0}
            boxSize={{ base: "80px", md: "100px" }}
            borderRadius="md"
            overflow="hidden"
            bg="bg.muted"
            cursor="pointer"
            onClick={() => setViewerOpen(true)}
            _hover={{ opacity: 0.85 }}
            transition="opacity 150ms ease"
            position="relative"
          >
            <Image
              src={coverImage.url}
              alt={shop.name}
              w="full"
              h="full"
              objectFit="cover"
            />
            {images.length > 1 && (
              <Box
                position="absolute"
                bottom={1}
                right={1}
                bg="blackAlpha.700"
                color="white"
                fontSize="10px"
                fontWeight="medium"
                px={1}
                borderRadius="sm"
                lineHeight="1.6"
              >
                +{images.length - 1}
              </Box>
            )}
          </Box>
        )}
        <VStack align="stretch" gap={4} flex={1} minW={0}>
          <Box>
            <HStack gap={2} wrap="wrap">
              <Heading size="lg">{shop.name}</Heading>
              {shop.isVerified && (
                <Badge bg="intent.success" color="text.onIntent" border="none">
                  Verified
                </Badge>
              )}
            </HStack>
            <HStack gap={3} wrap="wrap">
              <Text color="text.secondary">
                Updated{" "}
                {formatDistanceToNow(new Date(shop.updatedAt), { addSuffix: true })}
              </Text>
              <RatingStars avg={parseFloat(shop.ratingAvg)} />
            </HStack>
            <Text color="text.secondary">
              {[shop.address, shop.city, shop.pincode]
                .filter(Boolean)
                .join(", ") ||
                (shop.lat !== null && shop.lng !== null
                  ? `${shop.lat.toFixed(4)}°N, ${shop.lng.toFixed(4)}°E`
                  : "Location not set")}
            </Text>
          </Box>
          <HStack gap={2} wrap="wrap">
            <Button asChild>
              <a href={`tel:${shop.phone}`}>
                <FiPhone /> Call
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href={whatsappUrl} target="_blank" rel="noreferrer">
                <FiMessageCircle /> WhatsApp
              </a>
            </Button>
            {directionsUrl && (
              <Button asChild variant="outline">
                <a href={directionsUrl} target="_blank" rel="noreferrer">
                  <FiMap /> Directions
                </a>
              </Button>
            )}
          </HStack>
        </VStack>
      </HStack>
    </Box>

    {images.length > 0 && (
      <PhotoViewer
        images={images}
        initialIndex={0}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    )}
  </>
  );
};
