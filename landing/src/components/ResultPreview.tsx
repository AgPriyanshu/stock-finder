import { Box, Flex, Text } from "@chakra-ui/react";
import { FiSearch } from "react-icons/fi";

interface Result {
  shop: string;
  locality: string;
  distance: string;
  price: string;
  updated: string;
}

// Illustrative, not live: Stock Finder is pre-launch, so these shops stand in
// for the real thing to show how a result reads.
const RESULTS: Result[] = [
  {
    shop: "Verma Electronics",
    locality: "Abu Lane",
    distance: "600 m",
    price: "₹1,299",
    updated: "Today",
  },
  {
    shop: "Meerut Radio House",
    locality: "Budhana Gate",
    distance: "1.2 km",
    price: "₹1,190",
    updated: "Today",
  },
  {
    shop: "Singhal Electricals",
    locality: "Begum Pul",
    distance: "1.8 km",
    price: "₹1,350",
    updated: "Yesterday",
  },
];

export function ResultPreview() {
  return (
    <Box
      className="result-preview"
      bg="surface"
      border="1px solid"
      borderColor="line"
      borderRadius="4px"
      boxShadow="0 18px 40px -24px rgba(28, 24, 21, 0.35)"
      overflow="hidden"
    >
      <Flex
        align="center"
        gap={3}
        px={5}
        py={4}
        borderBottom="1px solid"
        borderColor="line"
        color="inkMuted"
      >
        <FiSearch size={18} />
        <Text color="ink" fontSize="1.05rem" fontWeight={600}>
          65W USB-C charger
        </Text>
        <Text ml="auto" fontSize="0.8rem" letterSpacing="0.06em" textTransform="uppercase">
          Meerut
        </Text>
      </Flex>

      {RESULTS.map(({ shop, locality, distance, price, updated }, index) => (
        <Flex
          key={shop}
          align="center"
          gap={4}
          px={5}
          py={4}
          borderTop={index === 0 ? "none" : "1px solid"}
          borderColor="line"
        >
          <Box minW={0} flex="1 1 auto">
            <Text color="ink" fontWeight={600} fontSize="0.98rem" lineHeight={1.3}>
              {shop}
            </Text>
            <Text color="inkMuted" fontSize="0.85rem" lineHeight={1.4}>
              {locality} · <Box as="span" data-tabular>{distance}</Box>
            </Text>
          </Box>
          <Box textAlign="right" flexShrink={0}>
            <Text data-tabular color="ink" fontWeight={700} fontSize="1.05rem" lineHeight={1.2}>
              {price}
            </Text>
            <Text color="stock" fontSize="0.78rem" fontWeight={600} letterSpacing="0.04em">
              In stock · {updated}
            </Text>
          </Box>
        </Flex>
      ))}

      <Box px={5} py={3} bg="paper" borderTop="1px solid" borderColor="line">
        <Text color="inkMuted" fontSize="0.75rem" letterSpacing="0.06em" textTransform="uppercase">
          Example result — sample shops
        </Text>
      </Box>
    </Box>
  );
}
