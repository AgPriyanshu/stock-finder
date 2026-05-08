import { useMutation } from "@tanstack/react-query";
import api from "api/api";
import type { ApiResponse } from "api/types";
import { setOwnerToken } from "shared/local-storage/token";
import type { SfOtpVerifyResponse } from "./types";

export const useRequestOtp = () => {
  return useMutation({
    mutationFn: async (phone: string) => {
      return api.post<ApiResponse<{ sent: boolean }>>(
        "/auth/otp/request/",
        { phone }
      );
    },
  });
};

export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: async (payload: { phone: string; otp: string }) => {
      return api.post<ApiResponse<SfOtpVerifyResponse>>(
        "/auth/otp/verify/",
        payload
      );
    },
    onSuccess: (response) => {
      setOwnerToken(response.data.data.token);
    },
  });
};
