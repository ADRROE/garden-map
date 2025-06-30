import { useSelectionStore } from "@/stores/useSelectionStore";
import { useGardenStore } from "../stores/useGardenStore";
import { GardenItem, InteractiveZone } from "@/types";
import { log } from '@/utils/utils'
import { useEffect, useRef } from "react";
import { useUIStore } from "@/stores/useUIStore";
import { useMenuStore } from "@/stores/useMenuStore";
import { useInteractiveZones } from "./useInteractiveZones";
// import { useMenuItem } from "./usePaletteItem";

type CanvasInteractionOptions = {
  onSelect?: (obj: GardenItem | InteractiveZone) => void;
  onDeselect?: () => void;
  onHoverChange?: (obj: GardenItem | null) => void;
};

export function useCanvasInteraction({
  onSelect,
  onDeselect,
  onHoverChange,
}: CanvasInteractionOptions = {}) {

  const isMouseDownRef = useRef(false);
  const isModifierKeyDown = useRef(false);
  const hoveredItemRef = useRef<GardenItem | null>(null);

  const datastate = useGardenStore(state => state.present);
  const items = useGardenStore(state => state.present.items);

  const uidispatch = useUIStore(state => state.dispatch)

  const zoneObjects = useInteractiveZones()

  const selectItem = (item: GardenItem) => {
    useSelectionStore.getState().setEditing(item);
    useMenuStore.getState().setOpenPropMenu(item.id)
    log("CanvasInteraction now setting Editing with el: ", item);
  };
  const selectZoneObject = (zone: InteractiveZone) => {
    useSelectionStore.getState().setEditing(zone);
    useMenuStore.getState().setOpenPropMenu(zone.id)
  }
  const isDrawing = useSelectionStore((s) => s.selection.kind === 'drawing');
  const isPlacing = useSelectionStore((s) => s.selection.kind === 'placing');
  // const selectedItemId = useSelectionStore((s) => s.selection.kind ? s.selectedItemId : null);
  // const selectedItem = useMenuItem(selectedItemId);
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

  // useEffect(() => {
  //   if (selectedItem?.color) {
  //     useSelectionStore.getState().setDrawing('new', selectedItem.color);
  //   }
  // }, [selectedItem])

  const onCanvasClick = (worldX: number, worldY: number, ctx?: CanvasRenderingContext2D): GardenItem | InteractiveZone | null => {
    const clickedEl = datastate.items.find(el =>
      worldX >= el.position.x &&
      worldX <= el.position.x + el.width &&
      worldY >= el.position.y &&
      worldY <= el.position.y + el.height
    );
    const zone = zoneObjects.find(zoneObj => {
      return zoneObj.path && ctx?.isPointInPath(zoneObj.path, worldX, worldY);

    });
    if (clickedEl) {
      selectItem(clickedEl);
      onSelect?.(clickedEl);
      return clickedEl;
    }
    if (zone) {
      selectZoneObject(zone);
      onSelect?.(zone);
      return zone;
    }
    else {
      if (!isDrawing && !isPlacing) {
        onDeselect?.()
      };
      return null;
    }
  };

  const onCanvasHover = (worldX: number, worldY: number): GardenItem | null => {
    const hoveredEl = items.find(el =>
      worldX >= el.position.x &&
      worldX <= el.position.x + el.width &&
      worldY >= el.position.y &&
      worldY <= el.position.y + el.height
    ) || null;

    // Only trigger callback if value changed
    if (hoveredItemRef.current?.id !== hoveredEl?.id) {
      hoveredItemRef.current = hoveredEl;
      onHoverChange?.(hoveredEl); // 🆕 notify parent
    }

    return hoveredEl;
  };

  return { isMouseDownRef, isModifierKeyDown, onCanvasHover, onCanvasClick };
}