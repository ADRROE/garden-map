import { useSelectionStore } from "@/stores/useSelectionStore";
import { useGardenStore } from "../stores/useGardenStore";
import { GardenElement } from "@/types";

type CanvasInteractionOptions = {
  onSelect?: (element: GardenElement) => void;
  onDeselect?: () => void;
};

export const useCanvasInteraction = ({ onSelect, onDeselect }: CanvasInteractionOptions = {}) => {

  const datastate = useGardenStore(state => state.present);
  const selectElement = (element: GardenElement) => {
    useSelectionStore.getState().setEditing(element)
  }

  const onCanvasClick = (worldX: number, worldY: number): GardenElement | null => {

    const clickedEl = datastate.elements.find(el =>
      worldX >= el.x && worldX <= el.x + el.width &&
      worldY >= el.y && worldY <= el.y + el.height
    );

    if (clickedEl) {
      selectElement(clickedEl);
      onSelect?.(clickedEl);
      return clickedEl;
    } else {
      onDeselect?.();
      return null;
    }
  };

  return { onCanvasClick };
};