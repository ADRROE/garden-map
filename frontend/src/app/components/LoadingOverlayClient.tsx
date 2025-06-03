// components/LoadingOverlayClient.tsx
'use client';

import { useUIStore } from '@/stores/useUIStore';
import LoadingOverlay from './LoadingOverlay';

const LoadingOverlayClient = () => {
  const isLoading = useUIStore((state) => state.isLoading);

  return (
    isLoading ?
      <LoadingOverlay isVisible={isLoading} />
      : null
  );
};

export default LoadingOverlayClient;