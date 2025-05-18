import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { menuItems } from '@/components/assets/menuItems';
import { useSelectionStore } from './useSelectionStore';

type MenuState = {
  openSectionId: string | null;
  isLoading: boolean;
  setOpenSection: (id: string | null) => void;
  setSelectedItem: (id: string) => void;
  toggleIsLoading: () => void;
};

export const useMenuStore = create<MenuState>()(devtools((set) => ({
  openSectionId: null,
  isLoading: false,

  setOpenSection: (id) => set({ openSectionId: id }),
  setSelectedItem: (id) => {
    const found = menuItems.find(el => el.id === id) ?? null;
    if (!found) return;
    useSelectionStore.getState().setPlacing(found);
  },
  toggleIsLoading: () => set((s) => ({ isLoading: !s.isLoading }))
}), {name: 'MenuStore'}));
