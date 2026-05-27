import {
  Badge,
  Box,
  Button,
  Dialog,
  HStack,
  Icon,
  Input,
  InputGroup,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useReferralCode } from "api/auth";
import { FiCopy, FiShare2, FiUsers, FiX } from "react-icons/fi";
import { toaster } from "design-system/toaster/toaster-instance";

const WHATSAPP_MESSAGE = (link: string) =>
  `Hey! I just joined *Stock Finder* to list my shop inventory and get buyer leads. The more shops that join, the more customers come — and everyone wins more leads! 🚀\n\nJoin here: ${link}`;

interface ReferralWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReferralWelcomeModal = ({ isOpen, onClose }: ReferralWelcomeModalProps) => {
  const { data: referral } = useReferralCode();

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
    <Dialog.Root
      open={isOpen}
      onOpenChange={(e) => { if (!e.open) onClose(); }}
      placement="center"
      size="sm"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header pb={0}>
              <HStack justify="space-between" w="full">
                <HStack gap={2}>
                  <Icon color="intent.primary" boxSize={5}>
                    <FiUsers />
                  </Icon>
                  <Dialog.Title fontSize="lg">
                    Welcome aboard! 🎉
                  </Dialog.Title>
                </HStack>
                <Dialog.CloseTrigger asChild>
                  <Button variant="ghost" size="sm" p={1} h="auto" onClick={onClose}>
                    <FiX />
                  </Button>
                </Dialog.CloseTrigger>
              </HStack>
            </Dialog.Header>

            <Dialog.Body>
              <VStack gap={4} align="stretch">
                {/* Motivational pitch */}
                <Box
                  bg="bg.muted"
                  borderRadius="md"
                  px={4}
                  py={3}
                  borderLeftWidth="3px"
                  borderLeftColor="intent.primary"
                >
                  <Text fontSize="sm" color="fg" lineHeight="1.7">
                    📈 <strong>The more shop owners join, the more buyers search here</strong> — and every
                    shop gets more leads. Invite a fellow shop owner and grow together!
                  </Text>
                </Box>

                {/* Referral link */}
                {referralLink && (
                  <InputGroup endElement={
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
                      cursor="default"
                    />
                  </InputGroup>
                )}

                {/* Action buttons */}
                <HStack gap={3}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopy}
                    disabled={!referralLink}
                    flex={1}
                  >
                    <FiCopy />
                    Copy link
                  </Button>
                  <Button
                    size="sm"
                    colorPalette="green"
                    onClick={handleWhatsApp}
                    disabled={!referralLink}
                    flex={1}
                  >
                    <FiShare2 />
                    Share on WhatsApp
                  </Button>
                </HStack>

                <HStack justify="center">
                  <Badge variant="subtle" colorPalette="gray" fontSize="xs">
                    Your referral code: {referral?.code ?? "…"}
                  </Badge>
                </HStack>
              </VStack>
            </Dialog.Body>

            <Dialog.Footer>
              <Button variant="ghost" size="sm" onClick={onClose} w="full">
                Maybe later — go to my dashboard
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
