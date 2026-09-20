import { Box, Flex, Text } from "@chakra-ui/react";

interface Props {
  number: number;
  title: string;
  description: string;
  isLast?: boolean;
}

// The three steps are a sequence, not three interchangeable tiles, so they run
// down one connected rule instead of sitting in matching boxes.
export function StepRow({ number, title, description, isLast = false }: Props) {
  return (
    <Flex className="step-row" gap={{ base: 5, md: 7 }} align="stretch">
      <Flex direction="column" align="center" flexShrink={0}>
        <Flex
          align="center"
          justify="center"
          w="42px"
          h="42px"
          borderRadius="full"
          border="1.5px solid"
          borderColor="brand"
          color="brand"
          fontFamily="display"
          fontWeight={700}
          fontSize="1.1rem"
          data-tabular
        >
          {number}
        </Flex>
        {!isLast && <Box flex="1" w="1.5px" bg="line" mt={2} />}
      </Flex>

      <Box pb={isLast ? 0 : { base: 8, md: 10 }} pt="6px">
        <Text
          fontFamily="display"
          fontWeight={700}
          fontSize={{ base: "1.15rem", md: "1.3rem" }}
          color="ink"
          letterSpacing="-0.01em"
          lineHeight={1.25}
        >
          {title}
        </Text>
        <Text color="inkSoft" fontSize={{ base: "1rem", md: "1.05rem" }} lineHeight={1.6} mt={2} maxW="46ch">
          {description}
        </Text>
      </Box>
    </Flex>
  );
}
