import { useMutation, useQuery } from "@tanstack/react-query";
import api from "api/api";
import { queryClient } from "api/query-client";
import { QueryKeys } from "api/query-keys";
import type { ApiResponse } from "api/types";
import type {
  SfConfirmImagePayload,
  SfCreateShopPayload,
  SfPresignResponse,
  SfSearchItem,
  SfShop,
  SfShopImage,
  SfShopWithDistance,
} from "./types";

export const useShopStats = () => {
  return useQuery({
    queryKey: ["stock-finder", "shop-stats"],
    queryFn: async () => api.get<ApiResponse<{ shopCount: number }>>("/shops/stats/"),
    select: (r) => r.data.data,
    staleTime: 1000 * 60 * 5,
  });
};

export const useMyShop = () => {
  return useQuery({
    queryKey: QueryKeys.stockFinder.myShop,
    queryFn: async () => api.get<ApiResponse<SfShop>>("/shops/me/"),
    select: (r) => r.data.data,
    retry: false,
  });
};

export const usePublicShop = (id: string) => {
  return useQuery({
    queryKey: QueryKeys.stockFinder.shop(id),
    queryFn: async () =>
      api.get<ApiResponse<SfShop>>(`/shops/${id}/`),
    select: (r) => r.data.data,
    enabled: !!id,
  });
};

export const usePublicShopItems = (id: string) => {
  return useQuery({
    queryKey: [...QueryKeys.stockFinder.shop(id), "items"],
    queryFn: async () =>
      api.get<ApiResponse<{ items: SfSearchItem[] }>>(
        `/shops/${id}/items/`
      ),
    select: (r) => r.data.data.items,
    enabled: !!id,
  });
};

export const useNearbyShops = (
  lat: number | null,
  lng: number | null,
  radiusKm = 5
) => {
  return useQuery({
    queryKey: QueryKeys.stockFinder.nearbyShops(lat ?? 0, lng ?? 0, radiusKm),
    queryFn: async () =>
      api.get<ApiResponse<{ shops: SfShopWithDistance[] }>>(
        "/shops/nearby/",
        { params: { lat, lng, radius_km: radiusKm } }
      ),
    select: (r) => r.data.data.shops,
    enabled: lat !== null && lng !== null,
  });
};

export const useCreateShop = () => {
  return useMutation({
    mutationFn: async (payload: SfCreateShopPayload) =>
      api.post<ApiResponse<SfShop>>("/shops/", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.stockFinder.myShop });
    },
  });
};

export const useUpdateShop = () => {
  return useMutation({
    mutationFn: async (payload: Partial<SfCreateShopPayload>) =>
      api.patch<ApiResponse<SfShop>>("/shops/me/", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.stockFinder.myShop });
    },
  });
};

export const usePresignShopImage = () => {
  return useMutation({
    mutationFn: async (contentType: string) => {
      const response = await api.post<ApiResponse<SfPresignResponse>>(
        "/shops/me/images/presign/",
        { contentType }
      );
      return response.data.data;
    },
  });
};

export const useConfirmShopImage = () => {
  return useMutation({
    mutationFn: async (payload: SfConfirmImagePayload) => {
      const response = await api.post<ApiResponse<SfShopImage>>(
        "/shops/me/images/confirm/",
        payload
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.stockFinder.myShop });
    },
  });
};

export const useDeleteShopImage = () => {
  return useMutation({
    mutationFn: async (imageId: string) =>
      api.delete(`/shops/me/images/${imageId}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.stockFinder.myShop });
    },
  });
};
