// useSelectionStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { SelectionState } from './SelectionState';
import { MenuElement, GardenElementObject, Vec2, GardenObject } from '../types';
import { useGardenStore } from './useGardenStore';
import { useUIStore } from './useUIStore';

type SelectionStore = {
  selection: SelectionState;
  selectedObjId: string | null;
  selectedObj: GardenObject | null;
  selectedItemId: string | null;
  isMouseDown: boolean;
  isModifierKeyDown: boolean;
  setMouseDown: (down: boolean) => void;
  setModifierKeyDown: (down: boolean) => void;
  setSelectedObjId: (id: string | null) => void;
  setSelectedItemId: (id: string) => void;
  setPlacing: (item: MenuElement) => void;
  setPendingPosition: (pos: Vec2) => void;
  setEditing: (obj: GardenElementObject) => void;
  setConfirming: () => void;
  setDrawing: (color: string) => void;
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
      const obj = useGardenStore.getState().present.elements.find(e => e.id === id);
      if (obj) {
        set({ selectedObjId: id, selectedObj: { type: 'element', object: obj } });
      }
    },

    setSelectedItemId: (id: string | null) => {
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
        selectedObj: { type: 'element', object: obj },
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