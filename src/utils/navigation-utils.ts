// navigation-utils.ts
import { useLocalSearchParams as useExpoRouterLocalSearchParams } from 'expo-router';

// Type-safe wrapper for useLocalSearchParams
export function useLocalSearchParams(): Record<string, string | string[]> {
  return useExpoRouterLocalSearchParams();
}

// Helper function to get specific typed params
export function useTypedParams<T extends Record<string, string>>(): T {
  const params = useExpoRouterLocalSearchParams();
  return params as unknown as T;
}
