import { UIAction } from "../services/actions";
import { LayerName } from "../types";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

type Vec2 = { x: number; y: number };

type UIState = {
  scale: number;
  pan: Vec2;
  isMapLocked: boolean;
  activeLayers: LayerName[];

  setScale: (scale: number) => void;
  setPan: (pan: Vec2) => void;
  toggleMapLock: () => void;

  dispatch: (action: UIAction) => void;
};

export const useUIStore = create<UIState>()(
  devtools(
    (set, get) => ({
      scale: 1,
      pan: { x: 0, y: 0 },
      isMapLocked: true,
      activeLayers: ["background", "elements"],

      setScale: (scale) => get().dispatch({ type: 'SET_SCALE', scale }),
      setPan: (pan) => get().dispatch({ type: 'SET_PAN', pan }),
      setActiveLayers: (activeLayers: LayerName[]) => get().dispatch({type: 'SET_ACTIVE_LAYERS', activeLayers}),
      toggleMapLock: () =>
        set((state) => ({ isMapLocked: !state.isMapLocked })),

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
    default:
      return {};
  }
}