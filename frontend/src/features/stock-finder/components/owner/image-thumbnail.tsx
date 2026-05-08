import {
  Badge,
  Box,
  Button,
  HStack,
  IconButton,
  Image,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FiStar, FiTrash2 } from "react-icons/fi";
import type { SfItemImage } from "api/stock-finder";

interface ImageThumbnailProps {
  image: SfItemImage;
  onDelete: (imageId: string) => void;
  onSetPrimary: (imageId: string) => void;
  isDeleting?: boolean;
  isUpdating?: boolean;
}

export const ImageThumbnail = ({
  image,
  onDelete,
  onSetPrimary,
  isDeleting,
  isUpdating,
}: ImageThumbnailProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1,
  };

  const thumbnailUrl = image.thumbUrl || image.cardUrl || image.url;

  return (
    <Box
      ref={setNodeRef}
      style={style}
      borderWidth="1px"
      borderColor={image.isPrimary ? "intent.primary" : "border.default"}
      borderRadius="md"
      overflow="hidden"
      bg="bg.panel"
      opacity={isDragging ? 0.65 : 1}
    >
      <Box
        position="relative"
        aspectRatio="1"
        bg="bg.muted"
        cursor="grab"
        {...attributes}
        {...listeners}
      >
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt="Item image"
            w="full"
            h="full"
            objectFit="cover"
          />
        ) : (
          <Box w="full" h="full" bg="surface.subtle" />
        )}

        {!image.variantsReady && (
          <Box
            position="absolute"
            inset={0}
            bg="blackAlpha.500"
            display="grid"
            placeItems="center"
          >
            <Spinner color="white" />
          </Box>
        )}

        <IconButton
          position="absolute"
          top={2}
          right={2}
          zIndex={1}
          size="2xs"
          variant="ghost"
          colorPalette="red"
          aria-label="Delete image"
          loading={isDeleting}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => onDelete(image.id)}
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
            Primary
          </Badge>
        )}
      </Box>

      <HStack p={2} justify="space-between" gap={2}>
        <Text fontSize="xs" color="text.secondary">
          {image.width} x {image.height}
        </Text>
        <Button
          size="2xs"
          variant={image.isPrimary ? "solid" : "outline"}
          disabled={image.isPrimary}
          loading={isUpdating}
          onClick={() => onSetPrimary(image.id)}
        >
          <FiStar /> Set
        </Button>
      </HStack>
    </Box>
  );
};
