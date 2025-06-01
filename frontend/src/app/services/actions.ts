import { ColoredCell, ElementType, Vec2 } from "../types";
import { GardenElement, GardenZone, LayerName } from "../types";

export type GardenDataAction =
    | { type: 'CREATE_ELEMENT'; element: GardenElement }
    | { type: 'UPDATE_ELEMENT'; id: string; updates: Partial<GardenElement>; record: 'create' | 'modify' }
    | { type: 'DELETE_ELEMENT'; id: string }
    | { type: 'UPDATE_ZONE'; updatedZone: { id: string } & Partial<GardenZone>; record: 'create' | 'modify' }
    | { type: 'SET_SELECTED_ELEMENT'; element: ElementType | null }
    | { type: 'SET_PENDING_POSITION'; pos: Vec2 | null }
    | { type: 'SET_ELEMENTS'; elements: GardenElement[] }
    | { type: 'SET_ZONES'; zones: GardenZone[] }
    | { type: 'SET_COLORED_CELLS'; coloredCells: Record<string, ColoredCell> }
    | { type: 'TOGGLE_MAP_LOCK' }
    | { type: 'UNDO' }
    | { type: 'REDO' }

export type UIAction =
    | { type: 'TOGGLE_LAYER'; layer: LayerName }
    | { type: 'SHOW_LAYER'; layer: LayerName }
    | { type: 'HIDE_LAYER'; layer: LayerName }
    | { type: 'SET_ACTIVE_LAYERS'; activeLayers: LayerName[] }
    | { type: 'SET_SCALE'; scale: number }
    | { type: 'SET_PAN'; pan: { x: number; y: number } }
    | { type: 'TOGGLE_SIDEBAR'}
    | { type: 'SHOW_SIDEBAR'}
    | { type: 'HIDE_SIDEBAR'}
    | { type: 'SET_CURSOR'; cursor: string}
    | { type: 'SET_MAP_LOCK'; value: boolean }







