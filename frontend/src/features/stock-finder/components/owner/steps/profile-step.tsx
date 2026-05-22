import {
  Button,
  Field,
  Heading,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useUpdateOwnerProfile } from "api/auth/auth-api";
import { toaster } from "design-system/toaster";
import { useState } from "react";

interface ProfileStepProps {
  onNext: () => void;
}

export const ProfileStep = ({ onNext }: ProfileStepProps) => {
  const { mutate: updateProfile, isPending } = useUpdateOwnerProfile();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!firstName.trim()) {
      next.firstName = "First name is required.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;

    updateProfile(
      { firstName: firstName.trim(), lastName: lastName.trim() },
      {
        onSuccess: () => onNext(),
        onError: () => {
          toaster.create({ description: "Failed to save your name. Please try again.", type: "error" });
        },
      }
    );
  };

  return (
    <VStack className="profile-step" gap={6} w="full" maxW="sm" mx="auto">
      <VStack gap={1} w="full">
        <Heading size="lg" textAlign="center">
          Owner details
        </Heading>
        <Text color="text.secondary" textAlign="center" fontSize="sm">
          Let your customers know who they are dealing with.
        </Text>
      </VStack>

      <Field.Root invalid={!!errors.firstName} w="full">
        <Field.Label>First name</Field.Label>
        <Input
          placeholder="e.g. Ramesh"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          maxLength={150}
          autoFocus
        />
        {errors.firstName && (
          <Field.ErrorText>{errors.firstName}</Field.ErrorText>
        )}
      </Field.Root>

      <Field.Root w="full">
        <Field.Label>
          Last name{" "}
          <Text as="span" color="text.muted" fontSize="xs">
            (optional)
          </Text>
        </Field.Label>
        <Input
          placeholder="e.g. Sharma"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          maxLength={150}
        />
      </Field.Root>

      <Button
        w="full"
        bg="intent.primary"
        color="text.onIntent"
        onClick={handleNext}
        loading={isPending}
        disabled={!firstName.trim() || isPending}
      >
        Next — your shop
      </Button>
    </VStack>
  );
};
