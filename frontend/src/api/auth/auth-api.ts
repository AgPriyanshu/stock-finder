import { useMutation } from "@tanstack/react-query";
import type { ApiResponse } from "api/types";
import type { AxiosResponse } from "axios";
import { setAccessToken } from "../../shared/local-storage/token";
import api from "../api";
import type { LoginCredentials, LoginResponse } from "./types";

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
      setAccessToken(data.token);
    },
  });
};
