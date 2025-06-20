// useSelectionStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { SelectionState } from './SelectionState';
import { GardenEntity, PaletteItem, Vec2 } from '../types';
import { useUIStore } from './useUIStore';


type SelectionStore = {
  selection: SelectionState;
  selectedObjId: string | null;
  selectedObj: GardenEntity | null;
  selectedItemId: string | null;
  isMouseDown: boolean;
  isModifierKeyDown: boolean;
  setMouseDown: (down: boolean) => void;
  setModifierKeyDown: (down: boolean) => void;
  setSelectedObjId: (id: string | null) => void;
  setSelectedPaletteItemId: (id: string) => void;
  setPlacing: (item: PaletteItem) => void;
  setPendingPosition: (pos: Vec2) => void;
  setEditing: (obj: GardenEntity) => void;
  setConfirming: () => void;
  setDrawing: (color?: string) => void;
  clear: () => void;
};

export const useSelectionStore = create<SelectionStore>()(
  devtools((set) => ({
    selection: { kind: null },
    selectedObjId: null,
    selectedObj: null,
    selectedItemId: null,
    setPlacing: (item) =>
      set({
        selection: { kind: 'placing', menuItem: item },
      }),

    setSelectedObjId: (id: string | null) => {
      set({ selectedObjId: id });     
    },

    setSelectedPaletteItemId: (id: string | null) => {
      set({ selectedItemId: id });
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

    setEditing: (obj) => {
      if (useUIStore.getState().isMapLocked) return;
      set({
        selection: { kind: 'editing', obj },
        selectedObj: obj,
        selectedObjId: obj.id
      })
    },
    setConfirming: () => {
      set({
        selection: { kind: 'confirming' }
      })
    },

    setDrawing: (color) => {
      if (useUIStore.getState().isMapLocked) return;
      if (!color) return;
      set({
        selection: { kind: 'drawing', color },
      })
    },

    clear: () =>
      set({
        selection: { kind: null },
        selectedObj: null,
        selectedItemId: null
      }),
    isMouseDown: false,
    isModifierKeyDown: false,

    setMouseDown: (down) => set({ isMouseDown: down }),
    setModifierKeyDown: (down) => set({ isModifierKeyDown: down }),
  }), { name: 'SelectionStore' })
);