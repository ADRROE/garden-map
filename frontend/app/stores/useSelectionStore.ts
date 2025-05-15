// useSelectionStore.ts
import { create } from 'zustand';
import { SelectionState } from './SelectionState';
import { MenuElement, GardenElement } from '@/types'

type SelectionStore = {
  selection: SelectionState;
  setPlacing: (item: MenuElement) => void;
  setEditing: (item: GardenElement) => void;
  setZoneSelection: (zoneId: string) => void;
  clear: () => void;
  isPlacing: boolean;
  isEditing: boolean;
  isZoneSelected: boolean;
};

export const useSelectionStore = create<SelectionStore>((set, get) => ({
  selection: { kind: 'none' },

  setPlacing: (item) => set({ selection: { kind: 'placing', menuItem: item } }),
  setEditing: (element) => set({ selection: { kind: 'editing', element } }),
  setZoneSelection: (zoneId) => set({ selection: { kind: 'zone', zoneId } }),
  clear: () => set({ selection: { kind: 'none' } }),

  get isPlacing() {
    return get().selection.kind === 'placing';
  },
  get isEditing() {
    return get().selection.kind === 'editing';
  },
  get isZoneSelected() {
    return get().selection.kind === 'zone';
  },
}));
