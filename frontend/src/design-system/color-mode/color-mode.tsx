import type { SpanProps } from "@chakra-ui/react";
import { ClientOnly, IconButton, Skeleton, Span } from "@chakra-ui/react";
import { ThemeProvider } from "next-themes";
import * as React from "react";
import { LuMoon, LuSun } from "react-icons/lu";
import type { ColorModeButtonProps, ColorModeProviderProps } from "./types";
import { useColorMode } from "./use-color-mode";

export const ColorModeProvider = (props: ColorModeProviderProps) => {
  return (
    <ThemeProvider attribute="class" disableTransitionOnChange {...props} />
  );
};

export const ColorModeIcon = () => {
  const { colorMode } = useColorMode();
  return colorMode === "dark" ? <LuMoon /> : <LuSun />;
};

export const ColorModeButton = React.forwardRef<
  HTMLButtonElement,
  ColorModeButtonProps
>((props, ref) => {
  const { toggleColorMode } = useColorMode();

  return (
    <ClientOnly fallback={<Skeleton boxSize="9" />}>
      <IconButton
        onClick={toggleColorMode}
        variant="ghost"
        aria-label="Toggle color mode"
        size="sm"
        color={"text.primary"}
        ref={ref}
        {...props}
        css={{
          _icon: {
            width: "5",
            height: "5",
          },
        }}
        _hover={{ bgColor: "surface.subtle" }}
      >
        <ColorModeIcon />
      </IconButton>
    </ClientOnly>
  );
});

export const LightMode = React.forwardRef<HTMLSpanElement, SpanProps>(
  (props, ref) => {
    return (
      <Span
        color="text.primary"
        display="contents"
        className="chakra-theme light"
        colorPalette="gray"
        colorScheme="light"
        ref={ref}
        {...props}
      />
    );
  }
);

export const DarkMode = React.forwardRef<HTMLSpanElement, SpanProps>(
  (props, ref) => {
    return (
      <Span
        color="text.primary"
        display="contents"
        className="chakra-theme dark"
        colorPalette="gray"
        colorScheme="dark"
        ref={ref}
        {...props}
      />
    );
  }
);
