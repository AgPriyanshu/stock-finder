import { QueryClient } from "@tanstack/react-query";

/**
 * Create and configure the QueryClient with custom retry logic
 * Note: Token refresh is handled by Axios interceptors in api.ts
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Time before data is considered stale (5 minutes)
      staleTime: 1000 * 60 * 5,

      // Time before inactive queries are garbage collected (10 minutes)
      gcTime: 1000 * 60 * 10,

      // Custom retry logic that handles token refresh on 401
      retry: (_, error: unknown) => {
        // If it's a 401 error, attempt token refresh
        if (
          typeof error === "object" &&
          error !== null &&
          "data" in error &&
          typeof error.data === "object" &&
          error.data !== null &&
          "status" in error.data &&
          error.data.status === 401
        ) {
          return true; // Retry after token refresh
        }

        // For other errors, retry with exponential backoff
        return false;
      },

      // Custom retry delay with exponential backoff
      // Note: Token refresh is handled by Axios interceptors, not here
      retryDelay: (attemptIndex) => {
        // For 401 errors, retry quickly after the interceptor handles token refresh
        // For other errors, use exponential backoff: 1s, 2s, 4s, up to 30s
        return Math.min(1000 * 2 ** attemptIndex, 30000);
      },

      // Don't refetch on window focus by default (can be overridden per query)
      refetchOnWindowFocus: false,

      // Don't refetch on mount if data is fresh
      refetchOnMount: false,

      // Refetch on reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Don't retry mutations by default (login, signup, etc. shouldn't auto-retry)
      retry: false,
    },
  },
});
