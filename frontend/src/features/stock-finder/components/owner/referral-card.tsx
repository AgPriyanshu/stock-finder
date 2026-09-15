import {
  Badge,
  Box,
  Button,
  HStack,
  Icon,
  Input,
  InputGroup,
  Skeleton,
  Text,
} from "@chakra-ui/react";
import { FiCopy, FiShare2, FiUsers } from "react-icons/fi";
import { useReferralShare } from "../../hooks/use-referral-share";

export const ReferralCard = () => {
  const { referral, referralLink, isLoading, copyLink, shareOnWhatsApp } =
    useReferralShare();

  return (
    <Box
      className="referral-card"
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="lg"
      bg="bg.panel"
      p={5}
    >
      {/* Header */}
      <HStack gap={3} mb={3}>
        <Icon color="intent.primary" boxSize={5}>
          <FiUsers />
        </Icon>
        <Text fontWeight="semibold" fontSize="md">
          Refer a Shop Owner
        </Text>
      </HStack>

      {/* Motivational copy */}
      <Box
        bg="bg.muted"
        borderRadius="md"
        px={4}
        py={3}
        mb={4}
        borderLeftWidth="3px"
        borderLeftColor="intent.primary"
      >
        <Text fontSize="sm" color="fg.muted" lineHeight="1.6">
          📈 <strong>More shopkeepers = more customers = more leads.</strong> When
          more shops list their inventory, buyers flock to the platform for a
          one-stop search — and every shop wins more inquiries. Invite fellow
          shop owners and grow together.
        </Text>
      </Box>

      {/* Referral link */}
      {isLoading ? (
        <Skeleton h="36px" borderRadius="md" mb={4} />
      ) : (
        <InputGroup mb={4} endElement={
          <Button
            size="xs"
            variant="ghost"
            colorPalette="gray"
            onClick={copyLink}
            aria-label="Copy referral link"
            px={2}
          >
            <FiCopy />
          </Button>
        }>
          <Input
            value={referralLink}
            readOnly
            fontSize="xs"
            color="fg.muted"
            bg="bg.subtle"
            pr="36px"
            cursor="default"
          />
        </InputGroup>
      )}

      {/* Action buttons */}
      <HStack gap={3} flexWrap="wrap">
        <Button
          size="sm"
          variant="outline"
          onClick={copyLink}
          disabled={isLoading}
        >
          <FiCopy />
          Copy link
        </Button>
        <Button
          size="sm"
          colorPalette="green"
          onClick={shareOnWhatsApp}
          disabled={isLoading}
        >
          <FiShare2 />
          Share on WhatsApp
        </Button>
      </HStack>

      {/* Stats */}
      {referral && (referral.clickCount > 0 || referral.signupCount > 0) && (
        <HStack gap={3} mt={4} flexWrap="wrap">
          <Badge variant="subtle" colorPalette="blue">
            {referral.clickCount} link visit{referral.clickCount !== 1 ? "s" : ""}
          </Badge>
          <Badge variant="subtle" colorPalette="green">
            {referral.signupCount} shop{referral.signupCount !== 1 ? "s" : ""} joined via your link
          </Badge>
        </HStack>
      )}
    </Box>
  );
};
