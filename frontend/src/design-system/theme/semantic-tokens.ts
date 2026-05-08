export const semanticTokens = {
  colors: {
    /* =======================
       SURFACES (backgrounds)
       ======================= */
    surface: {
      page: {
        value: {
          _light: "{colors.palette.neutral.50}",
          _dark: "{colors.palette.neutral.950}",
        },
      },
      container: {
        value: {
          _light: "{colors.palette.neutral.100}",
          _dark: "{colors.palette.neutral.900}",
        },
      },
      subtle: {
        value: {
          _light: "{colors.palette.neutral.200}",
          _dark: "{colors.palette.neutral.850}",
        },
      },
      hover: {
        value: {
          _light: "{colors.palette.neutral.200}",
          _dark: "{colors.palette.neutral.800}",
        },
      },
      disabled: {
        value: {
          _light: "{colors.palette.neutral.200}",
          _dark: "{colors.palette.neutral.850}",
        },
      },
      inverse: {
        value: {
          _light: "{colors.palette.neutral.900}",
          _dark: "{colors.palette.neutral.50}",
        },
      },
    },

    /* =======================
       TEXT
       ======================= */
    text: {
      primary: {
        value: {
          _light: "{colors.palette.neutral.900}",
          _dark: "{colors.palette.neutral.0}",
        },
      },
      secondary: {
        value: {
          _light: "{colors.palette.neutral.700}",
          _dark: "{colors.palette.neutral.200}",
        },
      },
      muted: {
        value: {
          _light: "{colors.palette.neutral.500}",
          _dark: "{colors.palette.neutral.400}",
        },
      },
      disabled: {
        value: {
          _light: "{colors.palette.neutral.400}",
          _dark: "{colors.palette.neutral.600}",
        },
      },
      inverse: {
        value: {
          _light: "{colors.palette.neutral.0}",
          _dark: "{colors.palette.neutral.900}",
        },
      },
      onIntent: {
        value: "{colors.palette.neutral.0}",
      },
    },

    /* =======================
       BORDERS
       ======================= */
    border: {
      default: {
        value: {
          _light: "{colors.palette.neutral.300}",
          _dark: "{colors.palette.neutral.800}",
        },
      },
      muted: {
        value: {
          _light: "{colors.palette.neutral.200}",
          _dark: "{colors.palette.neutral.850}",
        },
      },
      hover: {
        value: {
          _light: "{colors.palette.neutral.400}",
          _dark: "{colors.palette.neutral.700}",
        },
      },
      disabled: {
        value: {
          _light: "{colors.palette.neutral.300}",
          _dark: "{colors.palette.neutral.800}",
        },
      },
      focus: {
        value: "{colors.intent.primaryActive}",
      },
    },

    /* =======================
       INTENT (meaning)
       ======================= */
    intent: {
      primary: {
        value: {
          _light: "{colors.palette.brand.700}",
          _dark: "{colors.palette.brand.600}",
        },
      },
      primaryHover: {
        value: {
          _light: "{colors.palette.brand.800}",
          _dark: "{colors.palette.brand.700}",
        },
      },
      primaryActive: {
        value: {
          _light: "{colors.palette.brand.900}",
          _dark: "{colors.palette.brand.800}",
        },
      },

      success: {
        value: {
          _light: "#16a34a",
          _dark: "#22c55e",
        },
      },
      successHover: {
        value: {
          _light: "#15803d",
          _dark: "#16a34a",
        },
      },

      error: {
        value: {
          _light: "#dc2626",
          _dark: "#ef4444",
        },
      },

      errorHover: {
        value: {
          _light: "#b91c1c",
          _dark: "#dc2626",
        },
      },

      warning: {
        value: {
          _light: "{colors.palette.yellow.600}",
          _dark: "{colors.palette.yellow.500}",
        },
      },

      info: {
        value: {
          _light: "#2563eb",
          _dark: "#3b82f6",
        },
      },

      danger: {
        value: {
          _light: "{colors.palette.red.700}",
          _dark: "{colors.palette.red.600}",
        },
      },
      dangerHover: {
        value: {
          _light: "{colors.palette.red.700}",
          _dark: "{colors.palette.red.600}",
        },
      },
    },

    /* =======================
       ICONS
       ======================= */
    icon: {
      primary: {
        value: {
          _light: "{colors.palette.neutral.700}",
          _dark: "{colors.palette.neutral.200}",
        },
      },
      muted: {
        value: {
          _light: "{colors.palette.neutral.500}",
          _dark: "{colors.palette.neutral.400}",
        },
      },
      onIntent: {
        value: "{colors.palette.neutral.0}",
      },
      warning: {
        value: "{colors.intent.warning}",
      },

      danger: {
        value: "{colors.palette.red.400}",
      },
      dangerHover: {
        value: "{colors.palette.red.500}",
      },
    },

    // Objects.
    object: {
      file: {
        value: "{colors.palette.blue.500}",
      },
      folder: {
        value: "{colors.palette.yellow.500}",
      },
    },
  },
};
