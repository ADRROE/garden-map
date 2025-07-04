'use client'
import { LayerName } from "../types";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

type UIState = {
  isMapLocked: boolean;
  isLoading: boolean;
  activeLayers: LayerName[];
  cursor: string;

  setIsLoading: (value: boolean) => void;
  toggleMapLock: () => void;

  dispatch: (action: UIAction) => void;
};

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set, get) => ({
        isMapLocked: false,
        isLoading: true,
        activeLayers: ["background", "zones", "items"],
        cursor: "default",

        setActiveLayers: (activeLayers: LayerName[]) => get().dispatch({ type: 'SET_ACTIVE_LAYERS', activeLayers }),

        setIsLoading: (value) => set((state) => ({ ...state, isLoading: value }), false, 'setIsLoading'),
        
        toggleMapLock: () =>
          set((state) => ({ isMapLocked: !state.isMapLocked }), false, 'toggleMapLock'),

        dispatch: (action: UIAction) =>
          set((state) => baseReducer(state, action), false, action.type ),
      }),
      {
        name: "UIStorage",
      }
    ),
    { name: "UIStore" }
  )
);

export type UIAction =
  | { type: 'TOGGLE_LAYER'; layer: LayerName }
  | { type: 'SHOW_LAYER'; layer: LayerName }
  | { type: 'HIDE_LAYER'; layer: LayerName }
  | { type: 'SET_ACTIVE_LAYERS'; activeLayers: LayerName[] }
  | { type: 'SET_CURSOR'; cursor: string }
  | { type: 'SET_MAP_LOCK'; value: boolean }

function baseReducer(state: UIState, action: UIAction): Partial<UIState> {
  switch (action.type) {
    case "TOGGLE_LAYER":
      return {
        activeLayers: state.activeLayers.includes(action.layer)
          ? state.activeLayers.filter((l) => l !== action.layer)
          : [...state.activeLayers, action.layer],
      };
    case "SHOW_LAYER":
      return {
        activeLayers: state.activeLayers.includes(action.layer)
          ? state.activeLayers
          : [...state.activeLayers, action.layer],
      };
    case "HIDE_LAYER":
      return {
        activeLayers: state.activeLayers.filter((l) => l !== action.layer),
      };
    case "SET_ACTIVE_LAYERS":
      return {
        activeLayers: [...action.activeLayers],
      };
    case "SET_CURSOR":
      return {
        ...state,
        cursor: action.cursor
      };
    case "SET_MAP_LOCK":
      return {
        ...state,
        isMapLocked: action.value
      }
    default:
      return {};
  }
}