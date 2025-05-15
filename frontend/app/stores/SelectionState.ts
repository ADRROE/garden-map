// SelectionState.ts
import type { GardenElement, MenuElement } from '@/types';

export type SelectionState =
  | { kind: 'none' }
  | { kind: 'placing'; menuItem: MenuElement }
  | { kind: 'editing'; element: GardenElement }
  | { kind: 'zone'; zoneId: string }; // optional: for zone-specific selections