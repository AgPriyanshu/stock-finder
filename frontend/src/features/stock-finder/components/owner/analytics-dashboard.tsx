import {
  Badge,
  Box,
  Center,
  Heading,
  HStack,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useAnalytics } from "api/stock-finder";
import type { SfAnalytics } from "api/stock-finder";
import { ReferralCard } from "./referral-card";

const StatCard = ({
  label,
  value,
  badge,
}: {
  label: string;
  value: number | string;
  badge?: string;
}) => (
  <Box
    borderWidth="1px"
    borderColor="border.default"
    borderRadius="lg"
    bg="bg.panel"
    p={5}
  >
    <Text fontSize="sm" color="text.secondary" mb={1}>
      {label}
    </Text>
    <HStack gap={2} align="baseline">
      <Text fontSize="2xl" fontWeight="bold">
        {value}
      </Text>
      {badge && (
        <Badge colorPalette="orange" size="sm">
          {badge}
        </Badge>
      )}
    </HStack>
  </Box>
);

const LeadTrendChart = ({
  trend,
}: {
  trend: SfAnalytics["leadsTrend"];
}) => {
  if (trend.length === 0) {
    return (
      <Center py={10}>
        <Text color="text.secondary" fontSize="sm">
          No leads in the last 30 days.
        </Text>
      </Center>
    );
  }

  // Fill all 30 days so bars line up even on sparse data.
  const today = new Date();
  const allDays: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    allDays.push({ date: key, count: 0 });
  }
  const trendMap = new Map(trend.map((t) => [t.date, t.count]));
  allDays.forEach((d) => {
    if (trendMap.has(d.date)) d.count = trendMap.get(d.date)!;
  });

  const max = Math.max(...allDays.map((d) => d.count), 1);
  const BAR_H = 120;

  return (
    <Box overflowX="auto">
      <Box display="flex" alignItems="flex-end" gap="2px" h={`${BAR_H + 24}px`} minW="360px">
        {allDays.map((day) => {
          const barH = Math.max((day.count / max) * BAR_H, day.count > 0 ? 4 : 2);
          const isToday = day.date === today.toISOString().slice(0, 10);
          return (
            <Box
              key={day.date}
              flex={1}
              display="flex"
              flexDir="column"
              alignItems="center"
              justifyContent="flex-end"
              h={`${BAR_H + 24}px`}
              title={`${day.date}: ${day.count} lead${day.count !== 1 ? "s" : ""}`}
            >
              <Box
                w="full"
                h={`${barH}px`}
                bg={isToday ? "intent.primary" : day.count > 0 ? "fg.muted" : "bg.muted"}
                borderRadius="sm"
                transition="height 300ms ease"
              />
              {/* Show day label every 7 days */}
              {allDays.indexOf(day) % 7 === 0 && (
                <Text fontSize="9px" color="text.secondary" mt={1} whiteSpace="nowrap">
                  {day.date.slice(5)}
                </Text>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export const AnalyticsDashboard = () => {
  const { data, isLoading } = useAnalytics();

  if (isLoading) {
    return (
      <Center py={12}>
        <Spinner />
      </Center>
    );
  }

  if (!data) return null;

  return (
    <VStack align="stretch" gap={6}>
      <Heading size={{ base: "md", md: "lg" }}>Analytics</Heading>

      {/* Lead stats */}
      <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
        <StatCard label="Total leads" value={data.leads.total} />
        <StatCard label="Leads (30 days)" value={data.leads.last30Days} />
        <StatCard
          label="New leads"
          value={data.leads.new}
          badge={data.leads.new > 0 ? "Unread" : undefined}
        />
        <StatCard
          label="Items stale soon"
          value={data.items.staleSoon}
          badge={data.items.staleSoon > 0 ? "Action needed" : undefined}
        />
      </SimpleGrid>

      {/* Inventory stats */}
      <SimpleGrid columns={{ base: 3 }} gap={4}>
        <StatCard label="Active items" value={data.items.active} />
        <StatCard label="Sold items" value={data.items.sold} />
        <StatCard label="Hidden items" value={data.items.hidden} />
      </SimpleGrid>

      {/* Lead trend */}
      <Box
        borderWidth="1px"
        borderColor="border.default"
        borderRadius="lg"
        bg="bg.panel"
        p={5}
      >
        <Text fontWeight="medium" mb={4}>
          Lead activity — last 30 days
        </Text>
        <LeadTrendChart trend={data.leadsTrend} />
      </Box>

      {/* Referral */}
      <ReferralCard />

      {/* Top items */}
      {data.topItems.length > 0 && (
        <Box
          borderWidth="1px"
          borderColor="border.default"
          borderRadius="lg"
          bg="bg.panel"
          p={5}
        >
          <Text fontWeight="medium" mb={4}>
            Top items by leads
          </Text>
          <VStack align="stretch" gap={3}>
            {data.topItems.map((item, i) => (
              <HStack key={item.id} justify="space-between">
                <HStack gap={3}>
                  <Text
                    fontSize="sm"
                    color="text.secondary"
                    w="20px"
                    textAlign="right"
                  >
                    {i + 1}.
                  </Text>
                  <Text fontSize="sm" fontWeight="medium" lineClamp={1}>
                    {item.name}
                  </Text>
                </HStack>
                <Badge variant="outline">
                  {item.leadCount} lead{item.leadCount !== 1 ? "s" : ""}
                </Badge>
              </HStack>
            ))}
          </VStack>
        </Box>
      )}
    </VStack>
  );
};
