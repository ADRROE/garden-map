// useGardenStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import isEqual from 'lodash.isequal';
import {
  GardenElementObject,
  GardenZone,
  GardenDataState,
  HistoryState,
  Cell,
  GardenZoneObject,
} from '@/types';
import {
  updateElementAPI,
  deleteElementAPI,
  fetchZones,
  updateZoneAPI,
} from '@/services/apiService';
import { log, error } from '@/utils/utils';

type GardenActions = {
  undo: () => void;
  redo: () => void;
  dispatch: (action: GardenDataAction) => void;
  createElement: (element: GardenElementObject) => void;
  deleteElement: (id: string) => Promise<void>;
  updateElement: (update: { id: string } & Partial<GardenElementObject>, record: 'create' | 'modify') => Promise<void>;
  updateZone: (updatedZone: GardenZone, record: 'create' | 'modify') => Promise<void>;
};

type GardenStore = HistoryState<GardenDataState> & GardenActions;

const initialPresent: GardenDataState = {
  elements: [],
  zones: [],
  zoneObjects: [],
  cells: {},
};

export type GardenDataAction =
    | { type: 'CREATE_ELEMENT'; element: GardenElementObject }
    | { type: 'UPDATE_ELEMENT'; id: string; updates: Partial<GardenElementObject>; record: 'create' | 'modify' }
    | { type: 'DELETE_ELEMENT'; id: string }
    | { type: 'UPDATE_ZONE'; updatedZone: { id: string } & Partial<GardenZone>; record: 'create' | 'modify' }
    | { type: 'SET_ELEMENTS'; elements: GardenElementObject[] }
    | { type: 'SET_ZONES'; zones: GardenZone[] }
    | { type: 'SET_ZONE_OBJECTS'; zoneObjects: GardenZoneObject[] }
    | { type: 'SET_COLORED_CELLS'; cells: Record<string, Cell> }
    | { type: 'TOGGLE_MAP_LOCK' }
    | { type: 'UNDO' }
    | { type: 'REDO' }

const undoableActions = new Set<GardenDataAction['type']>([
  'CREATE_ELEMENT',
  'UPDATE_ELEMENT',
  'DELETE_ELEMENT',
  'UPDATE_ZONE',
  'SET_ELEMENTS',
  'SET_ZONES',
  'SET_ZONE_OBJECTS',
  'SET_COLORED_CELLS',
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

    updateElement: async (update, record) => {
      console.log("TRIGGERED UPDATE WITH: ", update);
      get().dispatch({ type: 'UPDATE_ELEMENT', id: update.id, updates: update, record: record });
      try {
        await updateElementAPI(update, record);
      } catch (err) {
        error('Failed to update element:', err);
      }
    },

    deleteElement: async (id) => {
      get().dispatch({ type: 'DELETE_ELEMENT', id });
      try {
        await deleteElementAPI(id);
      } catch (err) {
        error('Failed to delete element:', err);
      }
    },

    updateZone: async (updatedZone, record) => {
      get().dispatch({ type: 'UPDATE_ZONE', updatedZone, record });
      try {
        await updateZoneAPI(updatedZone, record);
        const zones = await fetchZones();
        get().dispatch({ type: 'SET_ZONES', zones });
      } catch (err) {
        error('Failed to update zone:', err);
      }
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

    case 'UPDATE_ZONE':
      return {
        ...state,
        zones: state.zones.map(z =>
          z.id === action.updatedZone.id ? { ...z, ...action.updatedZone } : z
        ),
      };

    case 'SET_ZONES':
      return { ...state, zones: action.zones };
    
        case 'SET_ZONE_OBJECTS':
      return { ...state, zoneObjects: action.zoneObjects };

    case 'SET_ELEMENTS':
      return { ...state, elements: action.elements };
    
    case "SET_COLORED_CELLS":
        log("16 - Reducer received coloredCells:", action.cells);

      return { ...state, cells: {
          ...state.cells,
          ...action.cells,
        }};

    default:
      return state;
  }
}