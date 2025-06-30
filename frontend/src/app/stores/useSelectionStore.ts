// useSelectionStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { DrawingSource, SelectionState } from './SelectionState';
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
  setDrawing: (source: DrawingSource, color?: string) => void;
  clear: () => void;
};

export const useSelectionStore = create<SelectionStore>()(
  devtools(
    persist((set) => ({
      selection: { kind: null },
      selectedObjId: null,
      selectedObj: null,
      selectedItemId: null,
      
      setPlacing: (item) =>
        set({
          selection: { kind: 'placing', menuItem: item },
        }, false, 'setPlacing'),

      setSelectedObjId: (id: string | null) => {
        set({ selectedObjId: id }, false, 'setSelectedObjId');
      },

      setSelectedPaletteItemId: (id: string | null) => {
        set({ selectedItemId: id }, false, 'setSelectedItemId');
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
        }, false, 'setPendingPosition'),

      setEditing: (obj) => {
        if (useUIStore.getState().isMapLocked) return;
        set({
          selection: { kind: 'editing', obj },
          selectedObj: obj,
          selectedObjId: obj.id
        }, false, 'setEditing')
      },

      setConfirming: () => {
        set({
          selection: { kind: 'confirming' }
        }, false, 'setConfirming')
      },

      setDrawing: (source, color) => {
        if (useUIStore.getState().isMapLocked) return;
        if (!color) return;
        set({
          selection: { kind: 'drawing', source, color },
        }, false, 'setDrawing')
      },

      clear: () =>
        set({
          selection: { kind: null },
          selectedObj: null,
          selectedItemId: null
        }, false, 'clear'),
      isMouseDown: false,
      isModifierKeyDown: false,

      setMouseDown: (down) => set({ isMouseDown: down }, false, 'setMouseDown'),

      setModifierKeyDown: (down) => set({ isModifierKeyDown: down }, false, 'setModifierKeyDown'),
    }),
      {
        name: 'SelectionStorage',
        onRehydrateStorage: () => (state) => {
          console.log('hydration finished', state);
        },
      }
    ),
    { name: 'SelectionStore' }
  )
);