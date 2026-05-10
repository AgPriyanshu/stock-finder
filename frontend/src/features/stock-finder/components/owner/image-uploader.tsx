import {
  Box,
  Button,
  HStack,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import { useEffect, useRef, useState } from "react";
import { FiImage } from "react-icons/fi";
import type { SfItemImage } from "api/stock-finder";
import {
  useConfirmImage,
  useDeleteImage,
  useItem,
  usePresignImage,
  useReorderImages,
  useUpdateImage,
} from "api/stock-finder";
import { toaster } from "design-system/toaster/toaster-instance";
import {
  compressImage,
  getImageDimensions,
} from "../../services/compress-image";
import { ImageThumbnail } from "./image-thumbnail";

const MAX_IMAGES = 5;
const MIN_DIMENSION = 400;
const POLL_MS = 30_000;
const EMPTY_IMAGES: SfItemImage[] = [];

interface UploadProgress {
  id: string;
  name: string;
  progress: number;
  error?: string;
}

interface ImageUploaderProps {
  itemId?: string;
  onImagesChange?: (state: { count: number; hasPrimary: boolean }) => void;
}

const putBlob = (
  url: string,
  blob: Blob,
  headers: Record<string, string>,
  onProgress: (progress: number) => void
) =>
  new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    Object.entries(headers).forEach(([key, value]) => {
      if (key.toLowerCase() !== "content-type") {
        xhr.setRequestHeader(key, value);
      }
    });
    xhr.setRequestHeader("Content-Type", blob.type || "image/jpeg");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(blob);
  });

export const ImageUploader = ({
  itemId,
  onImagesChange,
}: ImageUploaderProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [limitWarning, setLimitWarning] = useState("");
  const [pollUntil, setPollUntil] = useState(0);
  const hasPendingVariantsRef = useRef(false);

  const presignImage = usePresignImage(itemId || "");
  const confirmImage = useConfirmImage(itemId || "");
  const deleteImage = useDeleteImage(itemId || "");
  const updateImage = useUpdateImage(itemId || "");
  const reorderImages = useReorderImages(itemId || "");

  const { data: item } = useItem(itemId || "", {
    enabled: !!itemId,
    refetchInterval: () =>
      hasPendingVariantsRef.current && Date.now() < pollUntil ? 2000 : false,
  });

  const images = item?.images ?? EMPTY_IMAGES;
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    const hasPending = images.some((image) => !image.variantsReady);
    hasPendingVariantsRef.current = hasPending;

    if (hasPending) {
      setPollUntil((prev) => Math.max(prev, Date.now() + POLL_MS));
    }
  }, [images]);

  useEffect(() => {
    if (itemId) {
      onImagesChange?.({
        count: images.length,
        hasPrimary: images.some((image) => image.isPrimary),
      });
    }
  }, [images, itemId, onImagesChange]);

  const setUpload = (id: string, patch: Partial<UploadProgress>) => {
    setUploads((current) =>
      current.map((upload) =>
        upload.id === id ? { ...upload, ...patch } : upload
      )
    );
  };

  const handleFiles = async (fileList: FileList | File[]) => {
    if (!itemId) {
      return;
    }

    setLimitWarning("");
    const files = Array.from(fileList).filter((file) =>
      file.type.startsWith("image/")
    );
    const availableSlots =
      MAX_IMAGES -
      images.length -
      uploads.filter((upload) => !upload.error).length;
    const acceptedFiles = files.slice(0, Math.max(availableSlots, 0));

    if (files.length > acceptedFiles.length) {
      setLimitWarning("You can upload up to 5 images per item.");
    }

    for (const file of acceptedFiles) {
      const uploadId = `${file.name}-${file.lastModified}-${crypto.randomUUID()}`;
      setUploads((current) => [
        ...current,
        { id: uploadId, name: file.name, progress: 0 },
      ]);

      try {
        const original = await getImageDimensions(file);
        if (original.width < MIN_DIMENSION || original.height < MIN_DIMENSION) {
          throw new Error("Image too small (min 400x400)");
        }

        setUpload(uploadId, { progress: 15 });
        const compressed = await compressImage(file);
        const presigned = await presignImage.mutateAsync(
          compressed.contentType
        );

        await putBlob(
          presigned.url,
          compressed.blob,
          presigned.headers,
          (progress) =>
            setUpload(uploadId, { progress: Math.max(20, progress) })
        );

        await confirmImage.mutateAsync({
          key: presigned.key,
          width: compressed.width,
          height: compressed.height,
          isPrimary: images.length === 0,
        });

        setPollUntil(Date.now() + POLL_MS);
        setUploads((current) =>
          current.filter((upload) => upload.id !== uploadId)
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Image upload failed";
        setUpload(uploadId, { error: message, progress: 0 });
        toaster.error({ title: "Image upload failed", description: message });
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = images.findIndex((image) => image.id === active.id);
    const newIndex = images.findIndex((image) => image.id === over.id);
    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    const reorderedIds = arrayMove(images, oldIndex, newIndex).map(
      (image) => image.id
    );
    await reorderImages.mutateAsync(reorderedIds);
  };

  const handleDelete = async (imageId: string) => {
    await deleteImage.mutateAsync(imageId);
  };

  const handleSetPrimary = async (imageId: string) => {
    await updateImage.mutateAsync({ imageId, isPrimary: true });
  };

  return (
    <VStack gap={4} align="stretch">
      <Box
        p={5}
        border="1px dashed"
        borderColor="border.default"
        borderRadius="md"
        bg="bg.muted"
        textAlign="center"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          void handleFiles(event.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          hidden
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => {
            if (event.target.files) {
              void handleFiles(event.target.files);
            }
            event.target.value = "";
          }}
        />

        <VStack gap={3}>
          <Text color="text.secondary" fontSize="sm">
            Add up to 5 product photos.
          </Text>
          <HStack gap={2} justify="center" wrap="wrap">
            <Button
              size="sm"
              disabled={images.length >= MAX_IMAGES}
              onClick={() => inputRef.current?.click()}
            >
              <FiImage /> Choose file
            </Button>
          </HStack>
          {limitWarning && (
            <Text color="intent.danger" fontSize="sm">
              {limitWarning}
            </Text>
          )}
        </VStack>
      </Box>

      {uploads.map((upload) => (
        <Box key={upload.id}>
          <HStack justify="space-between" mb={1}>
            <Text fontSize="sm" lineClamp={1}>
              {upload.name}
            </Text>
            <Text
              fontSize="xs"
              color={upload.error ? "intent.danger" : "text.secondary"}
            >
              {upload.error || `${upload.progress}%`}
            </Text>
          </HStack>
          <Box h="6px" bg="bg.muted" borderRadius="full" overflow="hidden">
            <Box
              h="full"
              w={`${upload.progress}%`}
              bg={upload.error ? "intent.danger" : "intent.primary"}
              transition="width 120ms ease"
            />
          </Box>
        </Box>
      ))}

      {images.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(event) => void handleDragEnd(event)}
        >
          <SortableContext
            items={images.map((image) => image.id)}
            strategy={rectSortingStrategy}
          >
            <SimpleGrid columns={{ base: 2, sm: 3, lg: 4 }} gap={3}>
              {images.map((image) => (
                <ImageThumbnail
                  key={image.id}
                  image={image}
                  onDelete={handleDelete}
                  onSetPrimary={handleSetPrimary}
                  isDeleting={deleteImage.isPending}
                  isUpdating={updateImage.isPending}
                />
              ))}
            </SimpleGrid>
          </SortableContext>
        </DndContext>
      )}
    </VStack>
  );
};
