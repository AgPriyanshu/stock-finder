import { Heading, HStack } from "@chakra-ui/react";
import { BsBoxSeam } from "react-icons/bs";

interface BrandHeadingProps {
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
}

export const BrandHeading = ({ size = "md" }: BrandHeadingProps) => {
  const iconSize =
    size === "3xl" || size === "4xl"
      ? 28
      : size === "2xl" || size === "xl"
        ? 22
        : 18;

  return (
    <HStack gap={1.5} align="center">
      <Heading size={size} fontWeight="bold" letterSpacing="tight">
        Stock Finder
      </Heading>
      <BsBoxSeam size={iconSize} />
    </HStack>
  );
};
