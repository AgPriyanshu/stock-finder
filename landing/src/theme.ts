import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

// A chosen palette rather than framework defaults: warm paper and ink in place
// of the neutral gray ramp, and a deeper orange than the stock swatch.
const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        paper: { value: "#FBF7F0" },
        surface: { value: "#FFFFFF" },
        ink: { value: "#1C1815" },
        inkSoft: { value: "#4A423A" },
        inkMuted: { value: "#736A5F" },
        line: { value: "#E5DCD0" },
        lineStrong: { value: "#CFC3B3" },
        brand: { value: "#EA5B0C" },
        brandDeep: { value: "#B8410A" },
        brandTint: { value: "#FDEFE3" },
        stock: { value: "#1F7A52" },
      },
      fonts: {
        display: { value: "'Archivo Variable', 'Archivo', sans-serif" },
        body: { value: "'Source Sans 3', system-ui, sans-serif" },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
