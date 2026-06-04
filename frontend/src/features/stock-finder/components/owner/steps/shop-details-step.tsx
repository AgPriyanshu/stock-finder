import {
  Button,
  Field,
  Heading,
  Input,
  InputGroup,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import type { ShopDetails } from "../../../hooks/use-onboarding-state";

const PHONE_REGEX = /^[6-9]\d{9}$/;
const NAME_MIN = 2;
const NAME_MAX = 60;

interface ShopDetailsStepProps {
  defaultPhone: string;
  onNext: (details: ShopDetails) => void;
}

export const ShopDetailsStep = ({
  defaultPhone,
  onNext,
}: ShopDetailsStepProps) => {
  const rawDefault = defaultPhone.replace("+91", "").replace(/\D/g, "");
  const phoneVerified = PHONE_REGEX.test(rawDefault);

  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState(phoneVerified ? rawDefault : "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    const trimmed = name.trim();
    if (trimmed.length < NAME_MIN || trimmed.length > NAME_MAX) {
      next.name = `Shop name must be ${NAME_MIN}–${NAME_MAX} characters.`;
    }
    if (!phoneVerified) {
      if (!whatsapp) {
        next.whatsapp = "Mobile number is required.";
      } else if (!PHONE_REGEX.test(whatsapp)) {
        next.whatsapp = "Enter a valid 10-digit Indian mobile number.";
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    onNext({
      name: name.trim(),
      whatsapp: `+91${whatsapp}`,
    });
  };

  return (
    <VStack className="shop-details-step" gap={6} w="full" maxW="sm" mx="auto">
      <VStack gap={1} w="full">
        <Heading size="lg" textAlign="center">
          Your shop
        </Heading>
        <Text color="text.secondary" textAlign="center" fontSize="sm">
          Tell buyers about your store.
        </Text>
      </VStack>

      <Field.Root invalid={!!errors.name} w="full">
        <Field.Label>Shop name</Field.Label>
        <Input
          placeholder="e.g. Sharma Hardware Store"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={NAME_MAX}
        />
        {errors.name && <Field.ErrorText>{errors.name}</Field.ErrorText>}
      </Field.Root>

      {!phoneVerified && (
        <Field.Root invalid={!!errors.whatsapp} w="full">
          <Field.Label>WhatsApp number</Field.Label>
          <InputGroup startElement={<Text fontSize="sm">+91</Text>}>
            <Input
              pl={10}
              type="tel"
              inputMode="numeric"
              placeholder="9876543210"
              maxLength={10}
              value={whatsapp}
              onChange={(e) =>
                setWhatsapp(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
            />
          </InputGroup>
          {errors.whatsapp && (
            <Field.ErrorText>{errors.whatsapp}</Field.ErrorText>
          )}
        </Field.Root>
      )}

      <Button
        w="full"
        bg="intent.primary"
        color="text.onIntent"
        onClick={handleNext}
        disabled={!name.trim() || (!phoneVerified && whatsapp.length !== 10)}
      >
        Next — pin your location
      </Button>
    </VStack>
  );
};
