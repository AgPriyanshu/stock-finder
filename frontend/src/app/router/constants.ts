export const RoutePath = {
  Root: "/",
  Login: "/login",
  Register: "/register",
  Terms: "/terms",
  Privacy: "/privacy",
  Shop: "/shops",
  Owner: "/owner",
  OwnerOnboarding: "/owner/onboarding",
  OwnerInventory: "/owner/inventory",
  OwnerLeads: "/owner/leads",
  OwnerShop: "/owner/shop",
} as const;

export type RoutePath = (typeof RoutePath)[keyof typeof RoutePath];
