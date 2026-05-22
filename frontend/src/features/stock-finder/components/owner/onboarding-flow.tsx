import {
  Box,
  Button,
  Center,
  Flex,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useOwnerProfile } from "api/auth/auth-api";
import { useMyShop } from "api/stock-finder";
import { queryClient } from "api/query-client";
import { RoutePath } from "app/router/constants";
import { clearOwnerToken, clearToken } from "shared/local-storage";
import { useLocation, useNavigate } from "react-router";
import { useOnboardingState } from "../../hooks/use-onboarding-state";
import { AddressStep } from "./steps/address-step";
import { LocationStep } from "./steps/location-step";
import { PhoneStep } from "./steps/phone-step";
import { ProfileStep } from "./steps/profile-step";
import { ShopDetailsStep } from "./steps/shop-details-step";
import { BrandHeading } from "../brand-heading";

const StepBar = ({
  labels,
  current,
}: {
  labels: string[];
  current: number;
}) => (
  <Flex className="ds-step-bar" gap={2} w="full" maxW="sm" mx="auto">
    {labels.map((label, i) => (
      <Box key={label} flex={1} textAlign="center">
        <Box
          h={1}
          borderRadius="full"
          bg={i <= current ? "intent.primary" : "border.default"}
          mb={1}
          transition="background 0.2s"
        />
        <Text
          fontSize="xs"
          color={i <= current ? "text.primary" : "text.muted"}
        >
          {label}
        </Text>
      </Box>
    ))}
  </Flex>
);

export const OnboardingFlow = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefilledPhone =
    (location.state as { phone?: string } | null)?.phone ?? "";

  const { data: shop, isLoading: shopLoading } = useMyShop();
  const { data: profile, isLoading: profileLoading } = useOwnerProfile();

  const needsName =
    !profileLoading && !profile?.firstName?.trim();

  const state = useOnboardingState(prefilledPhone, needsName);

  if (shopLoading || profileLoading) {
    return (
      <Center h="full">
        <Spinner />
      </Center>
    );
  }

  if (shop) {
    navigate(RoutePath.OwnerInventory, { replace: true });
    return null;
  }

  const phoneVerified = !!prefilledPhone;

  const buildLabels = () => {
    const base = needsName
      ? ["Owner details", "Shop details", "Location", "Address"]
      : ["Shop details", "Location", "Address"];
    return phoneVerified ? base : ["Phone", ...base];
  };

  const buildIndex = (): number => {
    const stepMap: Record<string, number> = phoneVerified
      ? needsName
        ? { profile: 0, "shop-details": 1, location: 2, address: 3 }
        : { "shop-details": 0, location: 1, address: 2 }
      : needsName
      ? { phone: 0, profile: 1, "shop-details": 2, location: 3, address: 4 }
      : { phone: 0, "shop-details": 1, location: 2, address: 3 };
    return stepMap[state.step] ?? 0;
  };

  const handleLogout = () => {
    clearOwnerToken();
    clearToken();
    queryClient.clear();
    navigate(RoutePath.Login, { replace: true });
  };

  return (
    <Box
      className="onboarding-flow"
      w="full"
      minH="100vh"
      display="flex"
      flexDirection="column"
      px={4}
    >
      <Flex
        justify="space-between"
        align="center"
        py={4}
        maxW="sm"
        mx="auto"
        w="full"
      >
        <BrandHeading size="md" />
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </Flex>

      <Flex flex={1} py={8}>
        <VStack mt={"2rem"} gap={8} w="full">
          <StepBar labels={buildLabels()} current={buildIndex()} />
          {state.step === "phone" && (
            <PhoneStep onVerified={state.advanceToShopDetails} />
          )}
          {state.step === "profile" && (
            <ProfileStep onNext={state.advanceFromProfile} />
          )}
          {state.step === "shop-details" && (
            <ShopDetailsStep
              defaultPhone={state.phone}
              onNext={state.advanceToLocation}
            />
          )}
          {state.step === "location" && (
            <LocationStep onNext={state.advanceToAddress} />
          )}
          {state.step === "address" && (
            <AddressStep
              shopDetails={state.shopDetails}
              location={state.location}
            />
          )}
        </VStack>
      </Flex>
    </Box>
  );
};
