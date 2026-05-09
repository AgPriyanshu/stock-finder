import { Box, Flex } from "@chakra-ui/react";
import { Outlet } from "react-router";
import { StockFinderErrorBoundary } from "./components/_error-boundary";
import { ConsentBanner } from "./components/legal/consent-banner";

const StockFinderContent = () => (
  <Flex direction="column" className="stock-finder-page" w="100vw" h="100dvh">
    <Box flex="1" overflow="auto" minH={0}>
      <Outlet />
    </Box>
    <ConsentBanner />
  </Flex>
);

export const StockFinderPage = () => (
  <StockFinderErrorBoundary>
    <StockFinderContent />
  </StockFinderErrorBoundary>
);
