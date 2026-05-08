import type { SfSearchItem } from "api/stock-finder";
import { ResultCard } from "./result-card";

interface MarkerPopupProps {
  item: SfSearchItem;
}

export const MarkerPopup = ({ item }: MarkerPopupProps) => (
  <ResultCard item={item} compact />
);
