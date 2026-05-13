import { useState } from "react";

export type OnboardingStep = "phone" | "shop-details" | "location" | "address";

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

export const useOnboardingState = (initialPhone = "") => {
  const [state, setState] = useState<OnboardingState>({
    step: initialPhone ? "shop-details" : "phone",
    phone: initialPhone,
    shopDetails: { name: "", whatsapp: initialPhone },
    location: EMPTY_LOCATION,
  });

  const advanceToShopDetails = (phone: string) =>
    setState((s) => ({ ...s, phone, step: "shop-details" }));

  const advanceToLocation = (shopDetails: ShopDetails) =>
    setState((s) => ({ ...s, shopDetails, step: "location" }));

  const advanceToAddress = (location: ShopLocation) =>
    setState((s) => ({ ...s, location, step: "address" }));

  return { ...state, advanceToShopDetails, advanceToLocation, advanceToAddress };
};
