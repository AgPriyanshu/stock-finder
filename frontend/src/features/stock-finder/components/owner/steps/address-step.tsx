import {
  Button,
  Field,
  Heading,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useCreateShop } from "api/stock-finder";
import { RoutePath } from "app/router/constants";
import { useState } from "react";
import { useNavigate } from "react-router";
import type { ShopDetails, ShopLocation } from "../../../hooks/use-onboarding-state";

const PINCODE_REGEX = /^\d{6}$/;

interface AddressStepProps {
  shopDetails: ShopDetails;
  location: ShopLocation;
}

export const AddressStep = ({ shopDetails, location }: AddressStepProps) => {
  const navigate = useNavigate();
  const { mutate: createShop, isPending } = useCreateShop();

  const [address, setAddress] = useState(location.nominatimAddress);
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!address.trim()) {
      next.address = "Address is required.";
    }
    if (!city.trim()) {
      next.city = "City is required.";
    }
    if (pincode && !PINCODE_REGEX.test(pincode)) {
      next.pincode = "Enter a valid 6-digit pincode.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    createShop(
      {
        name: shopDetails.name,
        phone: shopDetails.whatsapp,
        latitude: location.lat,
        longitude: location.lng,
        address: address.trim(),
        city: city.trim(),
        pincode: pincode.trim() || undefined,
      },
      {
        onSuccess: () => {
          navigate(RoutePath.OwnerInventory, { replace: true });
        },
      },
    );
  };

  return (
    <VStack className="address-step" gap={6} w="full" maxW="sm" mx="auto">
      <VStack gap={1} w="full">
        <Heading size="lg" textAlign="center">
          Shop address
        </Heading>
        <Text color="text.secondary" textAlign="center" fontSize="sm">
          Help customers find you easily.
        </Text>
      </VStack>

      <Field.Root invalid={!!errors.address} w="full">
        <Field.Label>Address</Field.Label>
        <Input
          placeholder="e.g. 12, Gandhi Road, Near Bus Stand"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        {errors.address && <Field.ErrorText>{errors.address}</Field.ErrorText>}
      </Field.Root>

      <Field.Root invalid={!!errors.city} w="full">
        <Field.Label>City</Field.Label>
        <Input
          placeholder="e.g. Meerut"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        {errors.city && <Field.ErrorText>{errors.city}</Field.ErrorText>}
      </Field.Root>

      <Field.Root invalid={!!errors.pincode} w="full">
        <Field.Label>Pincode <Text as="span" color="text.muted" fontSize="xs">(optional)</Text></Field.Label>
        <Input
          placeholder="e.g. 250001"
          inputMode="numeric"
          maxLength={6}
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        />
        {errors.pincode && <Field.ErrorText>{errors.pincode}</Field.ErrorText>}
      </Field.Root>

      <Button
        w="full"
        bg="intent.primary"
        color="text.onIntent"
        onClick={handleSubmit}
        loading={isPending}
        disabled={isPending || !address.trim() || !city.trim()}
      >
        Create Shop
      </Button>
    </VStack>
  );
};
