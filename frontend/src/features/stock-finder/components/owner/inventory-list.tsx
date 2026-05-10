import {
  Box,
  Button,
  Center,
  Dialog,
  Flex,
  Heading,
  Spinner,
  Table,
  Text,
  useBreakpointValue,
  VStack,
  Portal,
  CloseButton,
  Input,
} from "@chakra-ui/react";
import type { AxiosError } from "axios";
import { useEffect, useRef, useState } from "react";
import { FiPlus, FiUpload } from "react-icons/fi";
import { toaster } from "design-system/toaster/toaster-instance";
import { useBulkUploadItems, useMyItems } from "api/stock-finder";
import type { SfBulkUploadItemsResponse, SfItem } from "api/stock-finder";
import { ItemForm } from "./item-form";
import { ItemRow } from "./item-row";

const formatBulkUploadError = (error: unknown) => {
  const axiosError = error as AxiosError<{
    data?: SfBulkUploadItemsResponse & Record<string, unknown>;
  }>;
  const response = axiosError.response?.data?.data;
  const fileError = response?.file;
  if (Array.isArray(fileError)) {
    return fileError.join(", ");
  }
  if (typeof fileError === "string") {
    return fileError;
  }

  const firstRowError = response?.errors?.[0];
  if (!firstRowError) {
    return "Check the CSV columns and try again.";
  }

  const [field, messages] = Object.entries(firstRowError.errors)[0] ?? [];
  const message = Array.isArray(messages) ? messages.join(", ") : messages;
  return `Row ${firstRowError.row}${field ? `, ${field}` : ""}: ${message}`;
};

export const InventoryList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SfItem | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: items, isLoading } = useMyItems();
  const bulkUploadItems = useBulkUploadItems();
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        setEditingItem(undefined);
        setIsModalOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleEdit = (item: SfItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(undefined);
  };

  const handleCsvUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await bulkUploadItems.mutateAsync(file);
      toaster.success({
        title: "CSV uploaded",
        description: `${result.created} item${result.created === 1 ? "" : "s"} added.`,
      });
    } catch (error) {
      toaster.error({
        title: "CSV upload failed",
        description: formatBulkUploadError(error),
      });
    } finally {
      event.target.value = "";
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <Center py={12}>
          <Spinner size="xl" color="intent.primary" />
        </Center>
      );
    }

    if (!items || items.length === 0) {
      return (
        <Center
          py={16}
          flexDir="column"
          gap={4}
          bg="bg.muted"
          borderRadius="lg"
          border="1px dashed"
          borderColor="border.default"
        >
          {/* Placeholder for illustration */}
          <Heading size="md">Your inventory is empty</Heading>
          <Text color="text.secondary" textAlign="center" maxW="sm">
            Add your first item to start receiving leads from nearby buyers.
          </Text>
          <Button mt={2} onClick={() => setIsModalOpen(true)}>
            <FiPlus /> Add your first item
          </Button>
        </Center>
      );
    }

    if (isMobile) {
      return (
        <VStack gap={4} w="full" align="stretch">
          {items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              onEdit={handleEdit}
              isMobile={true}
            />
          ))}
        </VStack>
      );
    }

    return (
      <Box
        w="full"
        overflowX="auto"
        borderWidth="1px"
        borderColor="border.default"
        borderRadius="lg"
        bg="bg.panel"
      >
        <Table.Root variant="line">
          <Table.Header>
            <Table.Row bg="bg.muted">
              <Table.ColumnHeader>Item</Table.ColumnHeader>
              <Table.ColumnHeader>Quantity</Table.ColumnHeader>
              <Table.ColumnHeader>Price</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="right">Actions</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {items.map((item) => (
              <ItemRow key={item.id} item={item} onEdit={handleEdit} />
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
    );
  };

  return (
    <Box className="inventory-list" w="full">
      <Flex
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
        direction={{ base: "column", md: "row" }}
        mb={6}
        gap={4}
      >
        <VStack align="start" gap={0}>
          <Heading size={{ base: "md", md: "lg" }}>Your inventory</Heading>
          <Text color="text.secondary" fontSize="sm">
            Press 'n' to quickly add a new item.
          </Text>
        </VStack>
        <Flex gap={2} wrap="wrap" w={{ base: "full", md: "auto" }}>
          <Input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            display="none"
            onChange={handleCsvUpload}
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            loading={bulkUploadItems.isPending}
            flex={{ base: 1, md: "initial" }}
          >
            <FiUpload /> Upload CSV
          </Button>
          <Button
            onClick={() => {
              setEditingItem(undefined);
              setIsModalOpen(true);
            }}
            flex={{ base: 1, md: "initial" }}
          >
            <FiPlus /> Add item
          </Button>
        </Flex>
      </Flex>

      {renderContent()}

      <Dialog.Root
        open={isModalOpen}
        onOpenChange={(e) => !e.open && handleCloseModal()}
        placement="center"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="lg" mx={{ base: 3, md: 0 }}>
              <Dialog.Header>
                <Dialog.Title>
                  {editingItem ? "Edit Item" : "Add Item"}
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body pb={6}>
                <ItemForm
                  initialData={editingItem}
                  onClose={handleCloseModal}
                />
              </Dialog.Body>
              <Dialog.CloseTrigger asChild>
                <CloseButton onClick={handleCloseModal} size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
};
