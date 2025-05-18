import type { GardenElement, MenuElement, Vec2 } from '@/types';

export type SelectionState =
  | { kind: 'none' }
  | {
      kind: 'placing';
      menuItem: MenuElement;
      pendingPosition?: Vec2; // 🔍 Add this here
    }
  | { kind: 'editing'; element: GardenElement }
  | { kind: 'zone'; zoneId: string };