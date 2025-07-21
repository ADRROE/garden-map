import type { GardenEntity, PaletteItem, Vec2 } from '../types';

export type DrawingSource = 'new' | 'edit';

export type SelectionState =
  | { kind: null }
  | {
      kind: 'placing';
      menuItem: PaletteItem;
      pendingPosition?: Vec2;
    }
  | { kind: 'editing'; obj: GardenEntity }
  | { kind: 'confirming' }
  | { kind: 'drawing'; color: string; source: DrawingSource };