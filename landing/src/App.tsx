import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Icon,
  Text,
  chakra,
} from "@chakra-ui/react";
import {
  FiBox,
  FiMapPin,
  FiSearch,
  FiStar,
  FiTrendingUp,
} from "react-icons/fi";
import { BenefitRow } from "./components/BenefitRow";
import { ResultPreview } from "./components/ResultPreview";
import { StepRow } from "./components/StepRow";

const APP_URL =
  (import.meta.env.VITE_APP_URL as string) || "https://app.stock-finder.shop";

const BUYER_STEPS = [
  {
    title: "Search for an item",
    description:
      "Type the item you need — by name, brand, or category — and set your location.",
  },
  {
    title: "See shops with stock near you",
    description:
      "A map and list shows you every local shop that has your item in inventory, sorted by distance.",
  },
  {
    title: "Contact directly via WhatsApp",
    description:
      "Tap to send a lead directly to the shop owner on WhatsApp. No app download, no account needed.",
  },
];

const OWNER_STEPS = [
  {
    title: "List your inventory",
    description:
      "Add the items your shop carries — categories, names, prices. Takes minutes to set up, easy to update.",
  },
  {
    title: "Buyers in your area discover you",
    description:
      "Your shop appears in search results for buyers within your radius who are looking for matching items.",
  },
  {
    title: "Receive leads instantly",
    description:
      "When a buyer contacts you, you get a WhatsApp message with their name, requirement, and phone number.",
  },
];

const FOOTER_LINKS = [
  { label: "Terms", href: `${APP_URL}/terms` },
  { label: "Privacy", href: `${APP_URL}/privacy` },
  { label: "Open app", href: APP_URL },
];

export default function App() {
  return (
    <Box className="app" bg="paper" minH="100vh" color="ink">
      {/* Nav */}
      <Box
        as="nav"
        position="sticky"
        top={0}
        zIndex={100}
        bg="paper"
        borderBottom="1px solid"
        borderColor="line"
      >
        <Container maxW="72rem" py={4} px={{ base: 5, md: 8 }}>
          <Flex justify="space-between" align="center">
            <HStack gap={2.5}>
              <Icon as={FiBox} color="brand" boxSize={5} />
              <Text
                fontFamily="display"
                fontWeight={700}
                fontSize="1.05rem"
                letterSpacing="-0.01em"
                whiteSpace="nowrap"
              >
                Stock Finder
              </Text>
            </HStack>
            <HStack gap={{ base: 4, md: 6 }}>
              <Button
                variant="plain"
                size="sm"
                color="inkSoft"
                fontWeight={600}
                px={0}
                h="auto"
                _hover={{ color: "brand" }}
                onClick={() =>
                  document
                    .getElementById("for-owners")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                For shop owners
              </Button>
              <a href={APP_URL}>
                <Button
                  size="sm"
                  bg="brand"
                  color="white"
                  borderRadius="3px"
                  fontWeight={600}
                  px={4}
                  _hover={{ bg: "brandDeep" }}
                >
                  Open app →
                </Button>
              </a>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Hero */}
      <Box bg="brandTint" borderBottom="1px solid" borderColor="line">
        <Container maxW="72rem" px={{ base: 5, md: 8 }} py={{ base: 14, md: 20 }}>
          <Flex
            direction={{ base: "column", lg: "row" }}
            align={{ lg: "center" }}
            gap={{ base: 12, lg: 20 }}
          >
            <Box flex="1 1 0" minW={0}>
              <Heading
                as="h1"
                fontFamily="display"
                fontSize={{ base: "2.4rem", md: "3.1rem", lg: "3.5rem" }}
                fontWeight={700}
                letterSpacing="-0.033em"
                lineHeight={1.07}
                maxW="17ch"
                css={{ textWrap: "balance" }}
              >
                Find exactly what you need,{" "}
                <Box as="span" color="brand">
                  right in your neighbourhood
                </Box>
              </Heading>
              <Text
                fontSize={{ base: "1.1rem", md: "1.2rem" }}
                color="inkSoft"
                maxW="48ch"
                lineHeight={1.6}
                mt={6}
              >
                Stock Finder connects buyers looking for specific items with
                local shops that have them in stock — any category, no
                middlemen, no wasted trips.
              </Text>
              <HStack gap={3} flexWrap="wrap" mt={9}>
                <a href={APP_URL}>
                  <Button
                    size="lg"
                    bg="brand"
                    color="white"
                    borderRadius="3px"
                    fontWeight={600}
                    px={6}
                    _hover={{ bg: "brandDeep" }}
                  >
                    <FiSearch />
                    Search nearby shops
                  </Button>
                </a>
                <a href={`${APP_URL}/login`}>
                  <Button
                    size="lg"
                    variant="outline"
                    bg="transparent"
                    borderColor="lineStrong"
                    color="ink"
                    borderRadius="3px"
                    fontWeight={600}
                    px={6}
                    _hover={{ bg: "surface", borderColor: "brand" }}
                  >
                    List your shop
                  </Button>
                </a>
              </HStack>
            </Box>

            <Box flex="1 1 0" minW={0} w="full" maxW={{ lg: "27rem" }}>
              <ResultPreview />
            </Box>
          </Flex>
        </Container>
      </Box>

      {/* How it works — Buyers */}
      <Box bg="surface" py={{ base: 16, md: 24 }}>
        <Container maxW="72rem" px={{ base: 5, md: 8 }}>
          <Flex direction={{ base: "column", lg: "row" }} gap={{ base: 10, lg: 20 }}>
            <Box flex={{ lg: "0 0 24rem" }}>
              <Heading
                as="h2"
                fontFamily="display"
                fontSize={{ base: "1.85rem", md: "2.2rem" }}
                fontWeight={700}
                letterSpacing="-0.025em"
                lineHeight={1.15}
              >
                Find what you need in minutes
              </Heading>
              <Text color="inkSoft" fontSize="1.05rem" lineHeight={1.65} mt={4} maxW="42ch">
                No more calling shop after shop. Search once, see which local
                shops actually have it, contact them directly.
              </Text>
            </Box>

            <Box flex="1 1 0" minW={0}>
              {BUYER_STEPS.map(({ title, description }, index) => (
                <StepRow
                  key={title}
                  number={index + 1}
                  title={title}
                  description={description}
                  isLast={index === BUYER_STEPS.length - 1}
                />
              ))}
            </Box>
          </Flex>
        </Container>
      </Box>

      {/* How it works — Owners */}
      <Box
        id="for-owners"
        bg="paper"
        borderTop="1px solid"
        borderBottom="1px solid"
        borderColor="line"
        py={{ base: 16, md: 24 }}
      >
        <Container maxW="72rem" px={{ base: 5, md: 8 }}>
          <Flex
            direction={{ base: "column", lg: "row-reverse" }}
            gap={{ base: 10, lg: 20 }}
          >
            <Box flex={{ lg: "0 0 24rem" }}>
              <Heading
                as="h2"
                fontFamily="display"
                fontSize={{ base: "1.85rem", md: "2.2rem" }}
                fontWeight={700}
                letterSpacing="-0.025em"
                lineHeight={1.15}
              >
                Turn your inventory into inbound leads
              </Heading>
              <Text color="inkSoft" fontSize="1.05rem" lineHeight={1.65} mt={4} maxW="42ch">
                Buyers in your area are already searching for items you carry.
                List your stock and let them find you.
              </Text>
            </Box>

            <Box flex="1 1 0" minW={0}>
              {OWNER_STEPS.map(({ title, description }, index) => (
                <StepRow
                  key={title}
                  number={index + 1}
                  title={title}
                  description={description}
                  isLast={index === OWNER_STEPS.length - 1}
                />
              ))}
            </Box>
          </Flex>
        </Container>
      </Box>

      {/* Benefits */}
      <Box bg="surface" py={{ base: 16, md: 24 }}>
        <Container maxW="72rem" px={{ base: 5, md: 8 }}>
          <Heading
            as="h2"
            fontFamily="display"
            fontSize={{ base: "1.85rem", md: "2.2rem" }}
            fontWeight={700}
            letterSpacing="-0.025em"
            lineHeight={1.15}
          >
            Why Stock Finder?
          </Heading>
          <Text color="inkSoft" fontSize="1.05rem" mt={3} mb={{ base: 4, md: 6 }}>
            Built for any type of shop and any category of stock.
          </Text>

          <Box>
            <BenefitRow
              icon={<FiMapPin size={20} />}
              title="Hyper-local search"
              description="Results are filtered by your exact location and radius. You only see shops that can realistically serve you — not shops 100 km away."
            />
            <BenefitRow
              icon={<FiStar size={20} />}
              title="Real inventory, not just names"
              description="Unlike generic business directories, Stock Finder shows actual items shops carry. If a shop lists it, they have it."
            />
            <BenefitRow
              icon={<FiTrendingUp size={20} />}
              title="Zero-friction contact"
              description="Buyers reach you on WhatsApp — no app download, no registration, no friction. More enquiries actually reach you."
            />
          </Box>
        </Container>
      </Box>

      {/* Owner CTA */}
      <Box bg="brand" py={{ base: 16, md: 24 }}>
        <Container maxW="72rem" px={{ base: 5, md: 8 }}>
          <Flex
            direction={{ base: "column", md: "row" }}
            align={{ md: "flex-end" }}
            justify="space-between"
            gap={{ base: 8, md: 10 }}
          >
            <Box>
              <Heading
                as="h2"
                fontFamily="display"
                fontSize={{ base: "1.9rem", md: "2.4rem" }}
                fontWeight={700}
                color="white"
                letterSpacing="-0.025em"
                lineHeight={1.12}
              >
                Ready to list your shop?
              </Heading>
              <Text color="brandTint" fontSize="1.1rem" maxW="46ch" lineHeight={1.6} mt={4}>
                Request access and we'll have your shop live on Stock Finder
                within 24 hours. It's free to get started.
              </Text>
            </Box>
            <HStack gap={3} flexWrap="wrap" flexShrink={0}>
              <a href={`${APP_URL}/login`}>
                <Button
                  size="lg"
                  bg="white"
                  color="brandDeep"
                  borderRadius="3px"
                  fontWeight={700}
                  px={6}
                  _hover={{ bg: "brandTint" }}
                >
                  Register your shop
                </Button>
              </a>
              <a href={APP_URL}>
                <Button
                  size="lg"
                  variant="outline"
                  bg="transparent"
                  borderColor="rgba(255,255,255,0.55)"
                  color="white"
                  borderRadius="3px"
                  fontWeight={600}
                  px={6}
                  _hover={{ bg: "rgba(255,255,255,0.12)", borderColor: "white" }}
                >
                  See how it works →
                </Button>
              </a>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Footer */}
      <Box bg="ink" py={9}>
        <Container maxW="72rem" px={{ base: 5, md: 8 }}>
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "flex-start", md: "center" }}
            gap={5}
          >
            <HStack gap={2.5}>
              <Icon as={FiBox} color="brand" boxSize={4} />
              <Text fontFamily="display" fontWeight={700} color="white" letterSpacing="-0.01em">
                Stock Finder
              </Text>
            </HStack>
            <HStack gap={7} flexWrap="wrap">
              {FOOTER_LINKS.map(({ label, href }) => (
                <chakra.a
                  key={label}
                  href={href}
                  color="rgba(251,247,240,0.72)"
                  fontSize="0.9rem"
                  fontWeight={600}
                  _hover={{ color: "white" }}
                >
                  {label}
                </chakra.a>
              ))}
            </HStack>
            <Text data-tabular color="rgba(251,247,240,0.5)" fontSize="0.875rem">
              © {new Date().getFullYear()} Stock Finder
            </Text>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}
