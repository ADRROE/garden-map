// stores/useGardenStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { baseReducer } from '@/stores/gardenReducer';
import { GardenDataAction } from '@/services/actions';
import { GardenDataState } from '@/types';
import isEqual from 'lodash.isequal';

// Optional: extract this if you want undo in its own store
type HistoryState<T> = {
  past: T[];
  present: T;
  future: T[];
};

interface GardenStore extends HistoryState<GardenDataState> {
  dispatch: (action: GardenDataAction) => void;
  undo: () => void;
  redo: () => void;
}

const initialState: GardenDataState = {
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
    present: initialState,
    future: [],

    dispatch: (action) => {
      const { present, past } = get();
      const next = baseReducer(present, action);
      const isUndoable = undoableActions.has(action.type);
      const isChanged = !isEqual(next, present);

      if (!isChanged) return;

      if (isUndoable) {
        set({
          past: [...past, present],
          present: next,
          future: [],
        });
      } else {
        set({ present: next });
      }
    },

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
  }))
);