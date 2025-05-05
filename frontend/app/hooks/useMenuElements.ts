// src/hooks/useMenuItems.ts
import { useQuery } from '@tanstack/react-query';
import { fetchMenuElements } from '../services/menuService';
import { MenuElement } from '@/types';

export function useMenuElements() {
  return useQuery<MenuElement[]>(
    ['menuElements'],
    fetchMenuElements,
    {
      staleTime: 1000 * 60 * 60, // 1 hour
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    }
  );
}