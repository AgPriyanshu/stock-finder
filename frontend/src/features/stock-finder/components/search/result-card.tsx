import {
  Badge,
  Box,
  Button,
  HStack,
  Image,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Link, useLocation } from "react-router";
import {
  FiMapPin,
  FiMessageCircle,
  FiPhone,
  FiShoppingBag,
} from "react-icons/fi";
import type { SfSearchItem } from "api/stock-finder";
import { ItemPlaceholder } from "../item-placeholder";

interface ResultCardProps {
  item: SfSearchItem;
  onContact?: (item: SfSearchItem) => void;
  contactDisabled?: boolean;
  compact?: boolean;
  hideShopLink?: boolean;
}

const formatDistance = (distanceM: number | null) => {
  if (distanceM === null) {
    return "Distance unavailable";
  }
  return distanceM < 1000
    ? `${Math.round(distanceM)} m`
    : `${(distanceM / 1000).toFixed(1)} km`;
};

export const ResultCard = ({
  item,
  onContact,
  contactDisabled,
  compact,
  hideShopLink,
}: ResultCardProps) => {
  const location = useLocation();
  const primaryImage =
    item.images.find((image) => image.isPrimary)?.cardUrl ||
    item.images[0]?.cardUrl ||
    item.images[0]?.thumbUrl;
  const whatsappText = encodeURIComponent(
    `Hi, is "${item.name}" still available?`,
  );
  const whatsappUrl = `https://wa.me/${item.shopPhone}?text=${whatsappText}`;

  return (
    <Box
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="md"
      bg="bg.panel"
      overflow="hidden"
    >
      <HStack align="stretch" gap={0}>
        <Box
          w={compact ? "96px" : { base: "112px", md: "160px" }}
          bg="bg.muted"
        >
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={item.name}
              w="full"
              h="full"
              minH={compact ? "96px" : "132px"}
              objectFit="cover"
            />
          ) : (
            <ItemPlaceholder
              categorySlug={item.categorySlug}
              itemName={item.name}
              minH={compact ? "96px" : "132px"}
            />
          )}
        </Box>
        <VStack align="stretch" gap={2} p={4} flex={1}>
          <HStack justify="space-between" align="start" gap={3}>
            <Box>
              <Text fontWeight="semibold" lineClamp={1}>
                {item.name}
              </Text>
              <Text color="text.secondary" fontSize="sm" lineClamp={1}>
                {item.shopName}
              </Text>
            </Box>
            {item.price ? (
              <Text fontWeight="bold" flexShrink={0}>₹{item.price}</Text>
            ) : (
              <Button asChild size="xs" variant="outline" flexShrink={0}>
                <a href={whatsappUrl} target="_blank" rel="noreferrer">
                  Ask price
                </a>
              </Button>
            )}
          </HStack>
          <HStack gap={2} wrap="wrap">
            {item.condition === "new" ? (
              <Badge variant="subtle" color="green.500">
                New
              </Badge>
            ) : (
              <Badge variant="subtle">{item.condition.replace("_", " ")}</Badge>
            )}
            <Badge variant="subtle">
              <FiMapPin /> {formatDistance(item.distanceM)}
            </Badge>
          </HStack>
          <HStack gap={2} wrap="wrap" mt="auto">
            {!hideShopLink && (
              <Button asChild size="sm" variant="outline">
                <Link to={`/shops/${item.shop}`} state={{ from: location }}>
                  <FiShoppingBag /> View shop
                </Link>
              </Button>
            )}
            <Button asChild size="sm" variant="outline">
              <a href={`tel:${item.shopPhone}`}>
                <FiPhone /> Call
              </a>
            </Button>
            <Button asChild size="sm" variant="outline">
              <a href={whatsappUrl} target="_blank" rel="noreferrer">
                <FiMessageCircle /> WhatsApp
              </a>
            </Button>
            {onContact && (
              <Button
                size="sm"
                onClick={() => onContact(item)}
                disabled={contactDisabled}
              >
                Contact shop
              </Button>
            )}
          </HStack>
        </VStack>
      </HStack>
    </Box>
  );
};
