import { useSelectionStore } from "@/stores/useSelectionStore";
import { useGardenStore } from "../stores/useGardenStore";
import { GardenElementObject, GardenZoneObject } from "@/types";
import { log } from '@/utils/utils'
import { useEffect, useRef } from "react";
import { useUIStore } from "@/stores/useUIStore";
import { useMenuStore } from "@/stores/useMenuStore";
import { useGardenZoneObjects } from "./useGardenZoneObjects";
import { useMenuElement } from "./useMenuElement";

type CanvasInteractionOptions = {
  onSelect?: (obj: GardenElementObject | GardenZoneObject) => void;
  onDeselect?: () => void;
  onHoverChange?: (obj: GardenElementObject | null) => void;
};

export function useCanvasInteraction({
  onSelect,
  onDeselect,
  onHoverChange,
}: CanvasInteractionOptions = {}) {

  const isMouseDownRef = useRef(false);
  const isModifierKeyDown = useRef(false);
  const hoveredElementRef = useRef<GardenElementObject | null>(null);

  const datastate = useGardenStore(state => state.present);
  const elements = useGardenStore(state => state.present.elements);

  const uidispatch = useUIStore(state => state.dispatch)

  const zoneObjects = useGardenZoneObjects()

  const selectElement = (element: GardenElementObject) => {
    useSelectionStore.getState().setEditing(element);
    useMenuStore.getState().setOpenPropMenu(element.id)
    log("CanvasInteraction now setting Editing with el: ", element);
  };
  const selectZoneObject = (zone: GardenZoneObject) => {
    useSelectionStore.getState().setEditing(zone);
    useMenuStore.getState().setOpenPropMenu(zone.id)
  }
  const isDrawing = useSelectionStore((s) => s.selection.kind === 'drawing');
  const selectedItemId = useSelectionStore((s) => s.selection.kind ? s.selectedItemId : null);
  const selectedItem = useMenuElement(selectedItemId);
  const clearSelection = useSelectionStore((s) => s.clear);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (isDrawing) {
        e.preventDefault(); // ❌ Stop right-click menu
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isDrawing]);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (e.ctrlKey && isDrawing) {
        e.preventDefault(); // ❌ Prevent ctrl+click default behavior
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [isDrawing]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        clearSelection();
        uidispatch({ type: 'SET_CURSOR', cursor: 'default' });
      }
      if (e.key === 'Control') {
        e.preventDefault();
        if (isDrawing) useSelectionStore.getState().setModifierKeyDown(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control') {
        e.preventDefault();
        useSelectionStore.getState().setModifierKeyDown(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isDrawing, clearSelection]);

  useEffect(() => {
    if (!isDrawing) return;

    const handleMouseDown = () => useSelectionStore.getState().setMouseDown(true);
    const handleMouseUp = () => useSelectionStore.getState().setMouseDown(false);

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDrawing]);

  useEffect(() => {
    if (selectedItem?.color) {
      useSelectionStore.getState().setDrawing(selectedItem.color);
    }
  }, [selectedItem])

  const onCanvasClick = (worldX: number, worldY: number, ctx?: CanvasRenderingContext2D): GardenElementObject | GardenZoneObject | null => {
    const clickedEl = datastate.elements.find(el =>
      worldX >= el.x && worldX <= el.x + el.width &&
      worldY >= el.y && worldY <= el.y + el.height
    );
    const zone = zoneObjects.find(zoneObj => {
      return zoneObj.path && ctx?.isPointInPath(zoneObj.path, worldX, worldY);

    });
    if (clickedEl) {
      selectElement(clickedEl);
      onSelect?.(clickedEl);
      return clickedEl;
    }
    if (zone) {
      selectZoneObject(zone);
      onSelect?.(zone);
      return zone;
    }
    else {
      onDeselect?.();
      return null;
    }
  };

  const onCanvasHover = (worldX: number, worldY: number): GardenElementObject | null => {
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

  return { isMouseDownRef, isModifierKeyDown, onCanvasHover, onCanvasClick };
}