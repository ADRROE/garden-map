import { UIAction } from "../services/actions";
import { LayerName } from "../types";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

type Vec2 = { x: number; y: number };

type UIState = {
  scale: number;
  pan: Vec2;
  isMapLocked: boolean;
  showSideBar: boolean;
  isLoading: boolean;
  activeLayers: LayerName[];

  setScale: (scale: number) => void;
  setPan: (pan: Vec2) => void;
  toggleMapLock: () => void;
  toggleSideBar: () => void;
  toggleIsLoading: () => void;

  dispatch: (action: UIAction) => void;
};

export const useUIStore = create<UIState>()(
  devtools(
    (set, get) => ({
      scale: 1,
      pan: { x: 0, y: 0 },
      isMapLocked: true,
      showSideBar: false,
      isLoading: false,
      activeLayers: ["background", "elements", "zones"],

      setScale: (scale) => get().dispatch({ type: 'SET_SCALE', scale }),
      setPan: (pan) => get().dispatch({ type: 'SET_PAN', pan }),
      setActiveLayers: (activeLayers: LayerName[]) => get().dispatch({ type: 'SET_ACTIVE_LAYERS', activeLayers }),
      toggleMapLock: () =>
        set((state) => ({ isMapLocked: !state.isMapLocked })),
      toggleSideBar: () =>
        set((state) => ({ showSideBar: !state.showSideBar })),
      toggleIsLoading: () =>
        set((state) => ({ isLoading: !state.isLoading })),


      dispatch: (action: UIAction) =>
        set((state) => ({
          ...baseReducer(state, action),
        })),
    }),
    { name: "UIStore" }
  )
);

function baseReducer(state: UIState, action: UIAction): Partial<UIState> {
  switch (action.type) {
    case 'SET_SCALE':
      return { scale: action.scale };
    case 'SET_PAN':
      return { pan: action.pan };
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
    case "TOGGLE_SIDEBAR":
      return {
        ...state,
        showSideBar: !state.showSideBar
      };
    case "SHOW_SIDEBAR":
      return {
        ...state,
        showSideBar: true
      };
    case "HIDE_SIDEBAR":
      return {
        ...state,
        showSideBar: false
      };
    default:
      return {};
  }
}