import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import api from "api/api";
import { QueryKeys } from "api/query-keys";
import type { ApiResponse } from "api/types";
import type {
  SfAutocompleteSuggestion,
  SfSearchPage,
  SfSearchParams,
} from "./types";

export const useSearchAutocomplete = (q: string) =>
  useQuery({
    queryKey: QueryKeys.stockFinder.autocomplete(q),
    queryFn: async () => {
      const response = await api.get<
        ApiResponse<{ suggestions: SfAutocompleteSuggestion[] }>
      >("/search/autocomplete/", { params: { q } });
      return response.data.data.suggestions;
    },
    enabled: q.trim().length >= 2,
    staleTime: 60_000,
  });

export const useSearchItems = (
  params: SfSearchParams,
  options?: { enabled?: boolean }
) => {
  return useInfiniteQuery({
    queryKey: QueryKeys.stockFinder.search(params),
    queryFn: async ({ pageParam }) => {
      const response = await api.get<ApiResponse<SfSearchPage>>(
        "/search/items/",
        {
          params: {
            ...params,
            cursor: pageParam ?? undefined,
          },
        }
      );
      return response.data.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: options?.enabled ?? true,
  });
};
