import axios, { AxiosError } from "axios";
import type {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { getAccessToken } from "shared/local-storage/token";
import { EnvVariable } from "app/config/env-variables";
import { apiRequestMapper, apiResponseMapper } from "./utils";

const api: AxiosInstance = axios.create({
  baseURL: EnvVariable.API_BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config.url) {
      const [baseUrl, queryString] = config.url.split("?");
      if (!baseUrl.endsWith("/")) {
        config.url = `${baseUrl}/${queryString ? `?${queryString}` : ""}`;
      }
    }

    const token = getAccessToken();
    const isLoginEndpoint = config.url?.includes("/auth/login/");

    if (token && config.headers && !isLoginEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Handle FormData specially - don't map it and let browser set Content-Type
    if (config.data instanceof FormData) {
      // Remove Content-Type header to let browser set it with boundary
      if (config.headers) {
        delete config.headers["Content-Type"];
      }
    } else {
      if (config.data) {
        config.data = apiRequestMapper(config.data);
      }
    }

    if (config.params) {
      config.params = apiRequestMapper(config.params);
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.data) {
      response.data = apiResponseMapper(response.data);
    }
    return response;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

export default api;
