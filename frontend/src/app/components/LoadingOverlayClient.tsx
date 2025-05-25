// components/LoadingOverlayClient.tsx
'use client';

import { useUIStore } from '@/stores/useUIStore';
import LoadingOverlay from './LoadingOverlay';

const LoadingOverlayClient = ({ children }: { children: React.ReactNode }) => {
  const isLoading = useUIStore((state) => state.isLoading);

  return (
    <>
      <LoadingOverlay isVisible={isLoading} />
      {children}
    </>
  );
};

export default LoadingOverlayClient;