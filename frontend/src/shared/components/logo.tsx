import { Heading, VStack } from "@chakra-ui/react";
import { TbWorldBolt } from "react-icons/tb";
import { useNavigate } from "react-router";

export const WorldOfAppsLogo = () => {
  const navigate = useNavigate();
  return (
    <VStack
      cursor="pointer"
      pt={"4rem"}
      gap={"0.5rem"}
      onClick={() => navigate("/")}
    >
      <Heading size={"2xl"}>Atlas</Heading>
      <TbWorldBolt size={48} />
    </VStack>
  );
};
