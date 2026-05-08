import { Button, HStack } from "@chakra-ui/react";
import { FiList, FiMap } from "react-icons/fi";

export type SearchView = "list" | "map";

interface ViewToggleProps {
  value: SearchView;
  onChange: (value: SearchView) => void;
}

export const ViewToggle = ({ value, onChange }: ViewToggleProps) => (
  <HStack gap={1} bg="bg.muted" p={1} borderRadius="md">
    <Button
      size="sm"
      variant={value === "list" ? "solid" : "ghost"}
      onClick={() => onChange("list")}
    >
      <FiList /> List
    </Button>
    <Button
      size="sm"
      variant={value === "map" ? "solid" : "ghost"}
      onClick={() => onChange("map")}
    >
      <FiMap /> Map
    </Button>
  </HStack>
);
