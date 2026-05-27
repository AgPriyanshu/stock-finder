import { startTransition, useEffect, useState } from "react";

export type OnboardingStep = "phone" | "profile" | "shop-details" | "location" | "address";

export interface OwnerName {
  firstName: string;
  lastName: string;
}

export interface ShopDetails {
  name: string;
  whatsapp: string;
}

export interface ShopLocation {
  lat: number;
  lng: number;
  nominatimAddress: string;
}

interface OnboardingState {
  step: OnboardingStep;
  phone: string;
  shopDetails: ShopDetails;
  location: ShopLocation;
}

const EMPTY_LOCATION: ShopLocation = { lat: 0, lng: 0, nominatimAddress: "" };

export const useOnboardingState = (initialPhone = "", needsName = false) => {
  const firstStep = initialPhone
    ? needsName ? "profile" : "shop-details"
    : "phone";

  const [state, setState] = useState<OnboardingState>({
    step: firstStep,
    phone: initialPhone,
    shopDetails: { name: "", whatsapp: initialPhone },
    location: EMPTY_LOCATION,
  });

  // Correct the initial step once needsName is known after profile loads.
  useEffect(() => {
    if (needsName && state.step === "shop-details") {
      startTransition(() => setState((s) => ({ ...s, step: "profile" })));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsName]);

  const advanceToShopDetails = (phone: string) =>
    setState((s) => ({ ...s, phone, step: needsName ? "profile" : "shop-details" }));

  const advanceFromProfile = () =>
    setState((s) => ({ ...s, step: "shop-details" }));

  const advanceToLocation = (shopDetails: ShopDetails) =>
    setState((s) => ({ ...s, shopDetails, step: "location" }));

  const advanceToAddress = (location: ShopLocation) =>
    setState((s) => ({ ...s, location, step: "address" }));

  return { ...state, advanceToShopDetails, advanceFromProfile, advanceToLocation, advanceToAddress };
};
