import { createElementAPI, fetchElements } from "../services/apiService";
import { useGardenStore } from "../stores/useGardenStore";
import { useSelectionStore } from "../stores/useSelectionStore";
import { Vec2, GardenElement } from "../types";
import { toColumnLetter, getCoveredCells } from "../utils/utils";
import { v4 as uuidv4 } from 'uuid';
import { log, error } from "@/utils/utils";


export function useGardenElement() {
  const { setPendingPosition, clear } = useSelectionStore();
  const selectedItem = useSelectionStore((s) => s.selection.kind === "placing" ? s.selectedItem : null);
  const createElement = useGardenStore((s) => s.createElement);
  const dispatch = useGardenStore((s) => s.dispatch);

  const place = (position: Vec2) => {
    log("8 - place triggered in useGardenElement-hook with menuItem", selectedItem);
    if (!selectedItem) return;
    log("9 - Calling setPendingPosition in hook with position: ", position);
    setPendingPosition(position);
  };

  const confirmPlacement = async (name: string) => {
  const state = useSelectionStore.getState();

  const currentPendingPosition = state.selection.kind === 'placing'
    ? state.selection.pendingPosition
    : null;
    if (!selectedItem || !currentPendingPosition) return;

    const { x, y } = currentPendingPosition;
    const width = selectedItem.defaultWidth ?? 40;
    const height = selectedItem.defaultHeight ?? 40;
    const centeredX = Math.floor(x - width/ 20 / 2) + 1;
    const centeredY = Math.floor(y - height/20 / 2) + 1;
    const computedPosition = [centeredX, centeredY];
    const location = `${toColumnLetter(computedPosition[0])}${computedPosition[1]}`;
    const coverage = getCoveredCells(computedPosition[0], computedPosition[1], width / 19.5, height / 19.5);

    const newElement: GardenElement = {
      ...selectedItem,
      menuElementId: selectedItem.id,
      id: uuidv4(),
      name,
      x: centeredX,
      y: centeredY,
      location,
      width,
      height,
      coverage,
    };

    createElement(newElement);

    try {
      await createElementAPI(newElement);
      const fetched = await fetchElements();
      dispatch({ type: 'SET_ELEMENTS', elements: fetched });
    } catch (e) {
      error(e);
    }

    clear(); // end placing
  };

  return { place, confirmPlacement };
}