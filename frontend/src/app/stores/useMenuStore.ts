import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { PaletteItem, Vec2 } from '@/types';

export type Menu = 'picker' | 'prop'

export type MenuState = {
  activeMenu: string | null;
  menuItems: PaletteItem[];
  propMenuObjectId?: string | null;
  openSectionId?: string | null;
  openSection?: MenuSection | null;
  isLoading: boolean;
  position?: Vec2 | null;
  setOpenSection: (id: string | null) => void;
  setOpenPropMenu: (id: string | null) => void;
  toggleIsLoading: () => void;
  dispatch: (action: MenuAction) => void;
};

export type MenuSection = {
  id: string;
  title: string;
  items: PaletteItem[];
};

export type MenuAction =
  | { type: 'SHOW_MENU'; menu: Menu }
  | { type: 'HIDE_MENU'; menu: Menu }
  | { type: 'TOGGLE_MENU'; menu: Menu }

export const useMenuStore = create<MenuState>()(devtools((set) => ({
  activeMenu: null,
  menuItems: [],
  propMenuObjectId: null,
  openSectionId: null,
  openSection: null,
  isLoading: false,
  position: null,

  setOpenSection: (id) => set({ openSectionId: id }),
  setOpenPropMenu: (id) => set({ propMenuObjectId: id, activeMenu: 'prop'}),
  toggleIsLoading: () => set((s) => ({ isLoading: !s.isLoading })),

  dispatch: (action: MenuAction) =>
    set((state) => ({
      ...baseReducer(state, action),
    })),
}), { name: 'MenuStore' }));

function baseReducer(state: MenuState, action: MenuAction): Partial<MenuState> {
  switch (action.type) {
    case "SHOW_MENU":
      return {
        activeMenu: action.menu
      };
    case "HIDE_MENU":
      return {
        activeMenu: null
      };
    case "TOGGLE_MENU":
      return {
        ...state,
        activeMenu: state.activeMenu === action.menu
          ? null
          : action.menu,
      };
    default:
      return {};
  }
}