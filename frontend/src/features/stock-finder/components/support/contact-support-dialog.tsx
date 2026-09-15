import {
  Button,
  CloseButton,
  Dialog,
  Field,
  HStack,
  Input,
  Portal,
  Separator,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSupportRequest } from "api/auth/auth-api";
import { toaster } from "design-system/toaster";
import { useForm } from "react-hook-form";
import { FaWhatsapp } from "react-icons/fa";
import { z } from "zod";

const SUPPORT_WHATSAPP_URL = `https://wa.me/919997371300?text=${encodeURIComponent(
  "Hi, I need help with Stock Finder.",
)}`;

const schema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Keep the title under 200 characters"),
  comments: z
    .string()
    .trim()
    .min(1, "Tell us how we can help")
    .max(5000, "Keep comments under 5000 characters"),
});

type FormValues = z.infer<typeof schema>;

interface ContactSupportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactSupportDialog = ({
  isOpen,
  onClose,
}: ContactSupportDialogProps) => {
  const { mutate: sendSupportRequest, isPending } = useSupportRequest();
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });
  const { errors } = form.formState;

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = (data: FormValues) => {
    sendSupportRequest(data, {
      onSuccess: () => {
        toaster.create({
          description:
            "Thanks! We've received your message and will get back to you soon.",
          type: "success",
        });
        handleClose();
      },
      onError: () => {
        toaster.create({
          description:
            "Couldn't send your message. Please try again or reach us on WhatsApp.",
          type: "error",
        });
      },
    });
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(e) => !e.open && handleClose()}
      placement="center"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content className="contact-support-dialog" maxW="md" mx={4}>
            <Dialog.Header>
              <Dialog.Title>Contact support</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <VStack gap={4} align="stretch">
                <Button asChild variant="outline" colorPalette="green">
                  <a
                    href={SUPPORT_WHATSAPP_URL}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FaWhatsapp />
                    Chat with us on WhatsApp
                  </a>
                </Button>

                <HStack gap={3}>
                  <Separator flex={1} />
                  <Text fontSize="xs" color="fg.muted" whiteSpace="nowrap">
                    or send us a message
                  </Text>
                  <Separator flex={1} />
                </HStack>

                <form
                  id="contact-support-form"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <VStack gap={4} align="stretch">
                    <Field.Root invalid={!!errors.title}>
                      <Field.Label>Title</Field.Label>
                      <Input
                        {...form.register("title")}
                        placeholder="e.g. Can't upload item photos"
                      />
                      {errors.title && (
                        <Field.ErrorText>
                          {errors.title.message}
                        </Field.ErrorText>
                      )}
                    </Field.Root>

                    <Field.Root invalid={!!errors.comments}>
                      <Field.Label>Comments</Field.Label>
                      <Textarea
                        {...form.register("comments")}
                        placeholder="Describe the problem or question in as much detail as you can."
                        rows={5}
                      />
                      {errors.comments && (
                        <Field.ErrorText>
                          {errors.comments.message}
                        </Field.ErrorText>
                      )}
                    </Field.Root>
                  </VStack>
                </form>
              </VStack>
            </Dialog.Body>
            <Dialog.Footer gap={2}>
              <Button
                variant="ghost"
                onClick={handleClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="contact-support-form"
                loading={isPending}
              >
                Send message
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
