import { SelectionState } from '@/stores/SelectionState';
import { MenuElement } from '@/types';

export function resolveCursor(
  selectionState: SelectionState | null,
  naming?: boolean,
  menuItem?: MenuElement | null
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
      return 'pointer';
    }

    case 'confirming': {
      return 'progress';
    }

    default:
      return 'default';
  }
}