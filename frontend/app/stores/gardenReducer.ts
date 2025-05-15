// stores/gardenReducer.ts
import { GardenDataAction } from '@/services/actions';
import { GardenDataState } from '@/types';
import { produce } from 'immer';

export const undoableActions = new Set<GardenDataAction['type']>([
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

export function baseReducer(state: GardenDataState, action: GardenDataAction): GardenDataState {
  return produce(state, draft => {
    switch (action.type) {
      case 'CREATE_ELEMENT':
        draft.elements.push(action.element);
        draft.pendingPosition = null;
        draft.selectedElement = null;
        break;

      case 'UPDATE_ELEMENT': {
        const el = draft.elements.find(e => e.id === action.id);
        if (el) Object.assign(el, action.updates);
        break;
      }

      case 'DELETE_ELEMENT':
        draft.elements = draft.elements.filter(e => e.id !== action.id);
        break;

      case 'COLOR_CELL': {
        const key = `${action.i}-${action.j}`;
        draft.coloredCells[key] = {
          x: action.i,
          y: action.j,
          color: action.color,
          menuElementId: action.menuElementId,
        };
        break;
      }

      case 'UNCOLOR_CELL': {
        const key = `${action.i}-${action.j}`;
        delete draft.coloredCells[key];
        break;
      }

      case 'SET_ZONES':
        draft.zones = action.zones;
        break;

      case 'UPDATE_ZONE': {
        const zone = draft.zones.find(z => z.id === action.updatedZone.id);
        if (zone) Object.assign(zone, action.updatedZone);
        break;
      }

      case 'SET_SELECTED_ELEMENT':
        draft.selectedElement = action.element;
        break;

      case 'SET_PENDING_POSITION':
        draft.pendingPosition = action.pos && action.subject
          ? { pos: action.pos, subject: action.subject }
          : null;
        break;

      default:
        // unknown action — no changes
        break;
    }
  });
}