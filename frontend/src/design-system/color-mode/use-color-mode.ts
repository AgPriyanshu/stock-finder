import { useTheme } from "next-themes";
import type { ColorMode, UseColorModeReturn } from "./types";

export const useColorMode = (): UseColorModeReturn => {
  const { resolvedTheme, setTheme, forcedTheme } = useTheme();
  const colorMode = forcedTheme || resolvedTheme;
  const toggleColorMode = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };
  return {
    colorMode: colorMode as ColorMode,
    setColorMode: setTheme,
    toggleColorMode,
  };
};

export const useColorModeValue = <T>(light: T, dark: T) => {
  const { colorMode } = useColorMode();
  return colorMode === "dark" ? dark : light;
};
