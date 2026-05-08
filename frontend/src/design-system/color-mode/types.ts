import type { IconButtonProps } from "@chakra-ui/react";
import type { ThemeProviderProps } from "next-themes";

export type ColorModeProviderProps = ThemeProviderProps;

export interface UseColorModeReturn {
  colorMode: ColorMode;
  setColorMode: (colorMode: ColorMode) => void;
  toggleColorMode: () => void;
}

export type ColorMode = "light" | "dark";

export type ColorModeButtonProps = Omit<IconButtonProps, "aria-label">;
