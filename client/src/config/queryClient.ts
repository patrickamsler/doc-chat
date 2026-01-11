import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: How long data is considered fresh
      staleTime: 5 * 60 * 1000, // 5 minutes

      // Cache time: How long unused data stays in cache
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)

      // Retry logic
      retry: (failureCount, error: any) => {
        // Don't retry on 401/403 (auth errors)
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          return false;
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },

      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch configuration
      refetchOnWindowFocus: false, // Don't refetch on window focus (can be noisy)
      refetchOnReconnect: true,    // Refetch when reconnecting
      refetchOnMount: true,        // Refetch when component mounts
    },
    mutations: {
      // Retry mutations only once (to avoid duplicate operations)
      retry: 1,
    },
  },
});
