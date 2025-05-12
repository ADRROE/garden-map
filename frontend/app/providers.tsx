'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { GardenProvider } from './contexts/GardenProvider';
import { useState } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  // Ensure the QueryClient is only created once
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <GardenProvider>
        {children}
      </GardenProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
