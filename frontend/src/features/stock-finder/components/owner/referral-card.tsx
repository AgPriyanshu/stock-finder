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
import { useReferralCode } from "api/auth";
import { FiCopy, FiShare2, FiUsers } from "react-icons/fi";
import { toaster } from "design-system/toaster/toaster-instance";

const WHATSAPP_MESSAGE = (link: string) =>
  `Hey! I use *Stock Finder* to list my shop inventory and get buyer leads. Join me — the more shop owners we have, the more customers discover all of us! 🚀\n\nSign up here: ${link}`;

export const ReferralCard = () => {
  const { data: referral, isLoading } = useReferralCode();

  const referralLink = referral
    ? `${window.location.origin}/register?ref=${referral.code}`
    : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toaster.success({ title: "Link copied!" });
    } catch {
      toaster.error({ title: "Could not copy. Try manually." });
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(WHATSAPP_MESSAGE(referralLink));
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  return (
    <Box
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
            onClick={handleCopy}
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
          onClick={handleCopy}
          disabled={isLoading}
        >
          <FiCopy />
          Copy link
        </Button>
        <Button
          size="sm"
          colorPalette="green"
          onClick={handleWhatsApp}
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
