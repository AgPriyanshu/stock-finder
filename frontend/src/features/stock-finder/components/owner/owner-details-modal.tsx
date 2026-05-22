import {
  Button,
  Dialog,
  Field,
  Input,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useUpdateOwnerProfile } from "api/auth/auth-api";
import { QueryKeys } from "api/query-keys";
import { queryClient } from "api/query-client";
import { toaster } from "design-system/toaster";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  firstName: z.string().min(1, "First name is required.").max(150),
  lastName: z.string().max(150).optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
}

export const OwnerDetailsModal = ({ isOpen }: Props) => {
  const { mutate: updateProfile, isPending } = useUpdateOwnerProfile();

  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormValues) => {
    updateProfile(
      { firstName: data.firstName.trim(), lastName: (data.lastName ?? "").trim() },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: QueryKeys.ownerProfile });
          toaster.create({ description: "Profile updated.", type: "success" });
        },
        onError: () => {
          toaster.create({ description: "Failed to save. Please try again.", type: "error" });
        },
      }
    );
  };

  return (
    <Dialog.Root open={isOpen} closeOnInteractOutside={false} closeOnEscape={false}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="sm" mx={4}>
            <Dialog.Header>
              <Dialog.Title>Complete your profile</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Text fontSize="sm" color="fg.muted" mb={4}>
                Please add your name before continuing — buyers see this on leads.
              </Text>
              <form id="owner-details-form" onSubmit={form.handleSubmit(onSubmit)}>
                <VStack gap={4} align="stretch">
                  <Field.Root invalid={!!form.formState.errors.firstName}>
                    <Field.Label>First name</Field.Label>
                    <Input
                      {...form.register("firstName")}
                      placeholder="e.g. Ramesh"
                      autoFocus
                    />
                    {form.formState.errors.firstName && (
                      <Field.ErrorText>
                        {form.formState.errors.firstName.message}
                      </Field.ErrorText>
                    )}
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>
                      Last name{" "}
                      <Text as="span" color="fg.muted" fontSize="xs">
                        (optional)
                      </Text>
                    </Field.Label>
                    <Input
                      {...form.register("lastName")}
                      placeholder="e.g. Sharma"
                    />
                  </Field.Root>
                </VStack>
              </form>
            </Dialog.Body>
            <Dialog.Footer>
              <Button
                type="submit"
                form="owner-details-form"
                loading={isPending}
                w="full"
              >
                Save &amp; continue
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
