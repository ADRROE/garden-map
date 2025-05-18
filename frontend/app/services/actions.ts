import { ElementType, Vec2 } from "@/types";
import { GardenElement, GardenZone, LayerName } from "../types";

export type GardenDataAction =
    | { type: 'CREATE_ELEMENT'; element: GardenElement }
    | { type: 'UPDATE_ELEMENT'; id: string; updates: Partial<GardenElement> }
    | { type: 'DELETE_ELEMENT'; id: string }
    | { type: 'UPDATE_ZONE'; updatedZone: { id: string } & Partial<GardenZone> }
    | { type: 'COLOR_CELL'; i: number; j: number; color: string; menuElementId: string }
    | { type: 'UNCOLOR_CELL'; i: number; j: number }
    | { type: 'SET_SELECTED_ELEMENT'; element: ElementType | null }
    | { type: 'SET_PENDING_POSITION'; pos: Vec2 | null}
    | { type: 'SET_PAN'; pan: { x: number; y: number } }
    | { type: 'SET_SCALE'; scale: number }
    | { type: 'SET_ELEMENTS'; elements: GardenElement[] }
    | { type: 'SET_ZONES'; zones: GardenZone[] }
    | { type: 'TOGGLE_IS_SELECTING_ELEMENT' }
    | { type: 'TOGGLE_IS_SELECTING_ZONE' }
    | { type: 'TOGGLE_MAP_LOCK' }
    | { type: 'UNDO' }
    | { type: 'REDO' }

export type GardenLayerAction =
    | { type: 'TOGGLE_LAYER'; layer: LayerName }
    | { type: 'SHOW_LAYER'; layer: LayerName }
    | { type: 'HIDE_LAYER'; layer: LayerName }
    | { type: 'SET_VISIBLE_LAYERS'; layers: LayerName[] };

