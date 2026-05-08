import { Box, Flex, Link, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router";

const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? "1.0";

export const StockFinderFooter = () => (
  <Box
    className="stock-finder-footer"
    borderTopWidth="1px"
    borderColor="border.default"
    px={6}
    py={3}
  >
    <Flex
      direction={{ base: "column", sm: "row" }}
      align={{ base: "flex-start", sm: "center" }}
      justify="space-between"
      gap={2}
    >
      <Flex gap={4} wrap="wrap">
        <Link
          asChild
          fontSize="sm"
          color="text.secondary"
          _hover={{ color: "text.primary" }}
        >
          <RouterLink to="terms">Terms of Service</RouterLink>
        </Link>
        <Link
          asChild
          fontSize="sm"
          color="text.secondary"
          _hover={{ color: "text.primary" }}
        >
          <RouterLink to="privacy">Privacy Policy</RouterLink>
        </Link>
        <Link
          href="mailto:support@atlas-platform.example?subject=Report a problem"
          fontSize="sm"
          color="text.secondary"
          _hover={{ color: "text.primary" }}
        >
          Report a problem
        </Link>
      </Flex>
      <Text fontSize="xs" color="text.muted">
        &copy; {new Date().getFullYear()} Atlas Platform &middot; v{APP_VERSION}
      </Text>
    </Flex>
  </Box>
);
