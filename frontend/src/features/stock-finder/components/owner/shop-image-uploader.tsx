import {
  Badge,
  Box,
  Button,
  HStack,
  IconButton,
  Image,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { FiImage, FiTrash2 } from "react-icons/fi";
import type { SfShopImage } from "api/stock-finder";
import {
  useConfirmShopImage,
  useDeleteShopImage,
  usePresignShopImage,
} from "api/stock-finder";
import { toaster } from "design-system/toaster/toaster-instance";
import {
  compressImage,
  getImageDimensions,
} from "../../services/compress-image";

const MAX_IMAGES = 3;
const MIN_DIMENSION = 400;

interface UploadProgress {
  id: string;
  name: string;
  progress: number;
  error?: string;
}

interface ShopImageUploaderProps {
  images: SfShopImage[];
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
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed with ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(blob);
  });

export const ShopImageUploader = ({ images }: ShopImageUploaderProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploads, setUploads] = useState<UploadProgress[]>([]);

  const presignImage = usePresignShopImage();
  const confirmImage = useConfirmShopImage();
  const deleteImage = useDeleteShopImage();

  const setUpload = (id: string, patch: Partial<UploadProgress>) => {
    setUploads((current) =>
      current.map((u) => (u.id === id ? { ...u, ...patch } : u))
    );
  };

  const handleFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter((f) =>
      f.type.startsWith("image/")
    );
    const available =
      MAX_IMAGES -
      images.length -
      uploads.filter((u) => !u.error).length;
    const accepted = files.slice(0, Math.max(available, 0));

    if (accepted.length === 0) {
      toaster.info({ title: `Maximum ${MAX_IMAGES} shop photos allowed.` });
      return;
    }

    for (const file of accepted) {
      const uploadId = `${file.name}-${file.lastModified}-${crypto.randomUUID()}`;
      setUploads((current) => [
        ...current,
        { id: uploadId, name: file.name, progress: 0 },
      ]);

      try {
        const original = await getImageDimensions(file);

        if (original.width < MIN_DIMENSION || original.height < MIN_DIMENSION) {
          throw new Error("Image too small (min 400×400)");
        }

        setUpload(uploadId, { progress: 15 });
        const compressed = await compressImage(file);
        const presigned = await presignImage.mutateAsync(compressed.contentType);

        await putBlob(
          presigned.url,
          compressed.blob,
          presigned.headers,
          (progress) => setUpload(uploadId, { progress: Math.max(20, progress) })
        );

        await confirmImage.mutateAsync({
          key: presigned.key,
          width: compressed.width,
          height: compressed.height,
          isPrimary: images.length === 0,
        });

        setUploads((current) => current.filter((u) => u.id !== uploadId));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Upload failed";
        setUpload(uploadId, { error: message, progress: 0 });
        toaster.error({ title: "Upload failed", description: message });
      }
    }
  };

  const handleDelete = async (imageId: string) => {
    try {
      await deleteImage.mutateAsync(imageId);
    } catch {
      toaster.error({ title: "Failed to delete photo" });
    }
  };

  const canUpload =
    images.length + uploads.filter((u) => !u.error).length < MAX_IMAGES;

  return (
    <VStack gap={4} align="stretch">
      {canUpload && (
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
              if (event.target.files) void handleFiles(event.target.files);
              event.target.value = "";
            }}
          />
          <VStack gap={2}>
            <Text color="text.secondary" fontSize="sm">
              Add up to {MAX_IMAGES} shop photos (min 400×400).
            </Text>
            <Button size="sm" onClick={() => inputRef.current?.click()}>
              <FiImage /> Choose photos
            </Button>
          </VStack>
        </Box>
      )}

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
        <SimpleGrid columns={{ base: 2, sm: 3 }} gap={3}>
          {images.map((image) => (
            <Box
              key={image.id}
              borderWidth="1px"
              borderColor={image.isPrimary ? "intent.primary" : "border.default"}
              borderRadius="md"
              overflow="hidden"
              bg="bg.panel"
            >
              <Box position="relative" aspectRatio="1" bg="bg.muted">
                {image.url ? (
                  <Image
                    src={image.url}
                    alt="Shop photo"
                    w="full"
                    h="full"
                    objectFit="cover"
                  />
                ) : (
                  <Box w="full" h="full" bg="surface.subtle" />
                )}
                <IconButton
                  position="absolute"
                  top={2}
                  right={2}
                  size="2xs"
                  variant="ghost"
                  colorPalette="red"
                  aria-label="Delete photo"
                  loading={deleteImage.isPending}
                  onClick={() => void handleDelete(image.id)}
                >
                  <FiTrash2 />
                </IconButton>
                {image.isPrimary && (
                  <Badge
                    position="absolute"
                    left={2}
                    top={2}
                    bg="intent.success"
                    color="text.onIntent"
                    border="none"
                  >
                    Cover
                  </Badge>
                )}
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </VStack>
  );
};
