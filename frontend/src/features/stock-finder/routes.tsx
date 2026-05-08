import { Navigate, Route, Routes } from "react-router";
import {
  getAccessToken,
  getOwnerToken,
  setAccessToken,
} from "shared/local-storage/token";
import { LoginPage } from "./components/auth/login-page";
import { LeadInbox } from "./components/owner/lead-inbox";
import { OnboardingFlow } from "./components/owner/onboarding-flow";
import { InventoryList } from "./components/owner/inventory-list";
import { OwnerLayout } from "./components/owner/owner-layout";
import { OwnerShop } from "./components/owner/owner-shop";
import { PrivacyPage } from "./components/legal/privacy";
import { TermsPage } from "./components/legal/terms";
import { SearchPage } from "./components/search/search-page";
import { ShopProfile } from "./components/shop/shop-profile";
import { StockFinderPage } from "./stock-finder";

const OwnerRoute = ({ children }: { children: React.ReactNode }) => {
  const ownerToken = getOwnerToken();

  if (!ownerToken) {
    return <Navigate to="/login" replace />;
  }
  if (getAccessToken() !== ownerToken) {
    setAccessToken(ownerToken);
  }
  return <>{children}</>;
};

const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const ownerToken = getOwnerToken();

  if (ownerToken) {
    return <Navigate to="/owner/inventory" replace />;
  }
  return <>{children}</>;
};

export const StockFinderRoutes = () => (
  <Routes>
    <Route element={<StockFinderPage />}>
      {/* Public routes — no auth required. */}
      <Route index element={<SearchPage />} />
      <Route
        path="login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route path="shops/:id" element={<ShopProfile />} />
      <Route path="terms" element={<TermsPage />} />
      <Route path="privacy" element={<PrivacyPage />} />

      {/* Owner routes — require authentication, rendered inside OwnerLayout. */}
      <Route
        path="owner/onboarding"
        element={
          <OwnerRoute>
            <OnboardingFlow />
          </OwnerRoute>
        }
      />
      <Route
        element={
          <OwnerRoute>
            <OwnerLayout />
          </OwnerRoute>
        }
      >
        <Route path="owner/inventory" element={<InventoryList />} />
        <Route path="owner/leads" element={<LeadInbox />} />
        <Route path="owner/shop" element={<OwnerShop />} />
      </Route>
    </Route>
  </Routes>
);
