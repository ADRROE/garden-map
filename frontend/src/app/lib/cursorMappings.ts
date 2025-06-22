import { SelectionState } from '@/stores/SelectionState';
import { PaletteItem } from '@/types';

export function resolveCursor(
  selectionState: SelectionState | null,
  naming?: boolean,
  menuItem?: PaletteItem | null
): string {
  if (!selectionState || selectionState.kind === null) {
    return 'default';
  }

  switch (selectionState.kind) {
    case 'drawing': {
      return 'crosshair';
    }

    case 'placing': {
      if (!naming && menuItem?.cursor) {
        return `url(${menuItem.cursor}) 16 16, auto`;
      }
      return 'default';
    }

    case 'editing': {
      return 'default';
    }

    case 'confirming': {
      return 'progress';
    }

    default:
      return 'default';
  }
}