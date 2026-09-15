import { Alert } from "@chakra-ui/react";
import type { SfItem } from "api/stock-finder";
import { getItemFreshness } from "./item-freshness";

interface StaleItemsBannerProps {
  items: SfItem[];
}

const countItems = (count: number) => `${count} item${count === 1 ? "" : "s"}`;

const buildSummary = (staleCount: number, refreshSoonCount: number) => {
  const parts: string[] = [];

  if (staleCount > 0) {
    parts.push(`${countItems(staleCount)} ${staleCount === 1 ? "is" : "are"} stale`);
  }

  if (refreshSoonCount > 0) {
    parts.push(
      `${countItems(refreshSoonCount)} ${refreshSoonCount === 1 ? "needs" : "need"} a refresh soon`
    );
  }

  return parts.join(" and ");
};

export const StaleItemsBanner = ({ items }: StaleItemsBannerProps) => {
  // Sold and hidden items aren't shown to buyers, so they don't need refreshing.
  const freshness = items
    .filter((item) => item.status === "active")
    .map(getItemFreshness);
  const staleCount = freshness.filter((f) => f === "stale").length;
  const refreshSoonCount = freshness.filter((f) => f === "refresh-soon").length;

  if (staleCount === 0 && refreshSoonCount === 0) return null;

  return (
    <Alert.Root className="stale-items-banner" status="warning" borderRadius="lg" mb={4}>
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>{buildSummary(staleCount, refreshSoonCount)}</Alert.Title>
        <Alert.Description>
          Open each item's ⋮ menu and tap Refresh to confirm it's still in
          stock and keep it visible to buyers.
        </Alert.Description>
      </Alert.Content>
    </Alert.Root>
  );
};
