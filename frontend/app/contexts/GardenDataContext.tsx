// GardenContext.tsx (full updated with undo/redo support)
"use client";
import { createContext, useContext, useEffect, useReducer, ReactNode, useRef } from "react";
import { GardenElement, ElementType, HistoryState, GardenDataState, GardenZone, GardenDataContextType } from "@/types";
import { GardenDataAction } from "@/services/actions";
import { createElementAPI, updateElementAPI, deleteElementAPI, fetchElements, fetchZones, updateZoneAPI } from "@/services/apiService";
import { translatePosition, toColumnLetter, getCoveredCells } from "@/utils/utils";
import { v4 as uuidv4 } from 'uuid';
import isEqual from 'lodash.isequal'

function generateUUID() {
  return uuidv4();
}

const initialState: HistoryState<GardenDataState> = {
  past: [],
  present: {
    elements: [],
    zones: [],
    activeLayers: ['background', 'elements'],
    coloredCells: {},
    selectedElement: null,
    pendingPosition: null,
    isSelectingElement: false,
    isSelectingZone: false,
    isMapLocked: true,
    pan: { x: 0, y: 0 },
    scale: 1,
  },
  future: [],
};

function baseReducer(datastate: GardenDataState, dataaction: GardenDataAction) {
  switch (dataaction.type) {
    case 'CREATE_ELEMENT':
      return {
        ...datastate,
        elements: [...datastate.elements, dataaction.element],
        pendingPosition: null,
        selectedElement: null,
      };

    case 'UPDATE_ELEMENT':
      return {
        ...datastate,
        elements: datastate.elements.map(el =>
          el.id === dataaction.id ? { ...el, ...dataaction.updates } : el
        ),
      };

    case 'DELETE_ELEMENT':
      return {
        ...datastate,
        elements: datastate.elements.filter(el => el.id !== dataaction.id),
      };

    case 'COLOR_CELL': {
      const key = `${dataaction.i}-${dataaction.j}`;
      return {
        ...datastate,
        coloredCells: {
          ...datastate.coloredCells,
          [key]: {
            x: dataaction.i,
            y: dataaction.j,
            color: dataaction.color,
            menuElementId: dataaction.menuElementId,
          },
        },
      };
    }

    case 'UNCOLOR_CELL': {
      const key = `${dataaction.i}-${dataaction.j}`;
      const next = { ...datastate.coloredCells };
      delete next[key];
      return { ...datastate, coloredCells: next };
    }

    case 'SET_ZONES':
      return { ...datastate, zones: dataaction.zones };

    case 'UPDATE_ZONE':
      return {
        ...datastate,
        zones: datastate.zones.map(z => z.id === dataaction.updatedZone.id ? { ...z, ...dataaction.updatedZone } : z),
      };

    case 'SET_SELECTED_ELEMENT':
      return { ...datastate, selectedElement: dataaction.element };

    case 'SET_PENDING_POSITION':
      return {
        ...datastate,
        pendingPosition: dataaction.pos && dataaction.subject ? { pos: dataaction.pos, subject: dataaction.subject } : null,
      };

    case 'SET_PAN':
      return { ...datastate, pan: dataaction.pan };

    case 'SET_SCALE':
      return { ...datastate, scale: dataaction.scale };

    case 'SET_ELEMENTS':
      return { ...datastate, elements: dataaction.elements };

    case 'TOGGLE_IS_SELECTING_ELEMENT':
      return { ...datastate, isSelectingElement: !datastate.isSelectingElement, isSelectingZone: false };

    case 'TOGGLE_IS_SELECTING_ZONE':
      return { ...datastate, isSelectingZone: !datastate.isSelectingZone, isSelectingElement: false };

    case 'TOGGLE_MAP_LOCK':
      return {
        ...datastate,
        isMapLocked: !datastate.isMapLocked,
        selectedElement: null,
      };

    default:
      return datastate;
  }
}

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

export function undoable<T>(
  reducer: (state: T, action: GardenDataAction) => T
): (state: HistoryState<T>, action: GardenDataAction) => HistoryState<T> {
  return function (
    state: HistoryState<T>,
    action: GardenDataAction
  ): HistoryState<T> {
    const { past, present, future } = state;

    switch (action.type) {
      case 'UNDO':
        if (past.length === 0) return state;
        const previous = past[past.length - 1];
        return {
          past: past.slice(0, -1),
          present: previous,
          future: [present, ...future],
        };

      case 'REDO':
        if (future.length === 0) return state;
        const next = future[0];
        return {
          past: [...past, present],
          present: next,
          future: future.slice(1),
        };

      default: {
        const newPresent = reducer(present, action);

        // Skip history tracking for transient UI state (unless explicitly wanted)
        if (!undoableActions.has(action.type)) {
          return {
            past,
            present: newPresent,
            future,
          };
        }

        // Skip if there's no meaningful change
        if (isEqual(present, newPresent)) {
          return state;
        }

        return {
          past: [...past, present],
          present: newPresent,
          future: [],
        };
      }
    }
  };
}

const GardenDataContext = createContext<GardenDataContextType | null>(null);

export function GardenDataProvider({ children }: { children: ReactNode }) {

  const [historyState, datadispatch] = useReducer(
    undoable(baseReducer),
    initialState
  );

  const selectedElementRef = useRef<ElementType | null>(null);

  const selectElement = (element: ElementType | null) => {
    selectedElementRef.current = element;
    datadispatch({ type: 'SET_SELECTED_ELEMENT', element });
  };

  const placeElement = async (name: string): Promise<void> => {
    const { pendingPosition } = historyState.present;
    const selectedElement = selectedElementRef.current;

    if (!pendingPosition || !pendingPosition.pos || pendingPosition.subject !== 'element' || !selectedElement) return;

    const { x, y } = pendingPosition.pos;
    const width = selectedElement.defaultWidth ?? 40;
    const height = selectedElement.defaultHeight ?? 40;
    const centeredX = x! - width / 2;
    const centeredY = y! - height / 2;

    const position = translatePosition(centeredX, centeredY);
    const location = `${toColumnLetter(position[0])}${position[1]}`;
    const coverage = getCoveredCells(position[0], position[1], width / 19.5, height / 19.5);

    const newElement = {
      ...selectedElement,
      menuElementId: selectedElement.id,
      id: generateUUID(),
      name,
      x: centeredX,
      y: centeredY,
      location,
      width,
      height,
      coverage,
    };

    datadispatch({ type: 'CREATE_ELEMENT', element: newElement });

    try {
      console.log(`Called createElementAPI with ${newElement}`)
      await createElementAPI(newElement);
    } catch (error) {
      console.error("Failed to create element on server", error);
    } finally {
      const newElements = await fetchElements();
      datadispatch({ type: 'SET_ELEMENTS', elements: newElements });
    }
  };

  const updateElement = async (updatedElement: { id: string } & Partial<GardenElement>) => {
    const { id, ...updates } = updatedElement;
    datadispatch({ type: 'UPDATE_ELEMENT', id, updates }); // ✅ This matches the expected shape
    try {
      await updateElementAPI(updatedElement);
    } catch (error) {
      console.error("Failed to update element on server", error);
    }
  };

  const updateZone = async (updatedZone: GardenZone) => {
    datadispatch({ type: 'UPDATE_ZONE', updatedZone });
    try {
      await updateZoneAPI(updatedZone);
      const zones = await fetchZones();
      datadispatch({ type: 'SET_ZONES', zones });
    } catch (error) {
      console.error(error);
    }
  };

  const deleteElement = async (id: string) => {
    datadispatch({ type: 'DELETE_ELEMENT', id });
    try {
      await deleteElementAPI(id);
    } catch (error) {
      console.error("Failed to delete element on server", error);
    }
  };

  const colorCell = (i: number, j: number, color: string, menuElementId: string) => {
    datadispatch({ type: 'COLOR_CELL', i, j, color, menuElementId });
  };

  const uncolorCell = (i: number, j: number) => {
    datadispatch({ type: 'UNCOLOR_CELL', i, j });
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        datadispatch({ type: 'SET_SELECTED_ELEMENT', element: null });
        document.body.style.cursor = "default";
      } else if (event.ctrlKey && event.key === 'z') {
        datadispatch({ type: 'UNDO' });
      } else if (event.ctrlKey && event.key === 'y') {
        datadispatch({ type: 'REDO' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    fetchElements().then(elements => datadispatch({ type: 'SET_ELEMENTS', elements }));
    fetchZones().then(zones => datadispatch({ type: 'SET_ZONES', zones }));
  }, []);

  return (
    <GardenDataContext.Provider value={{
      datastate: historyState.present,
      datadispatch,
      placeElement,
      deleteElement,
      updateElement,
      updateZone,
      selectElement,
      colorCell,
      uncolorCell,
    }}>
      {children}
    </GardenDataContext.Provider>
  );
}

export const useGardenData = () => {
  const context = useContext(GardenDataContext);
  if (!context) throw new Error("useGardenData must be used within GardenDataProvider");
  return context;
};
