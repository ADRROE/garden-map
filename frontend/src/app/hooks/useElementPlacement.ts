import { createElementAPI, fetchElements } from "../services/apiService";
import { useGardenStore } from "../stores/useGardenStore";
import { useSelectionStore } from "../stores/useSelectionStore";
import { Vec2, GardenElement, MenuElement } from "../types";
import { toColumnLetter, getCoveredCells } from "../utils/utils";
import { uuid } from "uuidv4";


export function useElementPlacement() {
  const { selection, setPendingPosition, clear } = useSelectionStore();
  const createElement = useGardenStore((s) => s.createElement);
  const dispatch = useGardenStore((s) => s.dispatch);

  const beginPlacing = (item: MenuElement) => {
    // Might be triggered from menu
    useSelectionStore.setState({
      selection: { kind: 'placing', menuItem: item},
    });
  };

  const handleCellClick = (position: Vec2) => {
    if (selection.kind !== 'placing' || !selection.menuItem) return;
    setPendingPosition(position);
  };

  const confirmPlacement = async (name: string) => {
    console.log("🧪 confirmPlacement selection state:", selection);
    if (selection.kind !== 'placing' || !selection.menuItem || !selection.pendingPosition) return;

    const { x, y } = selection.pendingPosition;
    console.log(x, y)
    const selectedItem = selection.menuItem;
    console.log(selectedItem)
    const width = selectedItem.defaultWidth ?? 40;
    const height = selectedItem.defaultHeight ?? 40;
    const centeredX = Math.floor(x - width/ 20 / 2) + 1;
    const centeredY = Math.floor(y - height/20 / 2) + 1;
    console.log(centeredX, centeredY)
    const computedPosition = [centeredX, centeredY];
    console.log(computedPosition)
    const location = `${toColumnLetter(computedPosition[0])}${computedPosition[1]}`;
    const coverage = getCoveredCells(computedPosition[0], computedPosition[1], width / 19.5, height / 19.5);

    const newElement: GardenElement = {
      ...selectedItem,
      menuElementId: selectedItem.id,
      id: uuid(),
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
      console.error(e);
    }

    clear(); // end placing
  };

  return { beginPlacing, handleCellClick, confirmPlacement };
}