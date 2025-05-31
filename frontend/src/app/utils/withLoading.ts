// utils/withLoading.ts
import { useUIStore } from '@/stores/useUIStore';

export const withLoading = async <T>(fn: () => Promise<T>): Promise<T> => {
  const setIsLoading = useUIStore.getState().setIsLoading;
  setIsLoading(true);
  try {
    return await fn();
  } finally {
    setIsLoading(false);
  }
};