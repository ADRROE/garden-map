import { createItemAPI, fetchItems, updateItemAPI } from "../services/apiService";
import { useGardenStore } from "../stores/useGardenStore";
import { useSelectionStore } from "../stores/useSelectionStore";
import { Vec2, GardenItem } from "../types";
import { getCoveredCells } from "../utils/utils";
import { v4 as uuidv4 } from 'uuid';
import { log, error } from "@/utils/utils";
import { useMenuItem } from "./usePaletteItem";


export function useGardenItem() {
  const { setPendingPosition, clear } = useSelectionStore();
  const selectedPaletteItemId = useSelectionStore((s) => s.selection.kind === "placing" ? s.selectedItemId : null);
  const selectedPaletteItem = useMenuItem(selectedPaletteItemId);

  const createGardenItem = useGardenStore((s) => s.createItem);
  const updateItemLocally = useGardenStore((s) => s.updateItemLocally);
  const dispatch = useGardenStore((s) => s.dispatch);

  const initPlacement = (position: Vec2) => {
    log("8 - place triggered in useGardenItem-hook with menuItem", selectedPaletteItem);
    if (!selectedPaletteItem) return;
    log("9 - Calling setPendingPosition in hook with position: ", position);
    setPendingPosition(position);
  };

  const confirmPlacement = async (name: string) => {
    const state = useSelectionStore.getState();

    const currentPendingPosition = state.selection.kind === 'placing'
      ? state.selection.pendingPosition
      : null;
    if (!selectedPaletteItem || !currentPendingPosition) return;

    const { x, y } = currentPendingPosition;
    const width = selectedPaletteItem.defaultWidth ?? 40;
    const height = selectedPaletteItem.defaultHeight ?? 40;
    const centeredX = x - width / 2;
    const centeredY = y - height / 2;
    const computedPosition = [Math.floor(centeredX / 20) + 1, Math.floor(centeredY / 20) + 1];
    const coverage = getCoveredCells(computedPosition[0], computedPosition[1], width / 20, height / 20);
    const newItem: GardenItem = {
      ...selectedPaletteItem,
      kind: 'GardenItem',
      paletteItemId: selectedPaletteItem.id,
      id: uuidv4(),
      displayName: name,
      position: {
        x: centeredX,
        y: centeredY,
      },
      width: width,
      height: height,
      coverage,
    };

    createGardenItem(newItem);

    try {
      await createItemAPI(newItem);
      const fetched = await fetchItems();
      dispatch({ type: 'SET_ITEMS', items: fetched });
    } catch (e) {
      error(e);
    }

    clear();
  };

  const confirmUpdate = async(id: string, updates: Partial<GardenItem>, operation: 'create' | 'modify') => {
    updateItemLocally(id, updates);
    try {
      await updateItemAPI(id, updates, operation);
      const fetched = await fetchItems();
      dispatch({ type: 'SET_ITEMS', items: fetched });
    } catch (e) {
      error(e);
    }
    clear();
  }



  return { initPlacement, confirmPlacement, confirmUpdate};
}