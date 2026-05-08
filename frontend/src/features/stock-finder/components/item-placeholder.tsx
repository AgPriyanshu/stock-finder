import { Box } from "@chakra-ui/react";
import type { IconType } from "react-icons";
import {
  FiAlertTriangle,
  FiBattery,
  FiBox,
  FiDroplet,
  FiFeather,
  FiHome,
  FiPackage,
  FiSettings,
  FiShield,
  FiTool,
  FiZap,
} from "react-icons/fi";

interface CategoryVisual {
  Icon: IconType;
  bg: string;
  fg: string;
}

const VISUALS: CategoryVisual[] = [
  // Matched by keyword order — first match wins.
  { Icon: FiZap, bg: "#f97316", fg: "#fff" }, // power-tools, angle grinder, drill
  { Icon: FiBattery, bg: "#eab308", fg: "#fff" }, // electrical, wire, bulb, switch
  { Icon: FiDroplet, bg: "#3b82f6", fg: "#fff" }, // plumbing, pipe, valve, gasket
  { Icon: FiHome, bg: "#8b5cf6", fg: "#fff" }, // construction, cement, brick, tile
  { Icon: FiFeather, bg: "#ec4899", fg: "#fff" }, // paint, brush, finish
  { Icon: FiShield, bg: "#10b981", fg: "#fff" }, // safety, gloves, goggles, mask
  { Icon: FiSettings, bg: "#64748b", fg: "#fff" }, // fasteners, bolt, nut, anchor
  { Icon: FiTool, bg: "#d97706", fg: "#fff" }, // hand-tools, hammer, wrench, pliers
  { Icon: FiAlertTriangle, bg: "#dc2626", fg: "#fff" }, // heat, soldering
  { Icon: FiBox, bg: "#0ea5e9", fg: "#fff" }, // adhesive, glue, resin
  { Icon: FiPackage, bg: "#6366f1", fg: "#fff" }, // default
];

const KEYWORD_MAP: [string, number][] = [
  // [keyword in slug/name (lowercase), index into VISUALS]
  ["power", 0],
  ["drill", 0],
  ["grinder", 0],
  ["angle", 0],
  ["heat", 8],
  ["solder", 8],
  ["gun", 8],
  ["electric", 1],
  ["wire", 1],
  ["bulb", 1],
  ["switch", 1],
  ["led", 1],
  ["cord", 1],
  ["cable", 1],
  ["fan", 1],
  ["plumb", 2],
  ["pipe", 2],
  ["valve", 2],
  ["gasket", 2],
  ["copper", 2],
  ["pvc", 2],
  ["cement", 3],
  ["sand", 3],
  ["brick", 3],
  ["tile", 3],
  ["steel", 3],
  ["rod", 3],
  ["construct", 3],
  ["paint", 4],
  ["brush", 4],
  ["finish", 4],
  ["safety", 5],
  ["glove", 5],
  ["goggle", 5],
  ["mask", 5],
  ["bolt", 6],
  ["nut", 6],
  ["anchor", 6],
  ["fastener", 6],
  ["screw", 6],
  ["ties", 6],
  ["hinge", 6],
  ["handle", 6],
  ["bracket", 6],
  ["padlock", 6],
  ["lock", 6],
  ["hand", 7],
  ["hammer", 7],
  ["wrench", 7],
  ["plier", 7],
  ["tape", 7],
  ["level", 7],
  ["spirit", 7],
  ["tool", 7],
  ["glue", 9],
  ["adhesive", 9],
  ["epoxy", 9],
  ["resin", 9],
  ["sandpaper", 9],
  ["wood", 9],
];

const resolveVisual = (
  categorySlug?: string | null,
  itemName?: string
): CategoryVisual => {
  const haystack = `${categorySlug ?? ""} ${itemName ?? ""}`.toLowerCase();

  for (const [keyword, index] of KEYWORD_MAP) {
    if (haystack.includes(keyword)) {
      return VISUALS[index]!;
    }
  }

  return VISUALS[VISUALS.length - 1]!;
};

interface ItemPlaceholderProps {
  categorySlug?: string | null;
  itemName?: string;
  minH?: string | number;
}

export const ItemPlaceholder = ({
  categorySlug,
  itemName,
  minH = "132px",
}: ItemPlaceholderProps) => {
  const { Icon, bg, fg } = resolveVisual(categorySlug, itemName);

  return (
    <Box
      className="item-placeholder"
      w="full"
      minH={minH}
      h="full"
      bg={bg}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Icon size={32} color={fg} opacity={0.85} />
    </Box>
  );
};
