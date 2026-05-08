import { useQuery } from "@tanstack/react-query";
import api from "api/api";
import { QueryKeys } from "api/query-keys";
import type { ApiResponse } from "api/types";
import type { SfCategory } from "./types";

export const useCategories = () => {
  return useQuery({
    queryKey: QueryKeys.stockFinder.categories,
    queryFn: async () =>
      api.get<ApiResponse<SfCategory[]>>("/categories/"),
    select: (r) => r.data.data,
    staleTime: 1000 * 60 * 5,
  });
};
