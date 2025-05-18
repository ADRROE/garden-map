// useSelectionStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { SelectionState } from './SelectionState';
import { MenuElement, GardenElement, Vec2 } from '@/types';
import { useGardenStore } from './useGardenStore';
import { useUIStore } from './useUIStore';

type SelectionStore = {
  selection: SelectionState;
  selectedElementId: string | null;
  selectedElement: GardenElement | null;
  setSelectedElement: (id: string | null) => void;
  setPlacing: (item: MenuElement) => void;
  setPendingPosition: (pos: Vec2) => void;
  setEditing: (item: GardenElement) => void;
  setZoneSelection: (zoneId: string) => void;
  clear: () => void;
};

export const useSelectionStore = create<SelectionStore>()(
  devtools((set) => ({
    selection: { kind: 'none' },
    selectedElementId: null,
    selectedElement: null,
    setPlacing: (item) =>
      set({
        selection: { kind: 'placing', menuItem: item },
      }),

    setSelectedElement: (id: string | null) => {
      const element = useGardenStore.getState().present.elements.find(e => e.id === id);
      set({ selectedElementId: id, selectedElement: element ?? null });
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
      })
    },

    setZoneSelection: (zoneId) =>
      set({
        selection: { kind: 'zone', zoneId },
      }),

    clear: () =>
      set({
        selection: { kind: 'none' },
      }),
  }), { name: 'SelectionStore' })
);