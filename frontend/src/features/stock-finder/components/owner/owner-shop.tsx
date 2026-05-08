import {
  Badge,
  Box,
  Button,
  Center,
  Field,
  Heading,
  HStack,
  Input,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMyShop, useUpdateShop } from "api/stock-finder";
import { toaster } from "design-system/toaster/toaster-instance";
import { StaticShopMap } from "../shop/static-shop-map";

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
  const updateShop = useUpdateShop();

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
      <HStack justify="space-between" align="center">
        <VStack align="start" gap={0}>
          <Heading size="lg">Shop details</Heading>
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

      <StaticShopMap shop={shop} />

      <Box
        as="form"
        onSubmit={handleSubmit(onSubmit)}
        borderWidth="1px"
        borderColor="border.default"
        borderRadius="lg"
        bg="bg.panel"
        p={6}
      >
        <VStack gap={4} align="stretch">
          <HStack gap={4} align="start">
            <Field.Root invalid={!!errors.name} flex={1}>
              <Field.Label>Shop name</Field.Label>
              <Input {...register("name")} />
              {errors.name && (
                <Field.ErrorText>{errors.name.message}</Field.ErrorText>
              )}
            </Field.Root>

            <Field.Root invalid={!!errors.phone} flex={1}>
              <Field.Label>Phone</Field.Label>
              <Input {...register("phone")} />
              {errors.phone && (
                <Field.ErrorText>{errors.phone.message}</Field.ErrorText>
              )}
            </Field.Root>
          </HStack>

          <Field.Root invalid={!!errors.address}>
            <Field.Label>Address</Field.Label>
            <Input {...register("address")} placeholder="Street address" />
            {errors.address && (
              <Field.ErrorText>{errors.address.message}</Field.ErrorText>
            )}
          </Field.Root>

          <HStack gap={4} align="start">
            <Field.Root invalid={!!errors.city} flex={1}>
              <Field.Label>City</Field.Label>
              <Input {...register("city")} placeholder="City" />
              {errors.city && (
                <Field.ErrorText>{errors.city.message}</Field.ErrorText>
              )}
            </Field.Root>

            <Field.Root invalid={!!errors.pincode} flex={1}>
              <Field.Label>Pincode</Field.Label>
              <Input {...register("pincode")} placeholder="Pincode" />
              {errors.pincode && (
                <Field.ErrorText>{errors.pincode.message}</Field.ErrorText>
              )}
            </Field.Root>
          </HStack>

          <HStack justify="flex-end" pt={2}>
            <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
              Save changes
            </Button>
          </HStack>
        </VStack>
      </Box>
    </VStack>
  );
};
