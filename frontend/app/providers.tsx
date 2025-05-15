'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { GardenLayerProvider } from './contexts/GardenLayerContext';
import { useState } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  // Ensure the QueryClient is only created once
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <GardenLayerProvider>
        {children}
      </GardenLayerProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
