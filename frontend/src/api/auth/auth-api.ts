import { useMutation, useQuery } from "@tanstack/react-query";
import type { ApiResponse } from "api/types";
import { QueryKeys } from "api/query-keys";
import type { AxiosResponse } from "axios";
import { setOwnerToken } from "../../shared/local-storage/token";
import api from "../api";
import type { ChangePasswordPayload, LoginCredentials, LoginResponse, OwnerProfile, UpdateOwnerProfilePayload } from "./types";

export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      return await api.post<ApiResponse<LoginResponse>>(
        "/auth/login/",
        credentials
      );
    },
    onSuccess: (response: AxiosResponse<ApiResponse<LoginResponse>>) => {
      const data = response.data.data;
      setOwnerToken(data.token);
    },
  });
};

export const useOwnerProfile = () => {
  return useQuery({
    queryKey: QueryKeys.ownerProfile,
    queryFn: async () => api.get<ApiResponse<OwnerProfile>>("/auth/me/"),
    select: (r) => r.data.data,
  });
};

export const useUpdateOwnerProfile = () => {
  return useMutation({
    mutationFn: async (payload: UpdateOwnerProfilePayload) =>
      api.patch<ApiResponse<OwnerProfile>>("/auth/me/", payload),
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (payload: ChangePasswordPayload) => {
      return await api.post<ApiResponse<{ changed: boolean }>>(
        "/auth/change-password/",
        payload
      );
    },
  });
};
