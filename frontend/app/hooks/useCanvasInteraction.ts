import { useGardenStore } from "./useGardenStore";
import { GardenElement } from "@/types";

type CanvasInteractionOptions = {
  onSelect?: (element: GardenElement) => void;
  onDeselect?: () => void;
};

export const useCanvasInteraction = ({ onSelect, onDeselect }: CanvasInteractionOptions = {}) => {

  const  selectElement  = useGardenStore(state => state.selectElement);
  const datastate = useGardenStore(state => state.present);

  const onCanvasClick = (worldX: number, worldY: number): GardenElement | null => {
    const clicked = datastate.elements.find(el =>
      worldX >= el.x && worldX <= el.x + el.width &&
      worldY >= el.y && worldY <= el.y + el.height
    );

    if (clicked) {
      selectElement(clicked);
      onSelect?.(clicked);
      return clicked;
    } else {
      selectElement(null); // Clear selection
      onDeselect?.();
      return null;
    }
  };

  return { onCanvasClick };
};