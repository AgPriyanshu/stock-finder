import { useMutation, useQuery } from "@tanstack/react-query";
import api from "api/api";
import { queryClient } from "api/query-client";
import { QueryKeys } from "api/query-keys";
import type { ApiResponse } from "api/types";
import type {
  SfCreateReviewPayload,
  SfShopReview,
  SfShopReviewsResponse,
} from "./types";

export const useShopReviews = (shopId: string) => {
  return useQuery({
    queryKey: QueryKeys.stockFinder.shopReviews(shopId),
    queryFn: async () =>
      api.get<ApiResponse<SfShopReviewsResponse>>(`/shops/${shopId}/reviews/`),
    select: (r) => r.data.data,
    enabled: !!shopId,
  });
};

export const useCreateReview = (shopId: string) => {
  return useMutation({
    mutationFn: async (payload: SfCreateReviewPayload) => {
      const response = await api.post<ApiResponse<SfShopReview>>(
        `/shops/${shopId}/reviews/`,
        payload
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.stockFinder.shopReviews(shopId),
      });
      queryClient.invalidateQueries({
        queryKey: QueryKeys.stockFinder.shop(shopId),
      });
    },
  });
};
