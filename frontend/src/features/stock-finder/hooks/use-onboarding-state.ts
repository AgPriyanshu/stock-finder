import { useState } from "react";

export type OnboardingStep = "phone" | "shop-details" | "location";

export interface ShopDetails {
  name: string;
  whatsapp: string;
  categorySlug: string;
}

interface OnboardingState {
  step: OnboardingStep;
  phone: string;
  shopDetails: ShopDetails;
}

export const useOnboardingState = (initialPhone = "") => {
  const [state, setState] = useState<OnboardingState>({
    step: initialPhone ? "shop-details" : "phone",
    phone: initialPhone,
    shopDetails: { name: "", whatsapp: initialPhone, categorySlug: "" },
  });

  const advanceToShopDetails = (phone: string) =>
    setState((s) => ({ ...s, phone, step: "shop-details" }));

  const advanceToLocation = (shopDetails: ShopDetails) =>
    setState((s) => ({ ...s, shopDetails, step: "location" }));

  return { ...state, advanceToShopDetails, advanceToLocation };
};
