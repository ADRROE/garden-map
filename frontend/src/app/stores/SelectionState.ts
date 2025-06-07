import type { GardenElementObject, MenuElement, Vec2 } from '../types';

export type SelectionState =
  | { kind: null }
  | {
      kind: 'placing';
      menuItem: MenuElement;
      pendingPosition?: Vec2;
    }
  | { kind: 'editing'; obj: GardenElementObject }
  | { kind: 'confirming' }
  | { kind: 'drawing'; color: string };