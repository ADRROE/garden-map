import type { GardenElementObject, GardenZoneObject, MenuElement, Vec2 } from '../types';

export type SelectionState =
  | { kind: null }
  | {
      kind: 'placing';
      menuItem: MenuElement;
      pendingPosition?: Vec2;
    }
  | { kind: 'editing'; obj: GardenZoneObject | GardenElementObject }
  | { kind: 'confirming' }
  | { kind: 'drawing'; color: string };