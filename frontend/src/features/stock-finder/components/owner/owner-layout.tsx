import {
  Box,
  Button,
  Drawer,
  Flex,
  HStack,
  IconButton,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react";
import { queryClient } from "api/query-client";
import { useState } from "react";
import { FiInbox, FiLogOut, FiMenu, FiShoppingBag, FiX } from "react-icons/fi";
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = () => setDrawerOpen(false);

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
        px={{ base: 4, md: 6 }}
        py={3}
        flexShrink={0}
      >
        <Flex align="center" justify="space-between" maxW="5xl" mx="auto">
          <HStack gap={{ base: 2, md: 6 }}>
              <IconButton
                aria-label="Open menu"
                variant="ghost"
                size="sm"
                onClick={() => setDrawerOpen(true)}
                display={{ base: "inline-flex", md: "none" }}
              >
                <FiMenu />
              </IconButton>
              <Link to="/">
                <BrandHeading size="md" />
              </Link>
              {/* Desktop nav */}
              <HStack gap={1} display={{ base: "none", md: "flex" }}>
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
            <Text display={{ base: "none", sm: "inline" }}>Logout</Text>
          </Button>
        </Flex>
      </Box>

      {/* Mobile drawer */}
      <Drawer.Root
        open={drawerOpen}
        onOpenChange={(e) => setDrawerOpen(e.open)}
        placement="start"
        size="xs"
      >
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content>
              <Drawer.Header
                borderBottomWidth="1px"
                borderColor="border.default"
              >
                <Flex align="center" justify="space-between" w="full">
                  <BrandHeading size="md" />
                  <Drawer.CloseTrigger asChild>
                    <IconButton
                      aria-label="Close menu"
                      variant="ghost"
                      size="sm"
                    >
                      <FiX />
                    </IconButton>
                  </Drawer.CloseTrigger>
                </Flex>
              </Drawer.Header>
              <Drawer.Body p={3}>
                <VStack gap={1} align="stretch">
                  {NAV_ITEMS.map(({ label, to, icon }) => {
                    const isActive = location.pathname === to;
                    return (
                      <Button
                        key={to}
                        asChild
                        variant="ghost"
                        size="md"
                        justifyContent="flex-start"
                        color={isActive ? "fg" : "fg.muted"}
                        fontWeight="medium"
                        bg={isActive ? "bg.muted" : "transparent"}
                      >
                        <Link to={to} onClick={closeDrawer}>
                          {icon}
                          <Text>{label}</Text>
                        </Link>
                      </Button>
                    );
                  })}
                </VStack>
              </Drawer.Body>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>

      {/* Page content */}
      <Box
        flex={1}
        overflowY="auto"
        px={{ base: 4, md: 6 }}
        py={{ base: 4, md: 6 }}
      >
        <Box maxW="5xl" mx="auto">
          <Outlet />
        </Box>
      </Box>
    </Flex>
  );
};
