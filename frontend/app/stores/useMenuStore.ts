import { create } from 'zustand';
import { MenuElement } from '@/types';
import { menuItems } from '@/components/assets/menuItems';

type MenuState = {
  openSectionId: string | null;
  selectedItemId: string | null;
  selectedItem: MenuElement | null;
  setOpenSection: (id: string | null) => void;
  setSelectedItem: (id: string) => void;
};

export const useMenuStore = create<MenuState>((set) => ({
  openSectionId: null,
  selectedItemId: null,
  selectedItem: null,

  setOpenSection: (id) => set({ openSectionId: id }),

  setSelectedItem: (id) => {
    const found = menuItems.find(el => el.id === id) ?? null;
    set({
      selectedItemId: id,
      selectedItem: found,
    });
  },
}));