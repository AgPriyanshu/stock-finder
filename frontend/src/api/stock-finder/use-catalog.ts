import { useQuery } from "@tanstack/react-query";
import api from "api/api";
import type { ApiResponse } from "api/types";
import type { SfCatalogItem } from "./types";

export const useCatalogItems = (q: string, categoryId?: string) => {
  return useQuery({
    queryKey: ["stock-finder", "catalog", q, categoryId ?? ""],
    queryFn: async () => {
      const params: Record<string, string> = { q };
      if (categoryId) params.category = categoryId;
      return api.get<ApiResponse<SfCatalogItem[]>>("/catalog/", { params });
    },
    select: (r) => r.data.data,
    enabled: q.length >= 2,
    staleTime: 1000 * 30,
  });
};
