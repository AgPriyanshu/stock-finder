import {
  Badge,
  Box,
  Button,
  Center,
  Flex,
  HStack,
  Heading,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useLeadInbox, useMarkLeadContacted } from "api/stock-finder";
import type { SfLead } from "api/stock-finder";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

type Filter = "all" | "new" | "contacted";

const WHATSAPP_BASE = "https://wa.me/91";

const buildWhatsAppUrl = (
  phone: string | null,
  buyerName: string,
  itemName: string | null
): string => {
  const num = phone?.replace(/\D/g, "") ?? "";
  const greeting = buyerName ? `Hi ${buyerName}` : "Hi";
  const about = itemName ? `, regarding "${itemName}"` : "";
  const text = encodeURIComponent(
    `${greeting}${about} — I saw your enquiry on Dead Stock Finder.`
  );
  return `${WHATSAPP_BASE}${num}?text=${text}`;
};

const LeadRow = ({ lead }: { lead: SfLead }) => {
  const { mutate: markContacted, isPending } = useMarkLeadContacted();
  const isNew = !lead.contactedAt;

  return (
    <Box
      className="lead-row"
      p={4}
      borderWidth={1}
      borderRadius="lg"
      borderColor="border.default"
      bg="bg.panel"
      w="full"
    >
      <Flex justify="space-between" align="flex-start" gap={3} wrap="wrap">
        <VStack align="start" gap={1} flex={1}>
          <HStack gap={2}>
            <Text fontWeight="semibold" fontSize="sm">
              {lead.buyerName}
            </Text>
            {isNew && (
              <Badge variant="subtle" colorPalette="gray" size="sm">
                New
              </Badge>
            )}
          </HStack>
          {lead.itemName && (
            <Text fontSize="xs" color="text.secondary">
              About: {lead.itemName}
            </Text>
          )}
          <Text fontSize="sm" color="text.primary" mt={1}>
            {lead.message}
          </Text>
          <Text fontSize="xs" color="text.muted">
            {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
          </Text>
        </VStack>

        <VStack gap={2} align="stretch" minW="140px">
          {lead.buyerPhone && (
            <a
              href={buildWhatsAppUrl(
                lead.buyerPhone,
                lead.buyerName,
                lead.itemName
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="xs" variant="solid" colorPalette="gray" w="full">
                Reply on WhatsApp
              </Button>
            </a>
          )}
          {isNew && (
            <Button
              size="xs"
              variant="outline"
              loading={isPending}
              onClick={() => markContacted(lead.id)}
            >
              Mark contacted
            </Button>
          )}
        </VStack>
      </Flex>
    </Box>
  );
};

export const LeadInbox = () => {
  const { data: leads = [], isLoading } = useLeadInbox();
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = leads.filter((l) => {
    if (filter === "new") return !l.contactedAt;
    if (filter === "contacted") return !!l.contactedAt;
    return true;
  });

  const newCount = leads.filter((l) => !l.contactedAt).length;

  if (isLoading) {
    return (
      <Center py={12}>
        <Spinner />
      </Center>
    );
  }

  return (
    <Box className="lead-inbox" w="full">
      <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={2}>
        <HStack gap={2}>
          <Heading size="md">Lead inbox</Heading>
          {newCount > 0 && (
            <Badge variant="subtle" colorPalette="gray">
              {newCount} new
            </Badge>
          )}
        </HStack>

        <HStack gap={1}>
          {(["all", "new", "contacted"] as Filter[]).map((f) => (
            <Button
              key={f}
              size="xs"
              variant={filter === f ? "solid" : "outline"}
              colorPalette="gray"
              onClick={() => setFilter(f)}
              textTransform="capitalize"
            >
              {f}
            </Button>
          ))}
        </HStack>
      </Flex>

      {filtered.length === 0 ? (
        <Center py={12}>
          <Text color="text.muted">
            {filter === "new" ? "No new leads." : "No leads yet."}
          </Text>
        </Center>
      ) : (
        <VStack gap={3} align="stretch">
          {filtered.map((lead) => (
            <LeadRow key={lead.id} lead={lead} />
          ))}
        </VStack>
      )}
    </Box>
  );
};
