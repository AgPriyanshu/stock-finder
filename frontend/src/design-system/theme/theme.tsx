import {
  ChakraProvider,
  createSystem,
  defaultConfig,
  defineConfig,
} from "@chakra-ui/react";
import { ColorModeProvider, type ColorModeProviderProps } from "../color-mode";
import { colors } from "./colors";
import { buttonRecipe } from "./recipes";
import { semanticTokens } from "./semantic-tokens";

const config = defineConfig({
  globalCss: {
    "*": {
      boxSizing: "border-box",
    },
    body: {
      margin: 0,
      padding: 0,
    },

    ".outlet-container": {
      "& > div": {
        height: "100%",
        width: "100%",
      },
    },
  },

  theme: {
    tokens: {
      colors,
      radii: {
        default: { value: "{radii.xl}" },
      },
    },
    semanticTokens: semanticTokens,
    recipes: {
      button: buttonRecipe,
    },
  },
});

const system = createSystem(defaultConfig, config);

export const ThemeProvider = (props: ColorModeProviderProps) => {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  );
};
