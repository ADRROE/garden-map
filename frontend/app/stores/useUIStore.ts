import { create } from "zustand";
import { devtools } from 'zustand/middleware';

type Vec2 = { x: number; y: number };

type UIState = {
  scale: number;
  pan: Vec2;
  isMapLocked: boolean;
  setScale: (scale: number) => void;
  setPan: (pan: Vec2) => void;
  toggleMapLock: () => void;
};

export const useUIStore = create<UIState>()(devtools((set) => ({
  scale: 1,
  pan: { x: 0, y: 0 },
  isMapLocked: true,
  setScale: (scale) => set({ scale }),
  setPan: (pan) => set({ pan }),
  toggleMapLock: () => set((s) => ({ isMapLocked: !s.isMapLocked }))
}), { name: 'UIStore' }));