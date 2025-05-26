import { useSelectionStore } from "@/stores/useSelectionStore";
import { useGardenStore } from "../stores/useGardenStore";
import { GardenElement } from "@/types";
import { log } from '@/utils/utils'
import { useRef } from "react";

type CanvasInteractionOptions = {
  onSelect?: (element: GardenElement) => void;
  onDeselect?: () => void;
  onHoverChange?: (element: GardenElement | null) => void;
};

export function useCanvasInteraction({
  onSelect,
  onDeselect,
  onHoverChange,
}: CanvasInteractionOptions = {}) {

  const datastate = useGardenStore(state => state.present);
  const elements = useGardenStore(state => state.present.elements);
  const hoveredElementRef = useRef<GardenElement | null>(null);

  const selectElement = (element: GardenElement) => {
    useSelectionStore.getState().setEditing(element);
    log("CanvasInteraction now setting Editing with el: ", element);
  };

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

  const onCanvasHover = (worldX: number, worldY: number): GardenElement | null => {
    const hoveredEl = elements.find(el =>
      worldX >= el.x &&
      worldX <= el.x + el.width &&
      worldY >= el.y &&
      worldY <= el.y + el.height
    ) || null;

    // Only trigger callback if value changed
    if (hoveredElementRef.current?.id !== hoveredEl?.id) {
      hoveredElementRef.current = hoveredEl;
      onHoverChange?.(hoveredEl); // 🆕 notify parent
    }

    return hoveredEl;
  };

  return { onCanvasHover, onCanvasClick };
}