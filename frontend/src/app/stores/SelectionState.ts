import type { GardenElement, MenuElement, Vec2 } from '../types';

export type SelectionState =
  | { kind: null }
  | {
      kind: 'placing';
      menuItem: MenuElement;
      pendingPosition?: Vec2;
    }
  | { kind: 'editing'; element: GardenElement }
  | { kind: 'drawing'; color: string };