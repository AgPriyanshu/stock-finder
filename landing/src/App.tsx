import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  FiBox,
  FiMapPin,
  FiMessageSquare,
  FiSearch,
  FiStar,
  FiTrendingUp,
  FiUsers,
  FiZap,
} from "react-icons/fi";

const APP_URL = (import.meta.env.VITE_APP_URL as string) || "https://app.stock-finder.shop";

const BRAND = "#F97316";
const BRAND_DARK = "#EA580C";

function StepCard({
  number,
  icon,
  title,
  description,
}: {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <VStack
      align="start"
      gap={3}
      p={6}
      bg="gray.50"
      borderRadius="xl"
      border="1px solid"
      borderColor="gray.200"
      position="relative"
    >
      <Box
        position="absolute"
        top={4}
        right={4}
        fontSize="5xl"
        fontWeight="bold"
        color="gray.100"
        lineHeight={1}
        userSelect="none"
      >
        {number}
      </Box>
      <Box
        p={2}
        bg="white"
        borderRadius="lg"
        border="1px solid"
        borderColor="gray.200"
        color={BRAND}
      >
        {icon}
      </Box>
      <Text fontWeight="semibold" fontSize="lg" color="gray.900">
        {title}
      </Text>
      <Text color="gray.500" fontSize="sm" lineHeight="tall">
        {description}
      </Text>
    </VStack>
  );
}

function BenefitCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <VStack
      align="start"
      gap={3}
      p={6}
      bg="white"
      borderRadius="xl"
      border="1px solid"
      borderColor="gray.200"
      shadow="sm"
    >
      <Box color={BRAND} fontSize="xl">
        {icon}
      </Box>
      <Text fontWeight="semibold" color="gray.900">
        {title}
      </Text>
      <Text color="gray.500" fontSize="sm" lineHeight="tall">
        {description}
      </Text>
    </VStack>
  );
}

export default function App() {
  return (
    <Box bg="white" minH="100vh">
      {/* Nav */}
      <Box
        as="nav"
        position="sticky"
        top={0}
        zIndex={100}
        bg="white"
        borderBottom="1px solid"
        borderColor="gray.100"
        shadow="sm"
      >
        <Container maxW="6xl" py={3}>
          <Flex justify="space-between" align="center">
            <HStack gap={2}>
              <Icon as={FiBox} color={BRAND} boxSize={5} />
              <Text fontWeight="bold" fontSize="lg" color="gray.900">
                Stock Finder
              </Text>
            </HStack>
            <HStack gap={3}>
              <Button
                variant="ghost"
                size="sm"
                color="gray.600"
                onClick={() =>
                  document
                    .getElementById("for-owners")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                For shop owners
              </Button>
              <a href={APP_URL}>
                <Button size="sm" bg={BRAND} color="white" _hover={{ bg: BRAND_DARK }}>
                  Open app →
                </Button>
              </a>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Hero */}
      <Box
        bg="linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 50%, #FFF7ED 100%)"
        pt={{ base: 14, md: 20 }}
        pb={{ base: 14, md: 20 }}
        overflow="hidden"
      >
        <Container maxW="6xl">
          <Flex
            direction={{ base: "column", lg: "row" }}
            align="center"
            gap={{ base: 10, lg: 16 }}
          >
            {/* Text side */}
            <VStack align={{ base: "center", lg: "start" }} gap={6} flex={1} textAlign={{ base: "center", lg: "left" }}>
              <Box
                display="inline-block"
                px={3}
                py={1}
                bg="orange.100"
                color={BRAND_DARK}
                borderRadius="full"
                fontSize="sm"
                fontWeight="medium"
              >
                Hyper-local stock search
              </Box>
              <Heading
                as="h1"
                fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
                fontWeight="bold"
                color="gray.900"
                lineHeight="shorter"
              >
                Find exactly what you need,{" "}
                <Box as="span" color={BRAND}>
                  right in your neighbourhood
                </Box>
              </Heading>
              <Text
                fontSize={{ base: "lg", md: "xl" }}
                color="gray.600"
                maxW="lg"
                lineHeight="tall"
              >
                Stock Finder connects buyers looking for specific items with
                local shops that have them in stock — any category, no
                middlemen, no wasted trips.
              </Text>
              <HStack gap={4} flexWrap="wrap" justify={{ base: "center", lg: "start" }}>
                <a href={APP_URL}>
                  <Button size="lg" bg={BRAND} color="white" _hover={{ bg: BRAND_DARK }} shadow="md">
                    <FiSearch />
                    Search nearby shops
                  </Button>
                </a>
                <a href={`${APP_URL}/login`}>
                  <Button
                    size="lg"
                    variant="outline"
                    borderColor={BRAND}
                    color={BRAND_DARK}
                    _hover={{ bg: "orange.50" }}
                  >
                    List your shop
                  </Button>
                </a>
              </HStack>
            </VStack>

            {/* Illustration side */}
            <Box flex={1} maxW={{ base: "320px", lg: "420px" }} w="full" mx={{ base: "auto", lg: 0 }}>
              <img src="/hero-section.svg" alt="" style={{ width: "100%", height: "auto" }} />
            </Box>
          </Flex>
        </Container>
      </Box>

      {/* How it works — Buyers */}
      <Box py={{ base: 16, md: 24 }} bg="white">
        <Container maxW="6xl">
          <VStack gap={12}>
            <VStack gap={3} textAlign="center">
              <Box
                display="inline-flex"
                alignItems="center"
                gap={2}
                px={3}
                py={1}
                bg="blue.50"
                color="blue.700"
                borderRadius="full"
                fontSize="sm"
                fontWeight="medium"
              >
                <FiSearch size={14} /> For Buyers
              </Box>
              <Heading as="h2" fontSize={{ base: "2xl", md: "3xl" }} color="gray.900">
                Find what you need in minutes
              </Heading>
              <Text color="gray.500" maxW="xl">
                No more calling shop after shop. Search once, see which local
                shops actually have it, contact them directly.
              </Text>
            </VStack>
            <Box w="full" px={{ base: 0, md: 4 }}>
              <img src="/buyers-section.svg" alt="" style={{ width: "100%", maxWidth: 600, margin: "0 auto", display: "block" }} />
            </Box>
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} w="full">
              <StepCard
                number={1}
                icon={<FiSearch size={20} />}
                title="Search for an item"
                description="Type the item you need — by name, brand, or category — and set your location."
              />
              <StepCard
                number={2}
                icon={<FiMapPin size={20} />}
                title="See shops with stock near you"
                description="A map and list shows you every local shop that has your item in inventory, sorted by distance."
              />
              <StepCard
                number={3}
                icon={<FiMessageSquare size={20} />}
                title="Contact directly via WhatsApp"
                description="Tap to send a lead directly to the shop owner on WhatsApp. No app download, no account needed."
              />
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* How it works — Owners */}
      <Box
        id="for-owners"
        py={{ base: 16, md: 24 }}
        bg="gray.50"
        borderTop="1px solid"
        borderBottom="1px solid"
        borderColor="gray.200"
      >
        <Container maxW="6xl">
          <VStack gap={12}>
            <VStack gap={3} textAlign="center">
              <Box
                display="inline-flex"
                alignItems="center"
                gap={2}
                px={3}
                py={1}
                bg="orange.50"
                color={BRAND_DARK}
                borderRadius="full"
                fontSize="sm"
                fontWeight="medium"
              >
                <FiUsers size={14} /> For Shop Owners
              </Box>
              <Heading as="h2" fontSize={{ base: "2xl", md: "3xl" }} color="gray.900">
                Turn your inventory into inbound leads
              </Heading>
              <Text color="gray.500" maxW="xl">
                Buyers in your area are already searching for items you carry.
                List your stock and let them find you.
              </Text>
            </VStack>
            <Box w="full" px={{ base: 0, md: 4 }}>
              <img src="/store-inventory.svg" alt="" style={{ width: "100%", maxWidth: 600, margin: "0 auto", display: "block" }} />
            </Box>
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} w="full">
              <StepCard
                number={1}
                icon={<FiBox size={20} />}
                title="List your inventory"
                description="Add the items your shop carries — categories, names, prices. Takes minutes to set up, easy to update."
              />
              <StepCard
                number={2}
                icon={<FiMapPin size={20} />}
                title="Buyers in your area discover you"
                description="Your shop appears in search results for buyers within your radius who are looking for matching items."
              />
              <StepCard
                number={3}
                icon={<FiZap size={20} />}
                title="Receive leads instantly"
                description="When a buyer contacts you, you get a WhatsApp message with their name, requirement, and phone number."
              />
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Benefits */}
      <Box py={{ base: 16, md: 24 }} bg="white">
        <Container maxW="6xl">
          <VStack gap={12}>
            <VStack gap={3} textAlign="center">
              <Heading as="h2" fontSize={{ base: "2xl", md: "3xl" }} color="gray.900">
                Why Stock Finder?
              </Heading>
              <Text color="gray.500" maxW="xl">
                Built for any type of shop and any category of stock.
              </Text>
            </VStack>
            <Grid
              templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
              gap={6}
              w="full"
            >
              <BenefitCard
                icon={<FiMapPin size={24} />}
                title="Hyper-local search"
                description="Results are filtered by your exact location and radius. You only see shops that can realistically serve you — not shops 100 km away."
              />
              <BenefitCard
                icon={<FiStar size={24} />}
                title="Real inventory, not just names"
                description="Unlike generic business directories, Stock Finder shows actual items shops carry. If a shop lists it, they have it."
              />
              <BenefitCard
                icon={<FiTrendingUp size={24} />}
                title="Zero-friction contact"
                description="Buyers reach you on WhatsApp — no app download, no registration, no friction. More enquiries actually reach you."
              />
            </Grid>
          </VStack>
        </Container>
      </Box>

      {/* Owner CTA */}
      <Box
        py={{ base: 16, md: 24 }}
        bg={`linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%)`}
      >
        <Container maxW="3xl" textAlign="center">
          <VStack gap={6}>
            <Heading
              as="h2"
              fontSize={{ base: "2xl", md: "3xl" }}
              color="white"
              fontWeight="bold"
            >
              Ready to list your shop?
            </Heading>
            <Text color="orange.100" fontSize="lg" maxW="xl">
              Request access and we'll have your shop live on Stock Finder
              within 24 hours. It's free to get started.
            </Text>
            <HStack gap={4} flexWrap="wrap" justify="center">
              <a href={`${APP_URL}/login`}>
                <Button
                  size="lg"
                  bg="white"
                  color={BRAND_DARK}
                  _hover={{ bg: "orange.50" }}
                  shadow="md"
                >
                  Register your shop
                </Button>
              </a>
              <a href={APP_URL}>
                <Button
                  size="lg"
                  variant="outline"
                  borderColor="orange.200"
                  color="white"
                  _hover={{ bg: "rgba(255,255,255,0.1)" }}
                >
                  See how it works →
                </Button>
              </a>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Footer */}
      <Box bg="gray.900" py={10}>
        <Container maxW="6xl">
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "center", md: "center" }}
            gap={4}
          >
            <HStack gap={2}>
              <Icon as={FiBox} color={BRAND} boxSize={4} />
              <Text fontWeight="bold" color="white">
                Stock Finder
              </Text>
            </HStack>
            <HStack gap={6} flexWrap="wrap" justify="center">
              <a href={`${APP_URL}/terms`} style={{ color: "#9ca3af", fontSize: "0.875rem", textDecoration: "none" }}>
                Terms
              </a>
              <a href={`${APP_URL}/privacy`} style={{ color: "#9ca3af", fontSize: "0.875rem", textDecoration: "none" }}>
                Privacy
              </a>
              <a href={APP_URL} style={{ color: "#9ca3af", fontSize: "0.875rem", textDecoration: "none" }}>
                Open app
              </a>
            </HStack>
            <Text color="gray.500" fontSize="sm">
              © {new Date().getFullYear()} Stock Finder ·{" "}
              <a href="https://storyset.com" target="_blank" rel="noopener noreferrer" style={{ color: "#6b7280", textDecoration: "none" }}>
                Illustrations by Storyset
              </a>
            </Text>
          </Flex>
        </Container>
      </Box>

    </Box>
  );
}
