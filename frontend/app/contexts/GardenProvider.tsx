// providers/GardenProvider.tsx
import React, { ReactNode } from 'react';
import { GardenDataProvider } from './GardenDataContext';
import { GardenLayerProvider } from './GardenLayerContext';

interface GardenProviderProps {
  children: ReactNode;
}

export const GardenProvider = ({ children }: GardenProviderProps) => {
  return (
    <GardenDataProvider>
      <GardenLayerProvider>
        {children}
      </GardenLayerProvider>
    </GardenDataProvider>
  );
};