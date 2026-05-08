import { useMutation, useQuery } from "@tanstack/react-query";
import api from "api/api";
import { queryClient } from "api/query-client";
import { QueryKeys } from "api/query-keys";
import type { ApiResponse } from "api/types";
import type {
  SfCreateLeadPayload,
  SfCreateReportPayload,
  SfLead,
} from "./types";

export const useCreateLead = () => {
  return useMutation({
    mutationFn: async (payload: SfCreateLeadPayload) => {
      const response = await api.post<ApiResponse<SfLead>>(
        "/leads/",
        payload
      );
      return response.data.data;
    },
  });
};

export const useCreateReport = () => {
  return useMutation({
    mutationFn: async (payload: SfCreateReportPayload) =>
      api.post("/reports/", payload),
  });
};

export const useLeadInbox = () => {
  return useQuery({
    queryKey: QueryKeys.stockFinder.leadInbox,
    queryFn: async () =>
      api.get<ApiResponse<SfLead[]>>("/leads/inbox/"),
    select: (r) => r.data.data,
  });
};

export const useMarkLeadContacted = () => {
  return useMutation({
    mutationFn: async (leadId: string) =>
      api.patch<ApiResponse<SfLead>>(`/leads/${leadId}/contacted/`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.stockFinder.leadInbox,
      });
    },
  });
};

export const invalidateLeadInbox = () => {
  queryClient.invalidateQueries({ queryKey: QueryKeys.stockFinder.leadInbox });
};
