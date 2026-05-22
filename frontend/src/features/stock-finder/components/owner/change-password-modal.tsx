import {
  Button,
  Dialog,
  Field,
  Input,
  Portal,
  VStack,
} from "@chakra-ui/react";
import { useChangePassword } from "api/auth/auth-api";
import { toaster } from "design-system/toaster";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal = ({ isOpen, onClose }: Props) => {
  const { mutate: changePassword, isPending } = useChangePassword();

  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = (data: FormValues) => {
    changePassword(
      { currentPassword: data.currentPassword, newPassword: data.newPassword },
      {
        onSuccess: () => {
          toaster.create({ description: "Password changed successfully.", type: "success" });
          handleClose();
        },
        onError: (err: unknown) => {
          const msg =
            (err as { response?: { data?: { current_password?: string[]; detail?: string } } })
              ?.response?.data?.current_password?.[0] ||
            (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
            "Failed to change password. Please try again.";
          toaster.create({ description: msg, type: "error" });
        },
      }
    );
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && handleClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="sm" mx={4}>
            <Dialog.Header>
              <Dialog.Title>Change password</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <form id="change-password-form" onSubmit={form.handleSubmit(onSubmit)}>
                <VStack gap={4} align="stretch">
                  <Field.Root invalid={!!form.formState.errors.currentPassword}>
                    <Field.Label>Current password</Field.Label>
                    <Input
                      {...form.register("currentPassword")}
                      type="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                    {form.formState.errors.currentPassword && (
                      <Field.ErrorText>
                        {form.formState.errors.currentPassword.message}
                      </Field.ErrorText>
                    )}
                  </Field.Root>

                  <Field.Root invalid={!!form.formState.errors.newPassword}>
                    <Field.Label>New password</Field.Label>
                    <Input
                      {...form.register("newPassword")}
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                    {form.formState.errors.newPassword && (
                      <Field.ErrorText>
                        {form.formState.errors.newPassword.message}
                      </Field.ErrorText>
                    )}
                  </Field.Root>

                  <Field.Root invalid={!!form.formState.errors.confirmPassword}>
                    <Field.Label>Confirm new password</Field.Label>
                    <Input
                      {...form.register("confirmPassword")}
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                    {form.formState.errors.confirmPassword && (
                      <Field.ErrorText>
                        {form.formState.errors.confirmPassword.message}
                      </Field.ErrorText>
                    )}
                  </Field.Root>
                </VStack>
              </form>
            </Dialog.Body>
            <Dialog.Footer gap={2}>
              <Button variant="ghost" onClick={handleClose} disabled={isPending}>
                Cancel
              </Button>
              <Button
                type="submit"
                form="change-password-form"
                loading={isPending}
              >
                Update password
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
