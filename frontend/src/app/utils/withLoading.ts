// utils/withLoading.ts
import { useUIStore } from '@/stores/useUIStore';

export const withLoading = async <T>(fn: () => Promise<T>): Promise<T> => {
  const { toggleIsLoading } = useUIStore.getState();
  toggleIsLoading();
  try {
    return await fn();
  } finally {
    toggleIsLoading();
  }
};