import { GardenElement, MenuElement, GardenZone } from "../types";

export type GardenAction =
    | { type: 'PLACE_ELEMENT'; element: GardenElement }
    | { type: 'UPDATE_ELEMENT'; updatedElement: { id: string } & Partial<GardenElement> }
    | { type: 'DELETE_ELEMENT'; id: string }
    | { type: 'UPDATE_ZONE'; updatedZone: { id: string } & Partial<GardenZone> }
    | { type: 'COLOR_CELL'; i: number; j: number; color: string; menuElementId: string }
    | { type: 'UNCOLOR_CELL'; i: number; j: number }
    | { type: 'SET_SELECTED_ELEMENT'; element: MenuElement | null }
    | { type: 'SET_PENDING_POSITION'; pos:{x?: number, y?: number} | null; subject: "element" | "zone" | null}
    | { type: 'SET_PAN'; pan: { x: number; y: number } }
    | { type: 'SET_SCALE'; scale: number }
    | { type: 'SET_ELEMENTS'; elements: GardenElement[] }
    | { type: 'SET_ZONES'; zones: GardenZone[] }
    | { type: 'TOGGLE_SHOW_ZONES' }
    | { type: 'TOGGLE_IS_SELECTING_ELEMENT' }
    | { type: 'TOGGLE_MAP_LOCK' }

