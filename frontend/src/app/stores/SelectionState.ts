import type { GardenItem, InteractiveZone, PaletteItem, Vec2 } from '../types';

export type SelectionState =
  | { kind: null }
  | {
      kind: 'placing';
      menuItem: PaletteItem;
      pendingPosition?: Vec2;
    }
  | { kind: 'editing'; obj: InteractiveZone | GardenItem }
  | { kind: 'confirming' }
  | { kind: 'drawing'; color: string };