// useGardenStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import isEqual from 'lodash.isequal';
import {
  GardenElement,
  GardenZone,
  ElementType,
  GardenDataState,
  HistoryState,
  Vec2,
} from '@/types';
import { GardenDataAction } from '@/services/actions';
import {
  createElementAPI,
  updateElementAPI,
  deleteElementAPI,
  fetchElements,
  fetchZones,
  updateZoneAPI,
} from '@/services/apiService';
import { translatePosition, toColumnLetter, getCoveredCells } from '@/utils/utils';

type GardenActions = {
  undo: () => void;
  redo: () => void;
  dispatch: (action: GardenDataAction) => void;
  placeElement: (name: string) => Promise<void>;
  deleteElement: (id: string) => Promise<void>;
  updateElement: (update: { id: string } & Partial<GardenElement>) => Promise<void>;
  updateZone: (updatedZone: GardenZone) => Promise<void>;
  colorCell: (i: number, j: number, color: string, menuElementId: string) => void;
  uncolorCell: (i: number, j: number) => void;
  selectElement: (element: ElementType | null) => void;
  setPendingPosition: (pos: Vec2 | null, subject: 'element' | 'zone' | null) => void;
};

type GardenStore = HistoryState<GardenDataState> & GardenActions & {
  selectedElementRef: ElementType | null;
};

const initialPresent: GardenDataState = {
  elements: [],
  zones: [],
  activeLayers: ['background', 'elements'],
  coloredCells: {},
  selectedElement: null,
  pendingPosition: null,
};

const undoableActions = new Set([
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
    selectedElementRef: null,

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

    dispatch: (action: GardenDataAction) => {
      const { present, past, future } = get();
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

    selectElement: (element) => {
      set({ selectedElementRef: element });
      get().dispatch({ type: 'SET_SELECTED_ELEMENT', element });
    },

    setPendingPosition: (pos, subject) => {
      get().dispatch({
        type: 'SET_PENDING_POSITION',
        pos,
        subject,
      });
    },

    placeElement: async (name: string) => {
      const { present, selectedElementRef } = get();
      if (!present.pendingPosition) return
      const pending = present.pendingPosition;

      if (!pending.pos || !selectedElementRef || pending.subject !== 'element') return;

      const { x, y }: Vec2 = pending.pos;
      const width = selectedElementRef.defaultWidth ?? 40;
      const height = selectedElementRef.defaultHeight ?? 40;
      const centeredX = x - width / 2;
      const centeredY = y - height / 2;

      const position = translatePosition(centeredX, centeredY);
      const location = `${toColumnLetter(position[0])}${position[1]}`;
      const coverage = getCoveredCells(position[0], position[1], width / 19.5, height / 19.5);

      const newElement: GardenElement = {
        ...selectedElementRef,
        menuElementId: selectedElementRef.id,
        id: uuidv4(),
        name,
        x: centeredX,
        y: centeredY,
        location,
        width,
        height,
        coverage,
      };

      get().dispatch({ type: 'CREATE_ELEMENT', element: newElement });

      try {
        await createElementAPI(newElement);
      } finally {
        const newElements = await fetchElements();
        get().dispatch({ type: 'SET_ELEMENTS', elements: newElements });
      }
    },

    updateElement: async (update) => {
      get().dispatch({ type: 'UPDATE_ELEMENT', id: update.id, updates: update });
      try {
        await updateElementAPI(update);
      } catch (e) {
        console.error("Update failed", e);
      }
    },

    deleteElement: async (id) => {
      get().dispatch({ type: 'DELETE_ELEMENT', id });
      try {
        await deleteElementAPI(id);
      } catch (e) {
        console.error("Delete failed", e);
      }
    },

    updateZone: async (zone) => {
      get().dispatch({ type: 'UPDATE_ZONE', updatedZone: zone });
      try {
        await updateZoneAPI(zone);
        const zones = await fetchZones();
        get().dispatch({ type: 'SET_ZONES', zones });
      } catch (e) {
        console.error(e);
      }
    },

    colorCell: (i, j, color, menuElementId) => {
      get().dispatch({ type: 'COLOR_CELL', i, j, color, menuElementId });
    },

    uncolorCell: (i, j) => {
      get().dispatch({ type: 'UNCOLOR_CELL', i, j });
    },
  }))
);

// Reducer logic reused from context
function baseReducer(state: GardenDataState, action: GardenDataAction): GardenDataState {
  switch (action.type) {
    case 'CREATE_ELEMENT':
      return {
        ...state,
        elements: [...state.elements, action.element],
        pendingPosition: null,
        selectedElement: null,
      };
    case 'UPDATE_ELEMENT':
      return {
        ...state,
        elements: state.elements.map(el => el.id === action.id ? { ...el, ...action.updates } : el),
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
      const next = { ...state.coloredCells };
      delete next[key];
      return { ...state, coloredCells: next };
    }
    case 'SET_ZONES':
      return { ...state, zones: action.zones };
    case 'UPDATE_ZONE':
      return {
        ...state,
        zones: state.zones.map(z => z.id === action.updatedZone.id ? { ...z, ...action.updatedZone } : z),
      };
    case 'SET_SELECTED_ELEMENT':
      return { ...state, selectedElement: action.element };
    case 'SET_PENDING_POSITION':
      return {
        ...state,
        pendingPosition: action.pos && action.subject ? { pos: action.pos, subject: action.subject } : null,
      };
    case 'SET_PAN':
      return { ...state, pan: action.pan };
    case 'SET_SCALE':
      return { ...state, scale: action.scale };
    case 'SET_ELEMENTS':
      return { ...state, elements: action.elements };
    case 'TOGGLE_IS_SELECTING_ELEMENT':
      return { ...state, isSelectingElement: !state.isSelectingElement, isSelectingZone: false };
    case 'TOGGLE_IS_SELECTING_ZONE':
      return { ...state, isSelectingZone: !state.isSelectingZone, isSelectingElement: false };
    case 'TOGGLE_MAP_LOCK':
      return {
        ...state,
        isMapLocked: !state.isMapLocked,
        selectedElement: null,
      };
    default:
      return state;
  }
}
