import {
  Box,
  Button,
  Center,
  Heading,
  HStack,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { Link, useLocation, useParams } from "react-router";
import type { SfSearchItem } from "api/stock-finder";
import {
  useCreateReport,
  usePublicShop,
  usePublicShopItems,
} from "api/stock-finder";
import { toaster } from "design-system/toaster/toaster-instance";
import { ResultCard } from "../search/result-card";
import { getRecentLead } from "../../hooks/use-recent-leads";
import { LeadDialog } from "./lead-dialog";
import { ShopHeader } from "./shop-header";
import { StaticShopMap } from "./static-shop-map";

export const ShopProfile = () => {
  const { id = "" } = useParams();
  const location = useLocation();
  const { data: shop, isLoading: isShopLoading } = usePublicShop(id);
  const { data: rawItems = [], isLoading: areItemsLoading } =
    usePublicShopItems(id);
  const highlightItemId = location.state?.highlightItemId as string | undefined;
  const items = useMemo(() => {
    if (!highlightItemId) return rawItems;
    return [
      ...rawItems.filter((item) => item.id === highlightItemId),
      ...rawItems.filter((item) => item.id !== highlightItemId),
    ];
  }, [rawItems, highlightItemId]);
  const createReport = useCreateReport();
  const [contactItem, setContactItem] = useState<SfSearchItem | null>(null);
  const [recentTick, setRecentTick] = useState(0);

  useEffect(() => {
    if (!shop) {
      return;
    }
    document.title = `${shop.name} - Dead Stock Finder`;
    const description = items
      .slice(0, 3)
      .map((item) => item.name)
      .join(", ");
    const meta =
      document.querySelector<HTMLMetaElement>('meta[name="description"]') ||
      document.createElement("meta");
    meta.name = "description";
    meta.content = `${shop.name} has dead stock inventory${description ? `: ${description}` : "."}`;
    document.head.appendChild(meta);
  }, [items, shop]);

  if (isShopLoading) {
    return (
      <Center py={12}>
        <Spinner />
      </Center>
    );
  }

  if (!shop) {
    return <Text>Shop not found.</Text>;
  }

  const reportShop = async () => {
    try {
      await createReport.mutateAsync({
        shopId: shop.id,
        reason: "Reported from public shop profile.",
      });
      toaster.success({ title: "Shop reported" });
    } catch {
      toaster.error({ title: "Failed to report shop" });
    }
  };

  return (
    <VStack align="stretch" gap={5} px={4} py={5}>
      {location.state?.from && (
        <Button asChild variant="ghost" alignSelf="start" size="sm">
          <Link
            to={`${location.state.from.pathname}${location.state.from.search}`}
          >
            <FiArrowLeft /> Back to results
          </Link>
        </Button>
      )}
      <ShopHeader shop={shop} />
      <StaticShopMap shop={shop} />
      <HStack justify="space-between">
        <Heading size="md">Available items</Heading>
        <Button
          variant="outline"
          size="sm"
          onClick={reportShop}
          loading={createReport.isPending}
        >
          Report shop
        </Button>
      </HStack>
      {areItemsLoading ? (
        <Center py={8}>
          <Spinner />
        </Center>
      ) : (
        <SimpleGrid columns={{ base: 1, xl: 2 }} gap={4}>
          {items.map((item) => {
            const recent = getRecentLead(item.id);
            return (
              <Box key={`${item.id}-${recentTick}`}>
                <ResultCard
                  item={item}
                  onContact={setContactItem}
                  contactDisabled={!!recent}
                  hideShopLink
                />
                {recent && (
                  <Text mt={1} fontSize="sm" color="text.secondary">
                    You contacted this shop recently.
                  </Text>
                )}
              </Box>
            );
          })}
        </SimpleGrid>
      )}
      <LeadDialog
        shop={shop}
        item={contactItem}
        isOpen={!!contactItem}
        onClose={() => setContactItem(null)}
        onSent={() => setRecentTick((value) => value + 1)}
      />
    </VStack>
  );
};
