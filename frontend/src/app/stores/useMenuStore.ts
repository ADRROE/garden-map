import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { menuItems } from '@/components/assets/menuItems';
import { MenuElement } from '@/types';

type MenuState = {
  menuItems: MenuElement[];
  openSectionId: string | null;
  openSection: MenuSection | null;
  isLoading: boolean;
  setOpenSection: (id: string | null) => void;
  toggleIsLoading: () => void;
};

export type MenuSection = {
    id: string;
    title: string;
    items: MenuElement[];
};

export const useMenuStore = create<MenuState>()(devtools((set) => ({
  menuItems,
  openSectionId: null,
  openSection: null,
  isLoading: false,

  setOpenSection: (id) => set({ openSectionId: id }),
  toggleIsLoading: () => set((s) => ({ isLoading: !s.isLoading }))
}), {name: 'MenuStore'}));
