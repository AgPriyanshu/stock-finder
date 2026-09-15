import { useBreakpointValue } from "@chakra-ui/react";
import { useOwnerProfile } from "api/auth";
import { RoutePath } from "app/router/constants";
import { useMemo } from "react";
import { useLocation } from "react-router";
import { useOwnerTour } from "../../hooks/use-owner-tour";
import { ProductTour, type TourStep } from "./product-tour";
import { ProductTourInviteStep } from "./product-tour-invite-step";
import { byTourId } from "./tour-targets";

const STEP_NAVIGATION: TourStep["actions"] = [
  { label: "Back", action: "prev" },
  { label: "Next", action: "next" },
];

const buildTourSteps = (isMobile: boolean, firstName?: string): TourStep[] => {
  const steps: TourStep[] = [
    {
      id: "welcome",
      type: "dialog",
      title: firstName ? `Namaste, ${firstName}! 🙏` : "Namaste! 🙏",
      description:
        "Let us show you around your shop portal. It takes just one minute.",
      // The tour only wires "next", "prev" and "dismiss" by name; other actions must be functions.
      actions: [
        { label: "Skip tour", action: (actions) => actions.skip() },
        { label: "Start tour", action: "next" },
      ],
    },
    {
      id: "add-item",
      type: "tooltip",
      target: byTourId("add-item"),
      placement: "bottom",
      title: "Add what you sell",
      description:
        "Tap “Add item” to put an item in your shop. Buyers near you can only find your shop when it has items.",
      actions: STEP_NAVIGATION,
    },
    {
      id: "keep-fresh",
      type: "dialog",
      title: "Keep your items up to date",
      description:
        "Each item stays visible to buyers for 30 days. When an item says “Refresh soon”, tap ⋮ next to it and choose Refresh.",
      actions: STEP_NAVIGATION,
    },
  ];

  // On phones the nav tabs are inside the ☰ menu, so point at the menu button instead.
  if (isMobile) {
    steps.push({
      id: "menu",
      type: "tooltip",
      target: byTourId("menu"),
      placement: "bottom-start",
      title: "Your menu",
      description:
        "Tap ☰ to open Leads, My Shop and Analytics. Messages from buyers come into Leads — reply to them on WhatsApp.",
      actions: STEP_NAVIGATION,
    });
  } else {
    steps.push(
      {
        id: "leads",
        type: "tooltip",
        target: byTourId("nav-leads"),
        placement: "bottom",
        title: "Messages from buyers",
        description:
          "When a buyer asks about your item, it shows up in Leads with a red dot. Reply to them on WhatsApp.",
        actions: STEP_NAVIGATION,
      },
      {
        id: "my-shop",
        type: "tooltip",
        target: byTourId("nav-shop"),
        placement: "bottom",
        title: "Your shop profile",
        description:
          "Add photos of your shop and check your location on the map, so buyers can find you easily.",
        actions: STEP_NAVIGATION,
      }
    );
  }

  steps.push(
    {
      id: "help",
      type: "tooltip",
      target: byTourId("help"),
      placement: "bottom-end",
      title: "Need help?",
      description: "Tap here any time to message our support team.",
      actions: STEP_NAVIGATION,
    },
    {
      id: "invite",
      type: "dialog",
      title: "Invite other shops",
      description: <ProductTourInviteStep />,
      // "next" is disabled on the last step, so Finish ends the tour with "dismiss".
      actions: [
        { label: "Back", action: "prev" },
        { label: "Finish", action: "dismiss" },
      ],
    }
  );

  return steps;
};

export const OwnerProductTour = () => {
  const { pathname } = useLocation();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { data: profile, isLoading: isProfileLoading } = useOwnerProfile();

  // The tour's targets are on the inventory page, where owners land after signing in.
  // It mounts only once everything its steps depend on is known.
  const { isActive, finish } = useOwnerTour(
    "portal",
    isMobile !== undefined &&
      !isProfileLoading &&
      pathname === RoutePath.OwnerInventory
  );

  const steps = useMemo(
    () => buildTourSteps(isMobile ?? false, profile?.firstName),
    [isMobile, profile?.firstName]
  );

  if (!isActive) return null;

  return <ProductTour steps={steps} onFinish={finish} />;
};
