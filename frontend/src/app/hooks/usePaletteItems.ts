// src/hooks/useMenuItems.ts
import { useQuery } from '@tanstack/react-query';
import { fetchMenuItems } from '../services/menuService';
import { PaletteItem } from '../types';

export function useMenuItems() {
  return useQuery<PaletteItem[]>(
    ['menuItems'],
    () => fetchMenuItems(),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    }
  );
}