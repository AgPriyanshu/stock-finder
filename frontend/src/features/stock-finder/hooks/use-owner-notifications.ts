import { useEffect, useRef } from "react";
import { queryClient } from "api/query-client";
import { QueryKeys } from "api/query-keys";
import { EnvVariable } from "app/config/env-variables";
import { toaster } from "design-system/toaster/toaster-instance";
import { getOwnerToken } from "shared/local-storage";

interface LeadCreatedEvent {
  type: "stock_finder.lead_created";
  lead_id: string;
  shop_id: string;
  buyer_name: string;
}

export const useOwnerNotifications = (
  onNewLead?: () => void
) => {
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const token = getOwnerToken();
    if (!token) return;

    const base = (EnvVariable.API_BASE_URL ?? "").replace(/\/$/, "");
    const url = `${base}/events/?token=${encodeURIComponent(token)}`;

    const es = new EventSource(url);
    esRef.current = es;

    es.onmessage = (event: MessageEvent<string>) => {
      try {
        const data = JSON.parse(event.data) as LeadCreatedEvent | { type: string };
        if (data.type === "stock_finder.lead_created") {
          const e = data as LeadCreatedEvent;
          queryClient.invalidateQueries({
            queryKey: QueryKeys.stockFinder.leadInbox,
          });
          toaster.info({
            title: "New lead",
            description: `${e.buyer_name} sent you a message.`,
          });
          onNewLead?.();
        }
      } catch {
        // Ignore malformed events.
      }
    };

    es.onerror = () => {
      // EventSource reconnects automatically on error.
    };

    return () => {
      es.close();
      esRef.current = null;
    };
    // Reconnect only when token changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getOwnerToken()]);
};
