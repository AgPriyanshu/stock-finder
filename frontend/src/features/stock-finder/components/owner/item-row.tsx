import {
  Box,
  HStack,
  IconButton,
  Image,
  MenuContent,
  MenuItem,
  MenuPositioner,
  MenuRoot,
  MenuTrigger,
  Portal,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  FiMoreVertical,
  FiEdit2,
  FiRefreshCw,
  FiTrash2,
  FiCpu,
} from "react-icons/fi";
import { toaster } from "design-system/toaster/toaster-instance";
import type { SfItem } from "api/stock-finder";
import { useRefreshItem, useDeleteItem } from "api/stock-finder";
import { StatusBadge } from "./_status-badge";

interface ItemRowProps {
  item: SfItem;
  onEdit: (item: SfItem) => void;
  isMobile?: boolean;
}

interface ItemActionsProps {
  item: SfItem;
  onEdit: (item: SfItem) => void;
  onRefresh: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

const ItemActions = ({
  item,
  onEdit,
  onRefresh,
  onDelete,
  isDeleting,
}: ItemActionsProps) => (
  <MenuRoot>
    <MenuTrigger asChild>
      <IconButton variant="ghost" size="sm" aria-label="Item actions">
        <FiMoreVertical />
      </IconButton>
    </MenuTrigger>
    <Portal>
      <MenuPositioner>
        <MenuContent>
          <MenuItem value="edit" onClick={() => onEdit(item)}>
            <HStack gap={2}>
              <FiEdit2 /> <Text>Edit</Text>
            </HStack>
          </MenuItem>
          <MenuItem value="refresh" onClick={onRefresh}>
            <HStack gap={2}>
              <FiRefreshCw /> <Text>Refresh</Text>
            </HStack>
          </MenuItem>
          <MenuItem
            value="delete"
            onClick={onDelete}
            color="intent.danger"
            disabled={isDeleting}
          >
            <HStack gap={2}>
              <FiTrash2 /> <Text>{isDeleting ? "Deleting" : "Delete"}</Text>
            </HStack>
          </MenuItem>
        </MenuContent>
      </MenuPositioner>
    </Portal>
  </MenuRoot>
);

export const ItemRow = ({ item, onEdit, isMobile }: ItemRowProps) => {
  const refreshItem = useRefreshItem();
  const deleteItem = useDeleteItem();

  const handleRefresh = async () => {
    try {
      await refreshItem.mutateAsync(item.id);
      toaster.success({
        title: "Item refreshed",
        description: "Stock confirmed — visible for 30 more days.",
      });
    } catch {
      toaster.error({ title: "Failed to refresh item" });
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete "${item.name}"? This cannot be undone.`
    );
    if (!confirmed) {
      return;
    }

    try {
      console.log("Delete Item called");

      await deleteItem.mutateAsync(item.id);
      toaster.success({ title: "Item deleted" });
    } catch (error) {
      console.log({ error });
      toaster.error({ title: "Failed to delete item" });
    }
  };

  const primaryImage =
    item.images.find((img) => img.isPrimary)?.thumbUrl ||
    item.images[0]?.thumbUrl;

  if (isMobile) {
    return (
      <Box
        p={4}
        borderWidth="1px"
        borderColor="border.default"
        borderRadius="lg"
        bg="bg.panel"
        w="full"
      >
        <HStack gap={3} align="start" justify="space-between">
          <HStack gap={3} align="start" flex={1} minW={0}>
            <Box
              boxSize={{ base: "56px", sm: "60px" }}
              borderRadius="md"
              overflow="hidden"
              bg="bg.muted"
              flexShrink={0}
            >
              {primaryImage ? (
                <Image
                  src={primaryImage}
                  alt={item.name}
                  w="full"
                  h="full"
                  objectFit="cover"
                />
              ) : (
                <Box
                  w="full"
                  h="full"
                  bg="surface.subtle"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <FiCpu size={18} color="var(--chakra-colors-fg-muted)" />
                </Box>
              )}
            </Box>
            <VStack align="start" gap={1} minW={0} flex={1}>
              <Text fontWeight="medium" lineClamp={1}>
                {item.name}
              </Text>
              <Text fontSize="sm" color="text.secondary">
                Qty: {item.quantity} •{" "}
                {item.price ? `₹${item.price}` : "No price"}
              </Text>
              <StatusBadge item={item} />
            </VStack>
          </HStack>
          <ItemActions
            item={item}
            onEdit={onEdit}
            onRefresh={handleRefresh}
            onDelete={handleDelete}
            isDeleting={deleteItem.isPending}
          />
        </HStack>
      </Box>
    );
  }

  return (
    <Table.Row>
      <Table.Cell>
        <HStack gap={3}>
          <Box boxSize="40px" borderRadius="sm" overflow="hidden" bg="bg.muted">
            {primaryImage ? (
              <Image
                src={primaryImage}
                alt={item.name}
                w="full"
                h="full"
                objectFit="cover"
              />
            ) : (
              <Box w="full" h="full" bg="surface.subtle" />
            )}
          </Box>
          <Text fontWeight="medium" lineClamp={1}>
            {item.name}
          </Text>
        </HStack>
      </Table.Cell>
      <Table.Cell>{item.quantity}</Table.Cell>
      <Table.Cell>{item.price ? `₹${item.price}` : "-"}</Table.Cell>
      <Table.Cell>
        <StatusBadge item={item} />
      </Table.Cell>
      <Table.Cell textAlign="right">
        <ItemActions
          item={item}
          onEdit={onEdit}
          onRefresh={handleRefresh}
          onDelete={handleDelete}
          isDeleting={deleteItem.isPending}
        />
      </Table.Cell>
    </Table.Row>
  );
};
