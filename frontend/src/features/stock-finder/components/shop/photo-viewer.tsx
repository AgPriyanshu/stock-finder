import {
  Box,
  CloseButton,
  Dialog,
  IconButton,
  Image,
  Portal,
  Text,
} from "@chakra-ui/react";
import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import type { SfShopImage } from "api/stock-finder";

interface PhotoViewerProps {
  images: SfShopImage[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const PhotoViewer = ({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
}: PhotoViewerProps) => {
  const [index, setIndex] = useState(initialIndex);
  const touchStartX = useRef<number | null>(null);

  // Hoist prev/next before the effect that references them.
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + images.length) % images.length),
    [images.length],
  );
  const next = useCallback(
    () => setIndex((i) => (i + 1) % images.length),
    [images.length],
  );

  useEffect(() => {
    if (isOpen) startTransition(() => setIndex(initialIndex));
  }, [isOpen, initialIndex]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, index, images.length, prev, next, onClose]);

  const current = images[index];

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(e) => !e.open && onClose()}
      placement="center"
    >
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.900" />
        <Dialog.Positioner>
          <Dialog.Content
            bg="transparent"
            shadow="none"
            maxW="100vw"
            w="100vw"
            h="100dvh"
            p={0}
            display="flex"
            flexDir="column"
            alignItems="center"
            justifyContent="center"
          >
            {/* Close button */}
            <Dialog.CloseTrigger asChild>
              <CloseButton
                position="fixed"
                top={4}
                right={4}
                size="lg"
                bg="whiteAlpha.200"
                color="white"
                _hover={{ bg: "whiteAlpha.300" }}
                zIndex={2}
              />
            </Dialog.CloseTrigger>

            {/* Counter */}
            {images.length > 1 && (
              <Text
                position="fixed"
                top={5}
                left="50%"
                transform="translateX(-50%)"
                color="whiteAlpha.700"
                fontSize="sm"
                zIndex={2}
              >
                {index + 1} / {images.length}
              </Text>
            )}

            {/* Main image */}
            <Box
              position="relative"
              w="full"
              h="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              onTouchStart={(e) => {
                touchStartX.current = e.touches[0]?.clientX ?? null;
              }}
              onTouchEnd={(e) => {
                if (touchStartX.current === null) return;
                const dx =
                  (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
                if (Math.abs(dx) > 40) { if (dx < 0) next(); else prev(); }
                touchStartX.current = null;
              }}
            >
              {current?.url && (
                <Image
                  src={current.url}
                  alt={`Photo ${index + 1}`}
                  maxH="90dvh"
                  maxW="90vw"
                  objectFit="contain"
                  borderRadius="md"
                  draggable={false}
                />
              )}
            </Box>

            {/* Prev / Next */}
            {images.length > 1 && (
              <>
                <IconButton
                  position="fixed"
                  left={3}
                  top="50%"
                  transform="translateY(-50%)"
                  aria-label="Previous photo"
                  size="lg"
                  bg="whiteAlpha.200"
                  color="white"
                  _hover={{ bg: "whiteAlpha.300" }}
                  borderRadius="full"
                  zIndex={2}
                  onClick={prev}
                >
                  <FiChevronLeft />
                </IconButton>
                <IconButton
                  position="fixed"
                  right={3}
                  top="50%"
                  transform="translateY(-50%)"
                  aria-label="Next photo"
                  size="lg"
                  bg="whiteAlpha.200"
                  color="white"
                  _hover={{ bg: "whiteAlpha.300" }}
                  borderRadius="full"
                  zIndex={2}
                  onClick={next}
                >
                  <FiChevronRight />
                </IconButton>
              </>
            )}

            {/* Dot indicators */}
            {images.length > 1 && (
              <Box
                position="fixed"
                bottom={6}
                display="flex"
                gap={2}
                zIndex={2}
              >
                {images.map((_, i) => (
                  <Box
                    key={i}
                    as="button"
                    w={index === i ? "20px" : "8px"}
                    h="8px"
                    borderRadius="full"
                    bg={index === i ? "white" : "whiteAlpha.500"}
                    transition="all 200ms ease"
                    onClick={() => setIndex(i)}
                    aria-label={`Go to photo ${i + 1}`}
                  />
                ))}
              </Box>
            )}
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
