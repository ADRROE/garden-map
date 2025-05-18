import {
  GardenElement,
  GardenZone,
  ElementType,
  Vec2
} from '@/types';
import { GardenDataAction } from '@/services/actions';

export const createElement = (element: GardenElement): GardenDataAction => ({
  type: 'CREATE_ELEMENT',
  element
});

export const updateElement = (id: string, updates: Partial<GardenElement>): GardenDataAction => ({
  type: 'UPDATE_ELEMENT',
  id,
  updates
});

export const deleteElement = (id: string): GardenDataAction => ({
  type: 'DELETE_ELEMENT',
  id
});

export const colorCell = (i: number, j: number, color: string, menuElementId: string): GardenDataAction => ({
  type: 'COLOR_CELL',
  i,
  j,
  color,
  menuElementId
});

export const uncolorCell = (i: number, j: number): GardenDataAction => ({
  type: 'UNCOLOR_CELL',
  i,
  j
});

export const setSelectedElement = (element: ElementType | null): GardenDataAction => ({
  type: 'SET_SELECTED_ELEMENT',
  element
});

export const setPendingPosition = (pos: Vec2 | null): GardenDataAction => ({
  type: 'SET_PENDING_POSITION',
  pos
});

export const setZones = (zones: GardenZone[]): GardenDataAction => ({
  type: 'SET_ZONES',
  zones
});

export const updateZone = (updatedZone: GardenZone): GardenDataAction => ({
  type: 'UPDATE_ZONE',
  updatedZone
});

export const setPan = (pan: Vec2): GardenDataAction => ({
  type: 'SET_PAN',
  pan
});

export const setScale = (scale: number): GardenDataAction => ({
  type: 'SET_SCALE',
  scale
});

export const setElements = (elements: GardenElement[]): GardenDataAction => ({
  type: 'SET_ELEMENTS',
  elements
});

export const toggleMapLock = (): GardenDataAction => ({
  type: 'TOGGLE_MAP_LOCK'
});

export const toggleSelectingElement = (): GardenDataAction => ({
  type: 'TOGGLE_IS_SELECTING_ELEMENT'
});

export const toggleSelectingZone = (): GardenDataAction => ({
  type: 'TOGGLE_IS_SELECTING_ZONE'
});