import { useMutation, useQuery } from "@tanstack/react-query";
import api from "api/api";
import { queryClient } from "api/query-client";
import { QueryKeys } from "api/query-keys";
import type { ApiResponse } from "api/types";
import type {
  SfBulkUploadItemsResponse,
  SfCreateItemPayload,
  SfItem,
} from "./types";

type ItemsCache = { data: ApiResponse<SfItem[]> };

const myItemsKey = (status?: string) => [
  ...QueryKeys.stockFinder.myItems,
  status,
];

const getItemsCache = (status?: string) =>
  queryClient.getQueryData<ItemsCache>(myItemsKey(status));

const setItemsCache = (
  status: string | undefined,
  updater: (items: SfItem[]) => SfItem[]
) => {
  const cached = getItemsCache(status);

  if (!cached) return;

  queryClient.setQueryData<ItemsCache>(myItemsKey(status), {
    ...cached,
    data: { ...cached.data, data: updater(cached.data.data) },
  });
};

export const useMyItems = (status?: string) => {
  return useQuery({
    queryKey: myItemsKey(status),
    queryFn: async () =>
      api.get<ApiResponse<SfItem[]>>("/items/", {
        params: status ? { status } : undefined,
      }),
    select: (r) => r.data.data,
  });
};

export const useItem = (
  id: string,
  options?: {
    enabled?: boolean;
    refetchInterval?: false | number | (() => false | number);
  }
) => {
  return useQuery({
    queryKey: QueryKeys.stockFinder.item(id),
    queryFn: async () =>
      api.get<ApiResponse<SfItem>>(`/items/${id}/`),
    select: (r) => r.data.data,
    enabled: !!id,
    ...options,
  });
};

export const useCreateItem = () => {
  return useMutation({
    mutationFn: async (payload: SfCreateItemPayload) => {
      const response = await api.post<ApiResponse<SfItem>>(
        "/items/",
        payload
      );
      return response.data.data;
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({
        queryKey: QueryKeys.stockFinder.myItems,
      });
      const previousData = getItemsCache(undefined);

      if (previousData) {
        setItemsCache(undefined, (items) => [
          {
            id: `temp-${Date.now()}`,
            ...payload,
            status: "active",
            images: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            staleAt: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
            shop: "temp",
            shopName: "temp",
            sku: payload.sku || "",
            description: payload.description || "",
            price: payload.price || null,
          } as unknown as SfItem,
          ...items,
        ]);
      }
      return { previousData };
    },
    onError: (_err, _payload, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(myItemsKey(undefined), context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.stockFinder.myItems });
    },
  });
};

export const useBulkUploadItems = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post<ApiResponse<SfBulkUploadItemsResponse>>(
        "/items/bulk-upload/",
        formData
      );
      return response.data.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.stockFinder.myItems });
    },
  });
};

export const useUpdateItem = () => {
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: Partial<SfCreateItemPayload> & { id: string }) => {
      const response = await api.patch<ApiResponse<SfItem>>(
        `/items/${id}/`,
        payload
      );
      return response.data.data;
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: QueryKeys.stockFinder.myItems,
      });
      const previousData = getItemsCache(undefined);

      if (previousData) {
        setItemsCache(undefined, (items) =>
          items.map((item) =>
            item.id === variables.id
              ? ({ ...item, ...variables } as SfItem)
              : item
          )
        );
      }
      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(myItemsKey(undefined), context.previousData);
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.stockFinder.myItems });
      queryClient.invalidateQueries({
        queryKey: QueryKeys.stockFinder.item(variables.id),
      });
    },
  });
};

export const useDeleteItem = () => {
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/items/${id}/`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: QueryKeys.stockFinder.myItems,
      });
      const previousData = getItemsCache(undefined);

      if (previousData) {
        setItemsCache(undefined, (items) =>
          items.filter((item) => item.id !== id)
        );
      }
      return { previousData };
    },
    onError: (_err, _id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(myItemsKey(undefined), context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.stockFinder.myItems });
    },
  });
};

export const useRefreshItem = () => {
  return useMutation({
    mutationFn: async (id: string) =>
      api.post<ApiResponse<{ staleAt: string }>>(
        `/items/${id}/refresh/`
      ),
    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: QueryKeys.stockFinder.myItems,
      });
      const previousData = getItemsCache(undefined);

      if (previousData) {
        setItemsCache(undefined, (items) =>
          items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  staleAt: new Date(
                    Date.now() + 30 * 24 * 60 * 60 * 1000
                  ).toISOString(),
                }
              : item
          )
        );
      }
      return { previousData };
    },
    onError: (_err, _id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(myItemsKey(undefined), context.previousData);
      }
    },
    onSettled: (_data, _error, id) => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.stockFinder.item(id) });
      queryClient.invalidateQueries({ queryKey: QueryKeys.stockFinder.myItems });
    },
  });
};
