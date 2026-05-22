import {
  Badge,
  Box,
  Button,
  Center,
  Field,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import * as z from "zod";
import { FiMapPin } from "react-icons/fi";
import { useOwnerProfile, useUpdateOwnerProfile } from "api/auth/auth-api";
import { QueryKeys } from "api/query-keys";
import { queryClient } from "api/query-client";
import { useMyShop, useUpdateShop } from "api/stock-finder";
import { toaster } from "design-system/toaster/toaster-instance";
import { LocationPickerDialog } from "../search/location-picker-dialog";
import { StaticShopMap } from "../shop/static-shop-map";
import { ShopImageUploader } from "./shop-image-uploader";

const ownerSchema = z.object({
  firstName: z.string().min(1, "First name is required.").max(150),
  lastName: z.string().max(150).optional(),
});

type OwnerFormValues = z.infer<typeof ownerSchema>;

const shopSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(6, "Enter a valid phone number"),
  address: z.string().optional(),
  city: z.string().optional(),
  pincode: z.string().optional(),
});

type ShopFormValues = z.infer<typeof shopSchema>;

export const OwnerShop = () => {
  const { data: shop, isLoading } = useMyShop();
  const { data: profile } = useOwnerProfile();
  const updateShop = useUpdateShop();
  const { mutateAsync: updateProfile } = useUpdateOwnerProfile();
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);

  const ownerForm = useForm<OwnerFormValues>({
    resolver: zodResolver(ownerSchema),
    values: profile
      ? { firstName: profile.firstName, lastName: profile.lastName ?? "" }
      : undefined,
  });

  const onOwnerSubmit = async (data: OwnerFormValues) => {
    try {
      await updateProfile({ firstName: data.firstName.trim(), lastName: (data.lastName ?? "").trim() });
      queryClient.invalidateQueries({ queryKey: QueryKeys.ownerProfile });
      toaster.success({ title: "Owner details updated" });
      ownerForm.reset(data);
    } catch {
      toaster.error({ title: "Failed to update owner details" });
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<ShopFormValues>({
    resolver: zodResolver(shopSchema),
    values: shop
      ? {
          name: shop.name,
          phone: shop.phone,
          address: shop.address ?? "",
          city: shop.city ?? "",
          pincode: shop.pincode ?? "",
        }
      : undefined,
  });

  const onSubmit = async (data: ShopFormValues) => {
    try {
      await updateShop.mutateAsync(data);
      toaster.success({ title: "Shop details updated" });
      reset(data);
    } catch {
      toaster.error({ title: "Failed to update shop details" });
    }
  };

  if (isLoading) {
    return (
      <Center py={12}>
        <Spinner />
      </Center>
    );
  }

  if (!shop) {
    return <Text>Shop not found.</Text>;
  }

  return (
    <VStack className="owner-shop" align="stretch" gap={6}>
      <HStack justify="space-between" align="center" gap={3}>
        <VStack align="start" gap={0}>
          <Heading size={{ base: "md", md: "lg" }}>Shop details</Heading>
          <Text color="text.secondary" fontSize="sm">
            This is how buyers see your shop.
          </Text>
        </VStack>
        {shop.isVerified && (
          <Badge colorPalette="green" size="lg">
            Verified
          </Badge>
        )}
      </HStack>

      <Box>
        <StaticShopMap shop={shop} />
        <Button
          size="sm"
          variant="outline"
          mt={2}
          onClick={() => setLocationPickerOpen(true)}
        >
          <FiMapPin /> Change location
        </Button>
      </Box>

      <LocationPickerDialog
        isOpen={locationPickerOpen}
        currentLat={shop.lat ?? undefined}
        currentLng={shop.lng ?? undefined}
        onClose={() => setLocationPickerOpen(false)}
        onConfirm={async ({ lat, lng }) => {
          try {
            await updateShop.mutateAsync({ latitude: lat, longitude: lng });
            toaster.success({ title: "Location updated" });
          } catch {
            toaster.error({ title: "Failed to update location" });
          }
        }}
      />

      <Box
        borderWidth="1px"
        borderColor="border.default"
        borderRadius="lg"
        bg="bg.panel"
        p={{ base: 4, md: 6 }}
      >
        <VStack gap={4} align="stretch">
          <Text fontWeight="medium">Shop photos</Text>
          <Text fontSize="sm" color="text.secondary">
            Add up to 3 photos of your shop or products. Buyers see these on
            your shop profile.
          </Text>
          <ShopImageUploader images={shop.images ?? []} />
        </VStack>
      </Box>

      <Box
        as="form"
        onSubmit={ownerForm.handleSubmit(onOwnerSubmit)}
        borderWidth="1px"
        borderColor="border.default"
        borderRadius="lg"
        bg="bg.panel"
        p={{ base: 4, md: 6 }}
      >
        <VStack gap={4} align="stretch">
          <Text fontWeight="medium">Owner details</Text>
          <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
            <Field.Root invalid={!!ownerForm.formState.errors.firstName}>
              <Field.Label>First name</Field.Label>
              <Input {...ownerForm.register("firstName")} placeholder="e.g. Ramesh" />
              {ownerForm.formState.errors.firstName && (
                <Field.ErrorText>{ownerForm.formState.errors.firstName.message}</Field.ErrorText>
              )}
            </Field.Root>

            <Field.Root>
              <Field.Label>
                Last name{" "}
                <Text as="span" color="fg.muted" fontSize="xs">(optional)</Text>
              </Field.Label>
              <Input {...ownerForm.register("lastName")} placeholder="e.g. Sharma" />
            </Field.Root>
          </SimpleGrid>

          <HStack justify={{ base: "stretch", sm: "flex-end" }} pt={2}>
            <Button
              type="submit"
              loading={ownerForm.formState.isSubmitting}
              disabled={!ownerForm.formState.isDirty}
              w={{ base: "full", sm: "auto" }}
            >
              Save changes
            </Button>
          </HStack>
        </VStack>
      </Box>

      <Box
        as="form"
        onSubmit={handleSubmit(onSubmit)}
        borderWidth="1px"
        borderColor="border.default"
        borderRadius="lg"
        bg="bg.panel"
        p={{ base: 4, md: 6 }}
      >
        <VStack gap={4} align="stretch">
          <Text fontWeight="medium">Shop details</Text>
          <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
            <Field.Root invalid={!!errors.name}>
              <Field.Label>Shop name</Field.Label>
              <Input {...register("name")} />
              {errors.name && (
                <Field.ErrorText>{errors.name.message}</Field.ErrorText>
              )}
            </Field.Root>

            <Field.Root invalid={!!errors.phone}>
              <Field.Label>Phone</Field.Label>
              <Input {...register("phone")} />
              {errors.phone && (
                <Field.ErrorText>{errors.phone.message}</Field.ErrorText>
              )}
            </Field.Root>
          </SimpleGrid>

          <Field.Root invalid={!!errors.address}>
            <Field.Label>Address</Field.Label>
            <Input {...register("address")} placeholder="Street address" />
            {errors.address && (
              <Field.ErrorText>{errors.address.message}</Field.ErrorText>
            )}
          </Field.Root>

          <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
            <Field.Root invalid={!!errors.city}>
              <Field.Label>City</Field.Label>
              <Input {...register("city")} placeholder="City" />
              {errors.city && (
                <Field.ErrorText>{errors.city.message}</Field.ErrorText>
              )}
            </Field.Root>

            <Field.Root invalid={!!errors.pincode}>
              <Field.Label>Pincode</Field.Label>
              <Input {...register("pincode")} placeholder="Pincode" />
              {errors.pincode && (
                <Field.ErrorText>{errors.pincode.message}</Field.ErrorText>
              )}
            </Field.Root>
          </SimpleGrid>

          <HStack justify={{ base: "stretch", sm: "flex-end" }} pt={2}>
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={!isDirty}
              w={{ base: "full", sm: "auto" }}
            >
              Save changes
            </Button>
          </HStack>
        </VStack>
      </Box>
    </VStack>
  );
};
