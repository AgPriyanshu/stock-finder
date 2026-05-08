import { Box, Button, Flex, HStack, Text } from "@chakra-ui/react";
import { queryClient } from "api/query-client";
import { FiInbox, FiLogOut, FiShoppingBag } from "react-icons/fi";
import { MdOutlineInventory2 } from "react-icons/md";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { clearOwnerToken, clearToken } from "shared/local-storage";
import { BrandHeading } from "../brand-heading";

const NAV_ITEMS = [
  {
    label: "Inventory",
    to: "/owner/inventory",
    icon: <MdOutlineInventory2 />,
  },
  { label: "Leads", to: "/owner/leads", icon: <FiInbox /> },
  { label: "My Shop", to: "/owner/shop", icon: <FiShoppingBag /> },
];

export const OwnerLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearOwnerToken();
    clearToken();
    queryClient.clear();
    navigate("/login", { replace: true });
  };

  return (
    <Flex
      className="owner-layout"
      direction="column"
      w="100vw"
      h="100dvh"
      bg="bg.canvas"
    >
      {/* Header */}
      <Box
        borderBottomWidth="1px"
        borderColor="border.default"
        bg="bg.panel"
        px={6}
        py={3}
        flexShrink={0}
      >
        <Flex align="center" justify="space-between" maxW="5xl" mx="auto">
          <HStack gap={6}>
            <Link to="/">
              <BrandHeading size="md" />
            </Link>
            <HStack gap={1}>
              {NAV_ITEMS.map(({ label, to, icon }) => {
                const isActive = location.pathname === to;
                return (
                  <Button
                    key={to}
                    asChild
                    variant="ghost"
                    size="sm"
                    color={isActive ? "fg" : "fg.muted"}
                    fontWeight="medium"
                    bg={isActive ? "bg.muted" : "transparent"}
                  >
                    <Link to={to}>
                      {icon}
                      <Text>{label}</Text>
                    </Link>
                  </Button>
                );
              })}
            </HStack>
          </HStack>
          <Button
            variant="ghost"
            size="sm"
            color="fg.muted"
            onClick={handleLogout}
          >
            <FiLogOut />
            Logout
          </Button>
        </Flex>
      </Box>

      {/* Page content */}
      <Box flex={1} overflowY="auto" px={6} py={6}>
        <Box maxW="5xl" mx="auto">
          <Outlet />
        </Box>
      </Box>
    </Flex>
  );
};
