import { Box, Flex, Text } from "@chakra-ui/react";

interface Props {
  icon: React.ReactNode;
  title: string;
  description: string;
}

// Separated by a hairline rather than boxed, so this section does not repeat
// the same three-card shape the steps above already use.
export function BenefitRow({ icon, title, description }: Props) {
  return (
    <Flex
      className="benefit-row"
      direction={{ base: "column", md: "row" }}
      gap={{ base: 3, md: 10 }}
      py={{ base: 7, md: 8 }}
      borderTop="1px solid"
      borderColor="line"
      align="flex-start"
    >
      <Flex align="flex-start" gap={3} flex={{ md: "0 0 17rem" }} color="brand">
        <Box mt="3px" flexShrink={0}>
          {icon}
        </Box>
        <Text
          fontFamily="display"
          fontWeight={700}
          fontSize={{ base: "1.15rem", md: "1.2rem" }}
          color="ink"
          letterSpacing="-0.01em"
          lineHeight={1.25}
        >
          {title}
        </Text>
      </Flex>
      <Text color="inkSoft" fontSize={{ base: "1rem", md: "1.05rem" }} lineHeight={1.65} maxW="58ch">
        {description}
      </Text>
    </Flex>
  );
}
