// useGardenStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import isEqual from 'lodash.isequal';
import {
  GardenElement,
  GardenZone,
  GardenDataState,
  HistoryState,
} from '@/types';
import { GardenDataAction } from '@/services/actions';
import {
  updateElementAPI,
  deleteElementAPI,
  fetchZones,
  updateZoneAPI,
} from '@/services/apiService';

type GardenActions = {
  undo: () => void;
  redo: () => void;
  dispatch: (action: GardenDataAction) => void;
  createElement: (element: GardenElement) => void;
  deleteElement: (id: string) => Promise<void>;
  updateElement: (update: { id: string } & Partial<GardenElement>) => Promise<void>;
  updateZone: (updatedZone: GardenZone) => Promise<void>;
  colorCell: (i: number, j: number, color: string, menuElementId: string) => void;
  uncolorCell: (i: number, j: number) => void;
};

type GardenStore = HistoryState<GardenDataState> & GardenActions;

const initialPresent: GardenDataState = {
  elements: [],
  zones: [],
  activeLayers: ['background', 'elements'],
  coloredCells: {},
};

const undoableActions = new Set<GardenDataAction['type']>([
  'CREATE_ELEMENT',
  'UPDATE_ELEMENT',
  'DELETE_ELEMENT',
  'COLOR_CELL',
  'UNCOLOR_CELL',
  'UPDATE_ZONE',
  'SET_ELEMENTS',
  'SET_ZONES',
  'TOGGLE_MAP_LOCK',
]);

export const useGardenStore = create<GardenStore>()(
  devtools((set, get) => ({
    past: [],
    present: initialPresent,
    future: [],

    undo: () => {
      const { past, present, future } = get();
      if (past.length === 0) return;
      const previous = past[past.length - 1];
      set({
        past: past.slice(0, -1),
        present: previous,
        future: [present, ...future],
      });
    },

    redo: () => {
      const { past, present, future } = get();
      if (future.length === 0) return;
      const next = future[0];
      set({
        past: [...past, present],
        present: next,
        future: future.slice(1),
      });
    },

    dispatch: (action) => {
      const { present, past } = get();
      const next = baseReducer(present, action);

      const isUndoable = undoableActions.has(action.type);
      const isChanged = !isEqual(next, present);

      if (!isUndoable || !isChanged) {
        set({ present: next });
        return;
      }

      set({
        past: [...past, present],
        present: next,
        future: [],
      });
    },

    createElement: (element) => {
      get().dispatch({ type: 'CREATE_ELEMENT', element });
    },

    updateElement: async (update) => {
      get().dispatch({ type: 'UPDATE_ELEMENT', id: update.id, updates: update });
      try {
        await updateElementAPI(update);
      } catch (error) {
        console.error('Failed to update element:', error);
      }
    },

    deleteElement: async (id) => {
      get().dispatch({ type: 'DELETE_ELEMENT', id });
      try {
        await deleteElementAPI(id);
      } catch (error) {
        console.error('Failed to delete element:', error);
      }
    },

    updateZone: async (updatedZone) => {
      get().dispatch({ type: 'UPDATE_ZONE', updatedZone });
      try {
        await updateZoneAPI(updatedZone);
        const zones = await fetchZones();
        get().dispatch({ type: 'SET_ZONES', zones });
      } catch (error) {
        console.error('Failed to update zone:', error);
      }
    },

    colorCell: (i, j, color, menuElementId) => {
      get().dispatch({ type: 'COLOR_CELL', i, j, color, menuElementId });
    },

    uncolorCell: (i, j) => {
      get().dispatch({ type: 'UNCOLOR_CELL', i, j });
    },
  }),     {
      name: 'GardenStore', 
    })
);

function baseReducer(state: GardenDataState, action: GardenDataAction): GardenDataState {
  switch (action.type) {
    case 'CREATE_ELEMENT':
      return {
        ...state,
        elements: [...state.elements, action.element],
      };

    case 'UPDATE_ELEMENT':
      return {
        ...state,
        elements: state.elements.map(el =>
          el.id === action.id ? { ...el, ...action.updates } : el
        ),
      };

    case 'DELETE_ELEMENT':
      return {
        ...state,
        elements: state.elements.filter(el => el.id !== action.id),
      };

    case 'COLOR_CELL': {
      const key = `${action.i}-${action.j}`;
      return {
        ...state,
        coloredCells: {
          ...state.coloredCells,
          [key]: {
            x: action.i,
            y: action.j,
            color: action.color,
            menuElementId: action.menuElementId,
          },
        },
      };
    }

    case 'UNCOLOR_CELL': {
      const key = `${action.i}-${action.j}`;
      const updated = { ...state.coloredCells };
      delete updated[key];
      return { ...state, coloredCells: updated };
    }

    case 'UPDATE_ZONE':
      return {
        ...state,
        zones: state.zones.map(z =>
          z.id === action.updatedZone.id ? { ...z, ...action.updatedZone } : z
        ),
      };

    case 'SET_ZONES':
      return { ...state, zones: action.zones };

    case 'SET_ELEMENTS':
      return { ...state, elements: action.elements };

    default:
      return state;
  }
}