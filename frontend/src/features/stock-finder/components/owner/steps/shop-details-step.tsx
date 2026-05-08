import {
  Button,
  Field,
  Heading,
  Input,
  InputGroup,
  Text,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { useCategories } from "api/stock-finder";
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
  const rawDefault = defaultPhone.replace("+91", "");
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState(rawDefault);
  const [categorySlug, setCategorySlug] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: categories = [] } = useCategories();

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    const trimmed = name.trim();
    if (trimmed.length < NAME_MIN || trimmed.length > NAME_MAX) {
      next.name = `Shop name must be ${NAME_MIN}–${NAME_MAX} characters.`;
    }
    if (whatsapp && !PHONE_REGEX.test(whatsapp)) {
      next.whatsapp = "Enter a valid 10-digit Indian mobile number.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    onNext({
      name: name.trim(),
      whatsapp: whatsapp ? `+91${whatsapp}` : defaultPhone,
      categorySlug,
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

      {categories.length > 0 && (
        <Field.Root w="full">
          <Field.Label>Shop type (optional)</Field.Label>
          <Wrap gap={2} mt={1}>
            {categories.map((cat) => (
              <WrapItem key={cat.slug}>
                <Button
                  size="sm"
                  variant={categorySlug === cat.slug ? "solid" : "outline"}
                  bg={categorySlug === cat.slug ? "intent.primary" : undefined}
                  color={
                    categorySlug === cat.slug ? "text.onIntent" : undefined
                  }
                  borderRadius="full"
                  onClick={() =>
                    setCategorySlug((prev) =>
                      prev === cat.slug ? "" : cat.slug
                    )
                  }
                >
                  {cat.name}
                </Button>
              </WrapItem>
            ))}
          </Wrap>
        </Field.Root>
      )}

      <Button
        w="full"
        bg="intent.primary"
        color="text.onIntent"
        onClick={handleNext}
        disabled={!name.trim()}
      >
        Next — pin your location
      </Button>
    </VStack>
  );
};
