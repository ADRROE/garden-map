// useSelectionStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { SelectionState } from './SelectionState';
import { MenuElement, GardenElement, Vec2 } from '../types';
import { useGardenStore } from './useGardenStore';
import { useUIStore } from './useUIStore';
import { useMenuStore } from './useMenuStore';

type SelectionStore = {
  selection: SelectionState;
  selectedElementId: string | null;
  selectedElement: GardenElement | null;
  selectedItemId: string | null;
  selectedItem: MenuElement | null;
  isMouseDown: boolean;
  isModifierKeyDown: boolean;
  setMouseDown: (down: boolean) => void;
  setModifierKeyDown: (down: boolean) => void;
  setSelectedElement: (id: string | null) => void;
  setSelectedItem: (id: string) => void;
  setPlacing: (item: MenuElement) => void;
  setPendingPosition: (pos: Vec2) => void;
  setEditing: (item: GardenElement) => void;
  setConfirming: () => void;
  setDrawing: (color: string) => void;
  clear: () => void;
};

export const useSelectionStore = create<SelectionStore>()(
  devtools((set) => ({
    selection: { kind: null },
    selectedElementId: null,
    selectedElement: null,
    selectedItemId: null,
    selectedItem: null,
    setPlacing: (item) =>
      set({
        selection: { kind: 'placing', menuItem: item },
      }),

    setSelectedElement: (id: string | null) => {
      const element = useGardenStore.getState().present.elements.find(e => e.id === id);
      set({ selectedElementId: id, selectedElement: element ?? null });
    },

    setSelectedItem: (id: string | null) => {
      const item = useMenuStore.getState().menuItems.find(i => i.id === id);
      set({ selectedItemId: id, selectedItem: item ?? null });
    },

    setPendingPosition: (position: Vec2) =>
      set((state) => {
        if (state.selection.kind === 'placing') {
          return {
            selection: {
              ...state.selection,
              pendingPosition: position,
            },
          };
        }
        return {};
      }),

    setEditing: (element) => {
      if (useUIStore.getState().isMapLocked) return;
      set({
        selection: { kind: 'editing', element },
        selectedElement: element,
        selectedElementId: element.id
      })
    },
    setConfirming: () => {
      set({
        selection: { kind: 'confirming'}
      })
    },

    setDrawing: (color) => {
      if (useUIStore.getState().isMapLocked) return;
      set({
        selection: { kind: 'drawing', color },
      })
    },

    clear: () =>
      set({
        selection: { kind: null },
        selectedElement: null,
        selectedItem: null
      }),
          isMouseDown: false,
    isModifierKeyDown: false,

    setMouseDown: (down) => set({ isMouseDown: down }),
    setModifierKeyDown: (down) => set({ isModifierKeyDown: down }),
  }), { name: 'SelectionStore' })
);