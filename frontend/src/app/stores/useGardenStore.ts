// useGardenStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import isEqual from 'lodash.isequal';
import {
  GardenItem,
  GardenZone,
  HistoryState,
  Cell,
} from '@/types';
import {
  updateItemAPI,
  deleteItemAPI,
  fetchZones,
  updateZoneAPI,
} from '@/services/apiService';
import { log, error } from '@/utils/utils';

interface GardenDataState {
  items: GardenItem[];
  zones: GardenZone[];
  cells: Record<string, Cell>;
}

type GardenActions = {
  undo: () => void;
  redo: () => void;
  dispatch: (action: GardenDataAction) => void;
  createItem: (item: GardenItem) => void;
  deleteItem: (id: string) => Promise<void>;
  updateItem: (
    id: string,
    updates: Partial<GardenItem>,
    record: 'create' | 'modify'
  ) => Promise<void>;
  updateItemLocally: (id: string, updates: Partial<GardenItem>) => void;
  updateZone: (
    id: string,
    updates: Partial<GardenZone>,
    record: 'create' | 'modify'
  ) => Promise<void>;
  updateZoneLocally: (id: string, updates: Partial<GardenZone>) => void;
};

type GardenStore = HistoryState<GardenDataState> & GardenActions;

const initialPresent: GardenDataState = {
  items: [],
  zones: [],
  cells: {},
};

export type GardenDataAction =
  | { type: 'CREATE_ITEM'; item: GardenItem }
  | {
      type: 'UPDATE_ITEM';
      id: string;
      updates: Partial<GardenItem>;
      record: 'create' | 'modify';
    }
  | { type: 'DELETE_ITEM'; id: string }
  | { type: 'SET_ITEMS'; items: GardenItem[] }
  | {
      type: 'UPDATE_ZONE';
      id: string;
      updates: Partial<GardenZone>;
      record: 'create' | 'modify';
    }
  | { type: 'SET_ZONES'; zones: GardenZone[] }
  | { type: 'SET_COLORED_CELLS'; cells: Record<string, Cell> }
  | { type: 'TOGGLE_MAP_LOCK' }
  | { type: 'UNDO' }
  | { type: 'REDO' };

const undoableActions = new Set<GardenDataAction['type']>([
  'CREATE_ITEM',
  'UPDATE_ITEM',
  'DELETE_ITEM',
  'UPDATE_ZONE',
  'SET_ITEMS',
  'SET_ZONES',
  'SET_COLORED_CELLS',
]);

export const useGardenStore = create<GardenStore>()(
  devtools(
    persist(
      (set, get) => ({
        past: [],
        present: initialPresent,
        future: [],

        undo: () => {
          const { past, present, future } = get();
          if (past.length === 0) return;
          const previous = past[past.length - 1];
          set(
            {
              past: past.slice(0, -1),
              present: previous,
              future: [present, ...future],
            },
            false,
            'undo'
          );
        },

        redo: () => {
          const { past, present, future } = get();
          if (future.length === 0) return;
          const next = future[0];
          set(
            {
              past: [...past, present],
              present: next,
              future: future.slice(1),
            },
            false,
            'redo'
          );
        },

        dispatch: (action) => {
          const { present, past } = get();
          const next = baseReducer(present, action);

          const isUndoable = undoableActions.has(action.type);
          const isChanged = !isEqual(next, present);

          if (!isUndoable || !isChanged) {
            set({ present: next }, false, action.type);
            return;
          }

          set(
            {
              past: [...past, present],
              present: next,
              future: [],
            },
            false,
            action.type
          );
        },

        createItem: (item) => {
          get().dispatch({ type: 'CREATE_ITEM', item });
        },

        updateItem: async (
          id: string,
          updates: Partial<GardenItem>,
          record: 'create' | 'modify'
        ) => {
          if (!updates.id) throw new Error('ID is required but was undefined.');
          get().dispatch({ type: 'UPDATE_ITEM', id, updates, record });
          try {
            await updateItemAPI(id, updates, record);
          } catch (err) {
            error('Failed to update item:', err);
          }
        },

        updateItemLocally: (id: string, updates: Partial<GardenItem>) =>
          set(
            (state) => ({
              present: {
                ...state.present,
                items: state.present.items.map((item) =>
                  item.id === id ? { ...item, ...updates } : item
                ),
              },
            }),
            false,
            'updateItemLocally'
          ),

        deleteItem: async (id) => {
          get().dispatch({ type: 'DELETE_ITEM', id });
          try {
            await deleteItemAPI(id);
          } catch (err) {
            error('Failed to delete item:', err);
          }
        },

        updateZone: async (
          id: string,
          updates: Partial<GardenZone>,
          record: 'create' | 'modify'
        ) => {
          if (!updates.id) throw new Error('ID is required but was undefined.');

          get().dispatch({ type: 'UPDATE_ZONE', id, updates, record });
          try {
            await updateZoneAPI(id, updates, record);
            const zones = await fetchZones();
            get().dispatch({ type: 'SET_ZONES', zones });
          } catch (err) {
            error('Failed to update zone:', err);
          }
        },

        updateZoneLocally: (id: string, updates: Partial<GardenZone>) =>
          set(
            (state) => ({
              present: {
                ...state.present,
                zones: state.present.zones.map((zone) =>
                  zone.id === id ? { ...zone, ...updates } : zone
                ),
              },
            }),
            false,
            'updateZoneLocally'
          ),
      }),
      {
        name: 'GardenStorage',
      }
    ),
    { name: 'GardenStore' } // <- what appears in Redux DevTools
  )
);

function baseReducer(state: GardenDataState, action: GardenDataAction): GardenDataState {
  switch (action.type) {
    case 'CREATE_ITEM':
      return {
        ...state,
        items: [...state.items, action.item],
      };

    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map((el) =>
          el.id === action.id ? { ...el, ...action.updates } : el
        ),
      };

    case 'DELETE_ITEM':
      return {
        ...state,
        items: state.items.filter((el) => el.id !== action.id),
      };

    case 'UPDATE_ZONE':
      return {
        ...state,
        zones: state.zones.map((z) =>
          z.id === action.id ? { ...z, ...action.updates } : z
        ),
      };

    case 'SET_ZONES':
      return {
        ...state,
        zones: action.zones.map((zone) => ({ ...zone, kind: 'GardenZone' })),
      };

    case 'SET_ITEMS':
      return {
        ...state,
        items: action.items.map((item) => ({ ...item, kind: 'GardenItem' })),
      };

    case 'SET_COLORED_CELLS':
      log('16 - Reducer received coloredCells:', action.cells);
      return {
        ...state,
        cells: {
          ...state.cells,
          ...action.cells,
        },
      };

    default:
      return state;
  }
}
