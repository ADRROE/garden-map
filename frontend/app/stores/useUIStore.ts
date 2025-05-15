import { GardenElement } from "@/types";
import { create } from "zustand";
import { useGardenStore } from "./useGardenStore";

type Vec2 = { x: number; y: number };

type UIState = {
  selectedElementId: string | null;
  selectedElement: GardenElement | null;
  scale: number;
  pan: Vec2;
  isMapLocked: boolean;
  isSelectingElement: boolean;
  isSelectingZone: boolean;
  setSelectedElement: (id: string | null) => void;
  setScale: (scale: number) => void;
  setPan: (pan: Vec2) => void;
  toggleMapLock: () => void;
  toggleElementSelectMode: () => void;
  toggleZoneSelectMode: () => void;
};

export const useUIStore = create<UIState>()((set) => ({
  selectedElementId: null,
  selectedElement: null,
  scale: 1,
  pan: { x: 0, y: 0 },
  isMapLocked: true,
  isSelectingElement: false,
  isSelectingZone: false,

  setSelectedElement: (id: string | null) => {
    const element = useGardenStore.getState().present.elements.find(e => e.id === id);
    set({ selectedElementId: id, selectedElement: element ?? null });
  },
  setScale: (scale) => set({ scale }),
  setPan: (pan) => set({ pan }),
  toggleMapLock: () => set((s) => ({ isMapLocked: !s.isMapLocked })),

  toggleElementSelectMode: () =>
    set((s) => ({
      isSelectingElement: !s.isSelectingElement,
      isSelectingZone: false,
    })),

  toggleZoneSelectMode: () =>
    set((s) => ({
      isSelectingZone: !s.isSelectingZone,
      isSelectingElement: false,
    })),
}));