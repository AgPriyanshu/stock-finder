import type { TourStep } from "./product-tour";
import { byTourId } from "./tour-targets";

const STEP_NAVIGATION: TourStep["actions"] = [
  { label: "Back", action: "prev" },
  { label: "Next", action: "next" },
];

export const ADD_ITEM_TOUR_STEPS: TourStep[] = [
  {
    id: "item-photos",
    type: "tooltip",
    target: byTourId("item-photos"),
    placement: "bottom",
    title: "Add a photo",
    description:
      "Tap “Choose file” to take a photo or pick one from your phone. Items with photos get more buyers.",
    actions: [
      { label: "Skip tour", action: (actions) => actions.skip() },
      { label: "Next", action: "next" },
    ],
  },
  {
    id: "item-name",
    type: "tooltip",
    target: byTourId("item-name"),
    placement: "bottom",
    title: "Write the item name",
    description:
      "Start typing, for example “Parle-G”. Tap a match from the list and we'll fill in the category for you.",
    actions: STEP_NAVIGATION,
  },
  {
    id: "item-quantity-price",
    type: "tooltip",
    target: byTourId("item-quantity-price"),
    placement: "bottom",
    title: "How many, and at what price",
    description:
      "Enter how many you have. Price is optional — if you leave it empty, buyers can ask you on WhatsApp.",
    actions: STEP_NAVIGATION,
  },
  {
    id: "item-category",
    type: "tooltip",
    target: byTourId("item-category"),
    placement: "bottom",
    title: "Choose a category",
    description:
      "Pick what kind of item it is. Can't find it? Tap “+ New” to add one.",
    actions: STEP_NAVIGATION,
  },
  {
    id: "item-condition",
    type: "tooltip",
    target: byTourId("item-condition"),
    placement: "top",
    title: "New or used?",
    description: "Tap New, Open Box or Used.",
    actions: STEP_NAVIGATION,
  },
  {
    id: "item-save",
    type: "tooltip",
    target: byTourId("item-save"),
    placement: "top",
    title: "Save your item",
    description:
      "When you're done, tap “Add item”. Buyers near you will be able to find it.",
    // "next" is disabled on the last step, so this ends the tour with "dismiss".
    actions: [
      { label: "Back", action: "prev" },
      { label: "Got it", action: "dismiss" },
    ],
  },
];
