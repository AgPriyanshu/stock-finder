import { useMutation, useQuery } from "@tanstack/react-query";
import type { ApiResponse } from "api/types";
import { queryClient } from "api/query-client";
import { QueryKeys } from "api/query-keys";
import type { AxiosResponse } from "axios";
import { setAccessToken, setOwnerToken } from "../../shared/local-storage/token";
import api from "../api";
import type { ChangePasswordPayload, LoginCredentials, LoginResponse, OwnerProfile, OwnerTourName, OwnerToursStatus, PasswordResetConfirmPayload, PasswordResetRequestPayload, ReferralCode, RegisterPayload, ShopSignupRequestPayload, SupportRequestPayload, TrackReferralClickPayload, UpdateOwnerProfilePayload } from "./types";

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

export const useRequestPasswordReset = () => {
  return useMutation({
    mutationFn: async (payload: PasswordResetRequestPayload) =>
      api.post<ApiResponse<{ sent: boolean }>>("/auth/password-reset/request/", payload),
  });
};

export const useConfirmPasswordReset = () => {
  return useMutation({
    mutationFn: async (payload: PasswordResetConfirmPayload) =>
      api.post<ApiResponse<{ reset: boolean }>>("/auth/password-reset/confirm/", payload),
  });
};

export const useShopSignupRequest = () => {
  return useMutation({
    mutationFn: async (payload: ShopSignupRequestPayload) =>
      api.post<ApiResponse<{ received: boolean }>>("/auth/signup-request/", payload),
  });
};

export const useSupportRequest = () => {
  return useMutation({
    mutationFn: async (payload: SupportRequestPayload) =>
      api.post<ApiResponse<{ received: boolean }>>("/auth/support/", payload),
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async (payload: RegisterPayload) =>
      api.post<ApiResponse<LoginResponse>>("/auth/register/", payload),
    onSuccess: (response: AxiosResponse<ApiResponse<LoginResponse>>) => {
      const token = response.data.data.token;
      setOwnerToken(token);
      // Set access token immediately so the owner's first API calls are authenticated.
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

export const useOwnerTours = () => {
  return useQuery({
    queryKey: QueryKeys.ownerTours,
    queryFn: async () => api.get<ApiResponse<OwnerToursStatus>>("/auth/tours/"),
    select: (r) => r.data.data,
  });
};

export const useCompleteOwnerTour = () => {
  return useMutation({
    mutationFn: async (name: OwnerTourName) =>
      api.post<ApiResponse<OwnerToursStatus>>("/auth/tours/", { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.ownerTours });
    },
  });
};

export const useTrackReferralClick = () => {
  return useMutation({
    mutationFn: async (payload: TrackReferralClickPayload) =>
      api.post<ApiResponse<{ tracked: boolean }>>("/auth/referral/track/", payload),
  });
};
