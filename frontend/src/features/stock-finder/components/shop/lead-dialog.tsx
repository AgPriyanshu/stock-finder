import {
  Button,
  CloseButton,
  Dialog,
  Field,
  Input,
  Portal,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import type { SfSearchItem, SfShop } from "api/stock-finder";
import { useCreateLead, useRequestOtp, useVerifyOtp } from "api/stock-finder";
import { toaster } from "design-system/toaster/toaster-instance";
import { getAccessToken } from "shared/local-storage/token";
import { markRecentLead } from "../../hooks/use-recent-leads";

interface LeadDialogProps {
  shop: SfShop;
  item: SfSearchItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSent: () => void;
}

export const LeadDialog = ({
  shop,
  item,
  isOpen,
  onClose,
  onSent,
}: LeadDialogProps) => {
  const createLead = useCreateLead();
  const requestOtp = useRequestOtp();
  const verifyOtp = useVerifyOtp();
  const [buyerName, setBuyerName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isPhoneVerified, setIsPhoneVerified] = useState(!!getAccessToken());
  const [message, setMessage] = useState("");
  const defaultMessage = item
    ? `Hi, is this ${item.name} available? Best price?`
    : "";
  const needsOtp = !getAccessToken();

  const handleRequestOtp = async () => {
    try {
      await requestOtp.mutateAsync(phone);
      toaster.success({ title: "OTP sent" });
    } catch {
      toaster.error({ title: "Failed to send OTP" });
    }
  };

  const handleVerifyOtp = async () => {
    try {
      await verifyOtp.mutateAsync({ phone, otp });
      setIsPhoneVerified(true);
      toaster.success({ title: "Phone verified" });
    } catch {
      toaster.error({ title: "Invalid OTP" });
    }
  };

  const handleSubmit = async () => {
    if (!item) {
      return;
    }
    try {
      await createLead.mutateAsync({
        shopId: shop.id,
        itemId: item.id,
        buyerName,
        phone,
        message: message || defaultMessage,
      });
      markRecentLead(item.id);
      setMessage("");
      setOtp("");
      toaster.success({
        title: "Lead sent",
        description: "The shop owner will reach out via WhatsApp.",
      });
      onSent();
      onClose();
    } catch {
      toaster.error({ title: "Failed to send lead" });
    }
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(event) => !event.open && onClose()}
      placement="center"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Contact {shop.name}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <VStack align="stretch" gap={4}>
                <Field.Root>
                  <Field.Label>Name</Field.Label>
                  <Input
                    value={buyerName}
                    onChange={(event) => setBuyerName(event.target.value)}
                  />
                </Field.Root>
                <Field.Root required>
                  <Field.Label>Phone</Field.Label>
                  <Input
                    value={phone}
                    onChange={(event) => {
                      setPhone(event.target.value);
                      if (needsOtp) {
                        setIsPhoneVerified(false);
                        setOtp("");
                      }
                    }}
                    placeholder="+919876543210"
                  />
                </Field.Root>
                {needsOtp && (
                  <Field.Root required>
                    <Field.Label>OTP</Field.Label>
                    <Input
                      value={otp}
                      onChange={(event) => setOtp(event.target.value)}
                      placeholder="6 digit code"
                    />
                    <Button
                      mt={2}
                      size="sm"
                      variant="outline"
                      onClick={handleRequestOtp}
                      loading={requestOtp.isPending}
                      disabled={!phone}
                    >
                      Send OTP
                    </Button>
                    <Button
                      mt={2}
                      size="sm"
                      onClick={handleVerifyOtp}
                      loading={verifyOtp.isPending}
                      disabled={!phone || otp.length !== 6}
                    >
                      Verify phone
                    </Button>
                  </Field.Root>
                )}
                <Field.Root required>
                  <Field.Label>Message</Field.Label>
                  <Textarea
                    value={message || defaultMessage}
                    onChange={(event) => setMessage(event.target.value)}
                    rows={4}
                  />
                </Field.Root>
              </VStack>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                loading={createLead.isPending}
                disabled={
                  !phone ||
                  !(message || defaultMessage) ||
                  (needsOtp && !isPhoneVerified)
                }
              >
                Send lead
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
