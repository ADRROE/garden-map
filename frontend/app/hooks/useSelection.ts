import { useMenuStore } from '@/stores/useMenuStore';
import { useGardenStore } from '@/stores/useGardenStore';
import { MenuElement, GardenElement } from '@/types';

export type Selection =
  | { kind: 'placing'; item: MenuElement }
  | { kind: 'editing'; item: GardenElement }
  | { kind: 'none' };

export function useSelection(): {
  selectedItem: MenuElement | GardenElement | null;
  isPlacing: boolean;
  isEditing: boolean;
  clearSelection: () => void;
} {
  const menuItem = useMenuStore((s) => s.selectedItem);
  const gardenItem = useGardenStore((s) => s.present.selectedElement);
  const gardenDispatch = useGardenStore((s) => s.dispatch);
  const clearMenu = useMenuStore((s) => s.setSelectedItem);

  let selectedItem: MenuElement | GardenElement | null = null;
  let isPlacing = false;
  let isEditing = false;

  if (gardenItem) {
    selectedItem = gardenItem;
    isEditing = true;
  } else if (menuItem) {
    selectedItem = menuItem;
    isPlacing = true;
  }

  const clearSelection = () => {
    clearMenu(null);
    gardenDispatch({ type: 'SET_SELECTED_ELEMENT', element: null });
  };

  return {
    selectedItem,
    isPlacing,
    isEditing,
    clearSelection,
  };
}