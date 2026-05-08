import { Badge } from "@chakra-ui/react";
import type { SfItem } from "api/stock-finder";

export const StatusBadge = ({ item }: { item: SfItem }) => {
  if (item.status === "hidden") {
    return (
      <Badge variant="subtle" colorPalette="gray">
        Hidden
      </Badge>
    );
  }

  const now = new Date();
  const staleAt = new Date(item.staleAt);
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  if (staleAt < now) {
    return (
      <Badge variant="outline" borderColor="fg" color="fg" border="1px solid">
        Stale — refresh to publish
      </Badge>
    );
  }

  if (staleAt < sevenDaysFromNow) {
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
