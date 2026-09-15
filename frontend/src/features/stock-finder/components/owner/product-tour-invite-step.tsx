import { Button, HStack, Input, Skeleton, Text, VStack } from "@chakra-ui/react";
import { FiCopy, FiShare2 } from "react-icons/fi";
import { useReferralShare } from "../../hooks/use-referral-share";

export const ProductTourInviteStep = () => {
  const { referralLink, isLoading, copyLink, shareOnWhatsApp } =
    useReferralShare();

  return (
    <VStack className="product-tour-invite-step" gap={4} align="stretch">
      <Text>
        More shops on Stock Finder means more buyers searching here — and more
        messages for every shop. Share your link with shop owners you know.
      </Text>

      {isLoading ? (
        <Skeleton h="40px" borderRadius="md" />
      ) : (
        <Input
          value={referralLink}
          readOnly
          aria-label="Your referral link"
          fontSize="sm"
          color="fg.muted"
          bg="bg.subtle"
          cursor="default"
        />
      )}

      <HStack gap={3} wrap="wrap">
        <Button
          size="md"
          variant="outline"
          flex={1}
          onClick={copyLink}
          disabled={isLoading}
        >
          <FiCopy /> Copy link
        </Button>
        <Button
          size="md"
          colorPalette="green"
          flex={1}
          onClick={shareOnWhatsApp}
          disabled={isLoading}
        >
          <FiShare2 /> Share on WhatsApp
        </Button>
      </HStack>
    </VStack>
  );
};
