import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Field,
  HStack,
  Input,
  Portal,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { FiStar } from "react-icons/fi";
import type { SfSearchItem, SfShop } from "api/stock-finder";
import {
  useCreateLead,
  useCreateReview,
  useRequestOtp,
  useVerifyOtp,
} from "api/stock-finder";
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

const StarRating = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) => {
  const [hovered, setHovered] = useState(0);
  return (
    <HStack gap={1}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Box
          key={star}
          as="button"
          color={(hovered || value) >= star ? "yellow.400" : "fg.muted"}
          fontSize="2xl"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          aria-label={`Rate ${star} stars`}
          transition="color 100ms ease"
        >
          <FiStar
            fill={(hovered || value) >= star ? "currentColor" : "none"}
          />
        </Box>
      ))}
    </HStack>
  );
};

type Step = "form" | "rating";

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
  const createReview = useCreateReview(shop.id);

  const [step, setStep] = useState<Step>("form");
  const [submittedLeadId, setSubmittedLeadId] = useState<string | null>(null);
  const [buyerName, setBuyerName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isPhoneVerified, setIsPhoneVerified] = useState(!!getAccessToken());
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const defaultMessage = item
    ? `Hi, is this ${item.name} available? Best price?`
    : "";
  const needsOtp = !getAccessToken();

  const handleClose = () => {
    setStep("form");
    setSubmittedLeadId(null);
    setRating(0);
    setReviewComment("");
    onClose();
  };

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
    if (!item) return;
    try {
      const lead = await createLead.mutateAsync({
        shopId: shop.id,
        itemId: item.id,
        buyerName,
        phone,
        message: message || defaultMessage,
      });
      markRecentLead(item.id);
      setMessage("");
      setOtp("");
      setSubmittedLeadId(lead.id);
      onSent();
      setStep("rating");
    } catch {
      toaster.error({ title: "Failed to send lead" });
    }
  };

  const handleSubmitRating = async () => {
    if (!submittedLeadId || rating === 0) {
      handleClose();
      return;
    }
    try {
      await createReview.mutateAsync({
        leadId: submittedLeadId,
        rating,
        comment: reviewComment,
      });
      toaster.success({ title: "Thanks for your review!" });
    } catch {
      // Rating failure is non-blocking.
    }
    handleClose();
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(event) => !event.open && handleClose()}
      placement="center"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            {step === "form" ? (
              <>
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
                  <Button variant="ghost" onClick={handleClose}>
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
              </>
            ) : (
              <>
                <Dialog.Header>
                  <Dialog.Title>Rate this shop</Dialog.Title>
                </Dialog.Header>
                <Dialog.Body>
                  <VStack align="stretch" gap={5}>
                    <Text color="text.secondary" fontSize="sm">
                      Your lead was sent! How would you rate {shop.name}?
                    </Text>
                    <VStack align="start" gap={2}>
                      <StarRating value={rating} onChange={setRating} />
                      {rating > 0 && (
                        <Text fontSize="xs" color="text.secondary">
                          {
                            ["", "Poor", "Fair", "Good", "Very good", "Excellent"][
                              rating
                            ]
                          }
                        </Text>
                      )}
                    </VStack>
                    {rating > 0 && (
                      <Field.Root>
                        <Field.Label>Comment (optional)</Field.Label>
                        <Textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Share your experience..."
                          rows={3}
                        />
                      </Field.Root>
                    )}
                  </VStack>
                </Dialog.Body>
                <Dialog.Footer>
                  <Button variant="ghost" onClick={handleClose}>
                    Skip
                  </Button>
                  <Button
                    onClick={handleSubmitRating}
                    loading={createReview.isPending}
                    disabled={rating === 0}
                  >
                    Submit rating
                  </Button>
                </Dialog.Footer>
              </>
            )}
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
