"use client";
import { createContext, useContext, useEffect, useReducer } from "react";
import { GardenElement, MenuElement, UpdateElementFn, UpdateZoneFn, GardenState } from "@/types";
import { GardenAction } from "@/services/actions";
import { createElementAPI, updateElementAPI, deleteElementAPI, } from "@/services/apiService";
import { translatePosition, toColumnLetter, getCoveredCells } from "@/utils/utils";
import { fetchElements, fetchZones, updateZoneAPI } from "@/services/apiService";
import { v4 as uuidv4 } from 'uuid';

function generateUUID() {
  return uuidv4();
}

const initialState: GardenState = {
  elements: [],
  zones: [],
  activeLayer: 'plants',
  coloredCells: {},
  selectedElement: null,
  pendingPosition: null,
  showZones: false,
  isSelectingElement: false,
  isMapLocked: true,
  pan: { x: 0, y: 0 },
  scale: 1,
}

function reducer(state: GardenState, action: GardenAction): GardenState {
  switch (action.type) {
    case 'PLACE_ELEMENT':
      return {
        ...state,
        elements: [...state.elements, action.element],
        pendingPosition: null,
        selectedElement: null,
      };

    case 'UPDATE_ELEMENT':
      return {
        ...state,
        elements: state.elements.map(el =>
          el.id === action.updatedElement.id
            ? { ...el, ...action.updatedElement }
            : el
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
      const next = { ...state.coloredCells };
      delete next[key];
      return { ...state, coloredCells: next };
    }

    case 'SET_ZONES':
      // you probably want to replace the *array* of GardenZone, not the map of cell-strings
      return { ...state, zones: action.zones };

    case 'UPDATE_ZONE':
      return {
        ...state,
        zones: state.zones.map(z =>
          z.id === action.updatedZone.id
            ? { ...z, ...action.updatedZone }
            : z
        ),
      };

    case 'SET_SELECTED_ELEMENT':
      return { ...state, selectedElement: action.element };

    case 'SET_PENDING_POSITION':
      return {
        ...state,
        pendingPosition: {
          pos: {
            x: action.pos!.x,
            y: action.pos!.y,
          },
          subject: action.subject!,
        },
      };

    case 'SET_PAN':
      return { ...state, pan: action.pan };

    case 'SET_SCALE':
      return { ...state, scale: action.scale };

    case 'SET_ELEMENTS':
      return { ...state, elements: action.elements };

    case 'TOGGLE_SHOW_ZONES':
      return { ...state, showZones: !state.showZones };

    case 'TOGGLE_IS_SELECTING_ELEMENT':
      return { ...state, isSelectingElement: !state.isSelectingElement };

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


const GardenContext = createContext<{
  state: GardenState;
  dispatch: React.Dispatch<GardenAction>;
  placeElement: (name: string) => Promise<void>;
  deleteElement: (id: string) => Promise<void>;
  updateElement: UpdateElementFn;
  updateZone: UpdateZoneFn;
  selectElement: (menuElement: MenuElement) => void;
  colorCell: (i: number, j: number, color: string, menuElementId: string) => void;
  uncolorCell: (i: number, j: number) => void;
} | undefined>(undefined);

export function GardenProvider({ children }: { children: React.ReactNode }) {

  const [state, dispatch] = useReducer(reducer, initialState);

  // Function to select an element (sets cursor image)
  const selectElement = (menuElement: MenuElement) => {
    dispatch({ type: 'SET_SELECTED_ELEMENT', element: menuElement });
  };

  // Function to place the element on the map
  const placeElement = async (name: string) => {
    const { pendingPosition, selectedElement } = state;
    if (!pendingPosition || !pendingPosition.pos || pendingPosition.subject !== 'element' || !selectedElement)
      return;

    const x = pendingPosition.pos.x!;
    const y = pendingPosition.pos.y!;
    const width = selectedElement.defaultWidth ?? 40;
    const height = selectedElement.defaultHeight ?? 40;
    const centeredX = x - width / 2;
    const centeredY = y - height / 2;

    const position = translatePosition(centeredX, centeredY);
    const location = `${toColumnLetter(position[0])}${position[1]}`;
    const coverage = getCoveredCells(position[0], position[1], width / 19.5, height / 19.5);

    const newElement: GardenElement = {
      ...selectedElement,
      id: generateUUID(),
      name,
      x: centeredX,
      y: centeredY,
      location,
      width,
      height,
      coverage,
    };

    dispatch({ type: 'PLACE_ELEMENT', element: newElement });

    try {
      await createElementAPI(newElement);
    } catch (error) {
      console.error("Failed to create element on server", error);
      // Optional: rollback dispatch here if needed
    }
  };

  const updateElement: UpdateElementFn = async (updatedElement) => {
    dispatch({ type: 'UPDATE_ELEMENT', updatedElement });
    try {
      await updateElementAPI(updatedElement);
    } catch (error) {
      console.error("Failed to update element on server", error);
    }
  };

  const updateZone: UpdateZoneFn = async (updatedZone) => {
    dispatch({ type: 'UPDATE_ZONE', updatedZone });
    try {
      updateZoneAPI(updatedZone)
        .then(() => fetchZones().then((data) => {
          dispatch({ type: 'SET_ZONES', zones: data })
        }))
    } catch (error) {
      console.error(error);
    }
  };

  const deleteElement = async (id: string) => {
    dispatch({ type: 'DELETE_ELEMENT', id }); // immediate UI update

    try {
      await deleteElementAPI(id); // backend sync
    } catch (error) {
      console.error("Failed to delete element on server", error);
      // Optional: refetch or rollback if desired
    }
  };

  const colorCell = (i: number, j: number, color: string, menuElementId: string) => {
    dispatch({ type: 'COLOR_CELL', i, j, color, menuElementId });
  };

  const uncolorCell = (i: number, j: number) => {
    dispatch({ type: 'COLOR_CELL', i, j, color: "", menuElementId: "" });

  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        dispatch({ type: 'SET_SELECTED_ELEMENT', element: null });;
        document.body.style.cursor = "default";
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, []);

  useEffect(() => {
    fetchElements().then((data) => {
      dispatch({ type: 'SET_ELEMENTS', elements: data });
    });
  }, []);

  useEffect(() => {
    fetchZones().then((data) => {
      dispatch({ type: 'SET_ZONES', zones: data });
    });
  }, []);

  return (
    <GardenContext.Provider value={{
      state,
      dispatch,
      placeElement,
      deleteElement,
      updateElement,
      updateZone,
      selectElement,
      colorCell,
      uncolorCell,
    }}>
      {children}
    </GardenContext.Provider>
  );
};

export const useGarden = () => {
  const context = useContext(GardenContext);
  if (!context) {
    throw new Error("useGarden must be used within a GardenProvider");
  }
  return context;
};
