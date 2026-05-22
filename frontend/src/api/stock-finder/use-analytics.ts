import { useQuery } from "@tanstack/react-query";
import api from "api/api";
import { QueryKeys } from "api/query-keys";
import type { ApiResponse } from "api/types";
import type { SfAnalytics } from "./types";

export const useAnalytics = () => {
  return useQuery({
    queryKey: QueryKeys.stockFinder.analytics,
    queryFn: async () => api.get<ApiResponse<SfAnalytics>>("/analytics/"),
    select: (r) => r.data.data,
  });
};
