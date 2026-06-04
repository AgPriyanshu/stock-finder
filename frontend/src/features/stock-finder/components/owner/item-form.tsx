import {
  Box,
  Button,
  Field,
  Input,
  NativeSelect,
  Textarea,
  HStack,
  VStack,
  Text,
  SimpleGrid,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FiImage, FiPlus, FiX } from "react-icons/fi";
import { useCatalogItems, useCategories, useCreateCategory, useCreateItem, useUpdateItem } from "api/stock-finder";
import type { SfCatalogItem, SfItem } from "api/stock-finder";
import api from "api/api";
import type { ApiResponse } from "api/types";
import { ImageUploader } from "./image-uploader";
import {
  compressImage,
  getImageDimensions,
} from "../../services/compress-image";
import { toaster } from "design-system/toaster/toaster-instance";

const MIN_DIMENSION = 400;

const itemSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  price: z.string().nullable().optional(),
  category: z.string().min(1, "Category is required"),
  condition: z.enum(["new", "open_box", "used"] as const),
  description: z.string().optional(),
});

type ItemFormValues = z.infer<typeof itemSchema>;

interface PendingFile {
  id: string;
  file: File;
  preview: string;
}

interface ItemFormProps {
  initialData?: SfItem;
  onClose: () => void;
}

const uploadFilesToItem = async (itemId: string, files: PendingFile[]) => {
  for (let i = 0; i < files.length; i++) {
    const { file } = files[i];
    try {
      const original = await getImageDimensions(file);
      if (original.width < MIN_DIMENSION || original.height < MIN_DIMENSION) {
        toaster.error({ title: `${file.name} skipped — min 400×400 px` });
        continue;
      }
      const compressed = await compressImage(file);

      const presignRes = await api.post<ApiResponse<{ url: string; key: string; headers: Record<string, string> }>>(
        `/items/${itemId}/images/presign/`,
        { contentType: compressed.contentType }
      );
      const { url, key, headers } = presignRes.data.data;

      await fetch(url, {
        method: "PUT",
        body: compressed.blob,
        headers: { ...headers, "Content-Type": compressed.blob.type || "image/jpeg" },
      });

      await api.post(`/items/${itemId}/images/confirm/`, {
        key,
        width: compressed.width,
        height: compressed.height,
        isPrimary: i === 0,
      });
    } catch {
      toaster.error({ title: `Failed to upload ${file.name}` });
    }
  }
};

export const ItemForm = ({ initialData, onClose }: ItemFormProps) => {
  const { data: categories = [] } = useCategories();
  const createCategory = useCreateCategory();
  const createItem = useCreateItem();
  const updateItem = useUpdateItem();

  const isEditing = !!initialData;
  const [activeItemId, setActiveItemId] = useState(initialData?.id);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [isUploadingPending, setIsUploadingPending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [nameQuery, setNameQuery] = useState(initialData?.name ?? "");
  const [catalogLocked, setCatalogLocked] = useState(!!initialData);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { data: catalogSuggestions = [] } = useCatalogItems(
    catalogLocked ? "" : nameQuery,
  );

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: initialData?.name || "",
      quantity: initialData?.quantity || 1,
      price: initialData?.price || "",
      category: initialData?.category || "",
      condition: initialData?.condition || "new",
      description: initialData?.description || "",
    },
  });

  const handlePendingFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    const slots = 5 - pendingFiles.length;
    const added: PendingFile[] = files.slice(0, slots).map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      preview: URL.createObjectURL(f),
    }));
    setPendingFiles((prev) => [...prev, ...added]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePending = (id: string) => {
    setPendingFiles((prev) => {
      const removed = prev.find((f) => f.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  const onSubmit = async (data: ItemFormValues) => {
    try {
      const payload = { ...data, price: data.price || null };

      if (activeItemId) {
        await updateItem.mutateAsync({ id: activeItemId, ...payload });
        onClose();
      } else {
        const created = await createItem.mutateAsync(payload);
        setActiveItemId(created.id);

        if (pendingFiles.length > 0) {
          setIsUploadingPending(true);
          await uploadFilesToItem(created.id, pendingFiles);
          setIsUploadingPending(false);
        }

        onClose();
      }
    } catch (error) {
      console.error("Failed to save item:", error);
    }
  };

  const isBusy = isSubmitting || isUploadingPending;

  const handleCreateCategory = async (setValue: (name: "category", value: string) => void) => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    try {
      const res = await createCategory.mutateAsync(trimmed);
      setValue("category", res.data.data.id);
      setNewCategoryName("");
      setShowNewCategory(false);
    } catch {
      toaster.error({ title: "Failed to create category" });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack gap={4} align="stretch">
        {activeItemId ? (
          <ImageUploader itemId={activeItemId} />
        ) : (
          <Box>
            <input
              ref={fileInputRef}
              hidden
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handlePendingFiles(e.target.files)}
            />
            <Box
              p={4}
              border="1px dashed"
              borderColor="border.default"
              borderRadius="md"
              bg="bg.muted"
              textAlign="center"
            >
              <Text fontSize="sm" color="fg.muted" mb={2}>
                Add up to 5 product photos.
              </Text>
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={pendingFiles.length >= 5}
                type="button"
              >
                <FiImage /> Choose file
              </Button>
            </Box>

            {pendingFiles.length > 0 && (
              <SimpleGrid columns={{ base: 2, sm: 3 }} gap={2} mt={3}>
                {pendingFiles.map((pf, i) => (
                  <Box
                    key={pf.id}
                    position="relative"
                    borderRadius="md"
                    overflow="hidden"
                  >
                    <img
                      src={pf.preview}
                      style={{ width: "100%", height: "96px", objectFit: "cover", display: "block" }}
                      alt={pf.file.name}
                    />
                    {i === 0 && (
                      <Box
                        position="absolute"
                        top={1}
                        left={1}
                        bg="green.500"
                        color="white"
                        fontSize="2xs"
                        px={1}
                        borderRadius="sm"
                      >
                        Primary
                      </Box>
                    )}
                    <Button
                      position="absolute"
                      top={1}
                      right={1}
                      size="2xs"
                      variant="ghost"
                      color="white"
                      bg="blackAlpha.600"
                      onClick={() => removePending(pf.id)}
                      type="button"
                    >
                      <FiX />
                    </Button>
                  </Box>
                ))}
              </SimpleGrid>
            )}
          </Box>
        )}

        <Field.Root invalid={!!errors.name}>
          <Field.Label>Name *</Field.Label>
          <Box position="relative" w="full">
            <HStack gap={0}>
              <Input
                {...register("name")}
                placeholder="Item name"
                readOnly={catalogLocked}
                bg={catalogLocked ? "bg.muted" : undefined}
                value={nameQuery}
                onChange={(e) => {
                  if (catalogLocked) return;
                  const v = e.target.value;
                  setNameQuery(v);
                  setValue("name", v);
                  setShowSuggestions(true);
                }}
                onFocus={() => { if (!catalogLocked) setShowSuggestions(true); }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                borderRightRadius={catalogLocked ? 0 : undefined}
              />
              {catalogLocked && !isEditing && (
                <Button
                  size="sm"
                  variant="outline"
                  borderLeftRadius={0}
                  onClick={() => {
                    setCatalogLocked(false);
                    setNameQuery("");
                    setValue("name", "");
                  }}
                  type="button"
                  aria-label="Clear catalog selection"
                >
                  <FiX />
                </Button>
              )}
            </HStack>
            {showSuggestions && catalogSuggestions.length > 0 && (
              <Box
                position="absolute"
                top="100%"
                left={0}
                right={0}
                zIndex={10}
                bg="bg.panel"
                borderWidth="1px"
                borderColor="border.default"
                borderRadius="md"
                shadow="md"
                mt={1}
                maxH="200px"
                overflowY="auto"
              >
                {catalogSuggestions.map((item: SfCatalogItem) => (
                  <Box
                    key={item.id}
                    px={3}
                    py={2}
                    cursor="pointer"
                    _hover={{ bg: "bg.muted" }}
                    onMouseDown={() => {
                      setNameQuery(item.name);
                      setValue("name", item.name);
                      if (item.category) setValue("category", item.category);
                      setCatalogLocked(true);
                      setShowSuggestions(false);
                    }}
                  >
                    <Text fontSize="sm" fontWeight="medium">{item.name}</Text>
                    {item.categoryName && (
                      <Text fontSize="xs" color="fg.muted">{item.categoryName}</Text>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
          {errors.name && (
            <Field.ErrorText>{errors.name.message}</Field.ErrorText>
          )}
        </Field.Root>

        <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
          <Field.Root invalid={!!errors.quantity}>
            <Field.Label>Quantity *</Field.Label>
            <Input
              type="number"
              {...register("quantity", { valueAsNumber: true })}
              min={1}
            />
            {errors.quantity && (
              <Field.ErrorText>{errors.quantity.message}</Field.ErrorText>
            )}
          </Field.Root>

          <Field.Root invalid={!!errors.price}>
            <Field.Label>Price (optional)</Field.Label>
            <Input {...register("price")} placeholder="0.00" />
            {errors.price && (
              <Field.ErrorText>{errors.price.message}</Field.ErrorText>
            )}
          </Field.Root>
        </SimpleGrid>

        <Field.Root invalid={!!errors.category}>
          <HStack justify="space-between" align="center" w="full">
            <Field.Label mb={0}>Category *</Field.Label>
            <Button
              size="2xs"
              variant="ghost"
              onClick={() => setShowNewCategory((v) => !v)}
              type="button"
            >
              <FiPlus /> New
            </Button>
          </HStack>
          {showNewCategory && (
            <HStack w="full" gap={2}>
              <Input
                size="sm"
                placeholder="e.g. Electronics"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void handleCreateCategory(setValue);
                  }
                }}
              />
              <Button
                size="sm"
                loading={createCategory.isPending}
                onClick={() => void handleCreateCategory(setValue)}
                type="button"
              >
                Add
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => { setShowNewCategory(false); setNewCategoryName(""); }}
                type="button"
              >
                <FiX />
              </Button>
            </HStack>
          )}
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <NativeSelect.Root>
                <NativeSelect.Field {...field}>
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            )}
          />
          {errors.category && (
            <Field.ErrorText>{errors.category.message}</Field.ErrorText>
          )}
        </Field.Root>

        <Field.Root invalid={!!errors.condition}>
          <Field.Label>Condition *</Field.Label>
          <Controller
            name="condition"
            control={control}
            render={({ field }) => (
              <HStack gap={2} wrap="wrap">
                {(["new", "open_box", "used"] as const).map((cond) => (
                  <Button
                    key={cond}
                    size="sm"
                    variant={field.value === cond ? "solid" : "outline"}
                    onClick={() => field.onChange(cond)}
                    type="button"
                    flex={{ base: 1, sm: "initial" }}
                  >
                    {cond === "new"
                      ? "New"
                      : cond === "open_box"
                        ? "Open Box"
                        : "Used"}
                  </Button>
                ))}
              </HStack>
            )}
          />
          {errors.condition && (
            <Field.ErrorText>{errors.condition.message}</Field.ErrorText>
          )}
        </Field.Root>

        <Field.Root invalid={!!errors.description}>
          <Field.Label>Description</Field.Label>
          <Textarea
            {...register("description")}
            placeholder="Add details..."
            rows={3}
          />
          {errors.description && (
            <Field.ErrorText>{errors.description.message}</Field.ErrorText>
          )}
        </Field.Root>

        <HStack
          justify={{ base: "stretch", sm: "flex-end" }}
          pt={4}
          gap={2}
          flexDir={{ base: "column-reverse", sm: "row" }}
          align="stretch"
        >
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isBusy}
            w={{ base: "full", sm: "auto" }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isBusy}
            w={{ base: "full", sm: "auto" }}
          >
            {isEditing ? "Save changes" : "Add item"}
          </Button>
        </HStack>
      </VStack>
    </form>
  );
};
