import { useMutation, useQuery } from "@tanstack/react-query";
import type { ApiResponse } from "api/types";
import { QueryKeys } from "api/query-keys";
import type { AxiosResponse } from "axios";
import { setAccessToken, setOwnerToken } from "../../shared/local-storage/token";
import api from "../api";
import type { ChangePasswordPayload, LoginCredentials, LoginResponse, OwnerProfile, ReferralCode, RegisterPayload, ShopSignupRequestPayload, TrackReferralClickPayload, UpdateOwnerProfilePayload } from "./types";

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

export const useShopSignupRequest = () => {
  return useMutation({
    mutationFn: async (payload: ShopSignupRequestPayload) =>
      api.post<ApiResponse<{ received: boolean }>>("/auth/signup-request/", payload),
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async (payload: RegisterPayload) =>
      api.post<ApiResponse<LoginResponse>>("/auth/register/", payload),
    onSuccess: (response: AxiosResponse<ApiResponse<LoginResponse>>) => {
      const token = response.data.data.token;
      setOwnerToken(token);
      // Set access token immediately so API calls in the welcome modal work.
      setAccessToken(token);
    },
  });
};

export const useReferralCode = () => {
  return useQuery({
    queryKey: QueryKeys.referralCode,
    queryFn: async () => api.get<ApiResponse<ReferralCode>>("/auth/referral/"),
    select: (r) => r.data.data,
  });
};

export const useTrackReferralClick = () => {
  return useMutation({
    mutationFn: async (payload: TrackReferralClickPayload) =>
      api.post<ApiResponse<{ tracked: boolean }>>("/auth/referral/track/", payload),
  });
};
