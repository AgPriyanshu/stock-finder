import {
  Badge,
  Box,
  Button,
  HStack,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";
import { formatDistanceToNow } from "date-fns";
import { FiMap, FiMessageCircle, FiPhone } from "react-icons/fi";
import type { SfShop } from "api/stock-finder";

interface ShopHeaderProps {
  shop: SfShop;
}

export const ShopHeader = ({ shop }: ShopHeaderProps) => {
  const whatsappUrl = `https://wa.me/${shop.phone}?text=${encodeURIComponent(
    `Hi, I found ${shop.name} on Dead Stock Finder.`
  )}`;
  const directionsUrl =
    shop.lat !== null && shop.lng !== null
      ? `https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}`
      : undefined;

  return (
    <Box
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="md"
      p={5}
      bg="bg.panel"
    >
      <VStack align="stretch" gap={4}>
        <Box>
          <HStack gap={2} wrap="wrap">
            <Heading size="lg">{shop.name}</Heading>
            {shop.isVerified && (
              <Badge bg="intent.success" color="text.onIntent" border="none">
                Verified
              </Badge>
            )}
          </HStack>
          <Text color="text.secondary">
            Updated{" "}
            {formatDistanceToNow(new Date(shop.updatedAt), { addSuffix: true })}
          </Text>
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
    </Box>
  );
};
