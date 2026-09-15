import { Badge } from "@chakra-ui/react";
import type { SfItem } from "api/stock-finder";
import { getItemFreshness } from "./item-freshness";

export const StatusBadge = ({ item }: { item: SfItem }) => {
  const freshness = getItemFreshness(item);

  if (freshness === "hidden") {
    return (
      <Badge variant="subtle" colorPalette="gray">
        Hidden
      </Badge>
    );
  }

  if (freshness === "stale") {
    return (
      <Badge variant="outline" borderColor="fg" color="fg" border="1px solid">
        Stale — refresh to publish
      </Badge>
    );
  }

  if (freshness === "refresh-soon") {
    return (
      <Badge
        variant="outline"
        borderColor="fg.muted"
        color="fg.muted"
        border="1px solid"
      >
        Refresh soon
      </Badge>
    );
  }

  return (
    <Badge variant="subtle" colorPalette="gray">
      Active
    </Badge>
  );
};
