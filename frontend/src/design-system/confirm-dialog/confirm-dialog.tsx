import { Button, CloseButton, Dialog, Portal } from "@chakra-ui/react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  isLoading?: boolean;
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmation",
  description,
  confirmLabel = "Confirm",
  isLoading = false,
}: ConfirmDialogProps) => {
  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(event) => !event.open && onClose()}
      placement={"center"}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{title}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>{description}</Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                onClick={onConfirm}
                loading={isLoading}
                bgColor={"intent.danger"}
                color={"white"}
              >
                {confirmLabel}
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton onClick={onClose} size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
