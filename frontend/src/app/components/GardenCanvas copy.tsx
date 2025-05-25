import React, {
  useState, useRef, useEffect, useMemo, forwardRef, useImperativeHandle
} from 'react';
import CanvasGrid, { CanvasGridHandle } from './CanvasGrid';
import NameModal from './NameModal';
import { useGardenStore } from '../stores/useGardenStore';
import { CanvasLayer, ColoredCell, GardenElement, Vec2 } from '../types';
import { useCanvasInteraction } from '../hooks/useCanvasInteraction';
import PropMenu from './PropMenu';
import { useSelectionStore } from '../stores/useSelectionStore';
import { useGardenElement } from '../hooks/useGardenElement';
import { fetchElements, fetchZones } from '../services/apiService';
import { useUIStore } from '../stores/useUIStore';
import { useColorBuffer } from '@/hooks/useColorBuffer';
import { useGardenZone } from '@/hooks/useGardenZone';
import { log, warn, error } from "@/utils/utils";
import drawZone from '@/utils/DrawZone';
import { withLoading } from '@/utils/withLoading';

const CELL_SIZE = 20;

const GardenCanvas = forwardRef<CanvasGridHandle, { colorBuffer: ReturnType<typeof useColorBuffer> }>(({ colorBuffer }, ref) => {
  const innerCanvasGridRef = useRef<CanvasGridHandle>(null);
  const isMouseDownRef = useRef(false);

  useImperativeHandle(ref, () => ({
    getTransformedElement: () => {
      return innerCanvasGridRef.current?.getTransformedElement() ?? null;
    },
    colorCell: (cell) => {
      log('🎨 Imperative colorCell called with:', cell);
      innerCanvasGridRef.current?.colorCell(cell);
      colorBuffer.addCell(cell);
    },
    clearColoring: () => {
      log('🧼 clearColoring called');
      innerCanvasGridRef.current?.clearColoring();
    },
    getBounds: () => innerCanvasGridRef.current?.getBounds(),

    handleEditConfirm() {
      log("13 - Now, handleEditConfirm is triggered in GardenCanvas.")
      log("colorBuffer.getCells() as seen by GardenCanvas: ", colorBuffer.getCells());
      log("innerCanvasGridRef.current?.getTransformedElement() as seen by GardenCanvas: ", innerCanvasGridRef.current?.getTransformedElement());

      const updatedElement = innerCanvasGridRef.current?.getTransformedElement();
      if (updatedElement) {
        log('14 - ✅ Calling updateElement from within GardenCanvas with updatedElement:', updatedElement);
        updateElement(updatedElement);
        log("15 - Clearing selection...")
        clearSelection();
      }

      const coloredCells = colorBuffer.getCells();
      log('14 - 📦 Pulling coloredCells out of buffer from within GardenCanvas by calling colorBuffer.getCells():', coloredCells);

      if (Object.keys(coloredCells).length > 0) {
        log("15 - coloredCells are not null and now dispatched by GardenCanvas.")
        gdispatch({ type: 'SET_COLORED_CELLS', coloredCells });
        log("16 - Opening NameModal...")
        setNaming(true);
      } else {
        warn('⚠️ No colored cells found in buffer');
      }
    },
  }));

  const { activeLayers } = useUIStore();
  const uidispatch = useUIStore((s) => s.dispatch);

  const isDrawing = useSelectionStore((s) => s.selection.kind === 'drawing');
  const isEditing = useSelectionStore((s) => s.selection.kind === 'editing');
  const isPlacing = useSelectionStore((s) => s.selection.kind === 'placing');
  const selectedItem = useSelectionStore((s) => s.selection.kind ? s.selectedItem : null);
  const selectedElement = useSelectionStore((s) => s.selectedElement);
  const clearSelection = useSelectionStore((s) => s.clear);

  const elements = useGardenStore(state => state.present.elements);
  const zones = useGardenStore(state => state.present.zones);
  const gdispatch = useGardenStore((s) => s.dispatch);
  const updateElement = useGardenStore((s) => s.updateElement);

  const [naming, setNaming] = useState(false);
  const [propMenu, setPropMenu] = useState<GardenElement | null>(null);
  const [propMenuPosition, setPropMenuPosition] = useState<{ x: number; y: number } | null>(null);

  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const zonePathCache = useRef<Map<string, Path2D>>(new Map());;

  const { onCanvasClick } = useCanvasInteraction({
    onSelect: (el) => {
      setPropMenu(el);
      setPropMenuPosition({ x: el.x, y: el.y });
    },
    onDeselect: () => {
      setPropMenu(null);
      setPropMenuPosition(null);
      uidispatch({ type: 'HIDE_SIDEBAR' })
    }
  });

  const { place: placeElementAt, confirmPlacement: confirmElementPlacement } = useGardenElement();
  const { confirmPlacement: confirmZoneCreation } = useGardenZone();

  const handleWorldClick = (x: number, y: number) => {
    log("2 - handleWorldClick triggered in GardenCanvas with coordinates: ", x, y)
    const col = Math.floor(x / CELL_SIZE);
    log("3 - Converted and stored to col: ", col)
    const row = Math.floor(y / CELL_SIZE);
    log("4 - Converted and stored to row: ", row)
    const cell = { x: col, y: row, color: selectedItem?.metadata?.brushColor };
    log("5 - Defined 'cell': ", cell);

    if (isDrawing && innerCanvasGridRef.current) {
      log('6 - 🖌️ Coloring cell at', col, row);
      innerCanvasGridRef.current.colorCell(cell);
      log("7 - innerCanvasGridRef.current.colorCell is now called. ")

      const fullCell: ColoredCell = {
        x: col,
        y: row,
        color: cell.color ?? "",
        menuElementId: selectedItem!.id
      };

      log('8 - 🧠 Adding fullCell to color buffer:', fullCell);
      colorBuffer.addCell(fullCell);

      return;
    }

    log("6 - Now triggering onCanvasClick with x and y: ", x, y)
    const target = onCanvasClick(x, y);
    if (target) log("7 - onCanvasClick yielded non-null target: ", target)
    if (!target && isPlacing) {
      const position: Vec2 = { x: col * CELL_SIZE, y: row * CELL_SIZE };
      log("7 - onCanvasClick yielded null target so calling place hook with position: ", position);
      placeElementAt(position);
      if (selectedItem) setNaming(true);
    }
  };

  const layers = useMemo((): CanvasLayer[] => {
    return activeLayers.map((layer) => ({
      name: layer,
      draw: (ctx) => {
        if (layer === 'elements') {
          const cache = selectedElement ? null : imageCacheRef.current;

          elements.forEach(el => {
            const iconSrc = el.icon;

            let img = cache?.get(iconSrc);

            if (!img) {
              img = new Image();
              img.src = iconSrc;

              img.onload = () => {
                if (img) {
                  cache?.set(iconSrc, img);
                  ctx.drawImage(img!, el.x, el.y, el.width, el.height);
                }
              };

              cache?.set(iconSrc, img);
            } else {
              if (img.complete) {
                ctx.drawImage(img, el.x, el.y, el.width, el.height);
              }
            }

            if (isEditing) {
              ctx.strokeStyle = 'rgba(0, 128, 0, 0.5)';
              ctx.strokeRect(el.x, el.y, el.width, el.height);
            }

            if (el.id === selectedElement?.id) {
              ctx.globalAlpha = 0.3;
              ctx.strokeStyle = 'blue';
              ctx.lineWidth = 2;
              ctx.strokeRect(el.x, el.y, el.width, el.height);
            }
          });
        }
        if (layer === 'zones') {
          zones.forEach(zone => drawZone(ctx, zone, zonePathCache.current));
        }
      },
      deps: [selectedElement],
    }));
  }, [activeLayers, elements, zones, selectedElement, isEditing]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        clearSelection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clearSelection]);

  useEffect(() => {
    let mounted = true;

    const initialLoad = async () => {
      try {
        const elements = await withLoading(() => fetchElements());
        if (mounted) {
          log('🌱 Initial elements loaded:', elements);
          gdispatch({ type: 'SET_ELEMENTS', elements });
        }
      } catch (err) {
        error('🚨 Failed to load elements', err);
      }
      try {
        const zones = await withLoading(() => fetchZones());
        if (mounted) {
          log('🌱 Initial zones loaded:', zones);
          gdispatch({ type: 'SET_ZONES', zones });
        }
      } catch (err) {
        error('🚨 Failed to load zones', err);
      }
    };

    initialLoad();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (selectedItem?.color) return useSelectionStore.getState().setDrawing(selectedItem.color)
  }, [selectedItem])

useEffect(() => {
  const wrapper = innerCanvasGridRef.current?.wrapper;
  if (!wrapper || !isDrawing) return;

  const handleMouseDown = () => {
    console.log("mousedown");
    isMouseDownRef.current = true;
  };

  const handleMouseUp = () => {
    console.log("mouseup");
    isMouseDownRef.current = false;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isMouseDownRef.current) return;

    const rect = wrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    console.log("mousemove with mouse down", { x, y });
    handleWorldClick(x, y);
  };

  window.addEventListener("mousedown", handleMouseDown);
  window.addEventListener("mouseup", handleMouseUp);
  wrapper.addEventListener("mousemove", handleMouseMove);

  return () => {
    window.removeEventListener("mousedown", handleMouseDown);
    window.removeEventListener("mouseup", handleMouseUp);
    wrapper.removeEventListener("mousemove", handleMouseMove);
  };
}, [handleWorldClick, isDrawing]);  // ✅ Keep just this one

  return (
    <div style={{ position: 'relative' }}>
      <CanvasGrid
        ref={innerCanvasGridRef}
        layers={layers}
        selectedElement={selectedElement}
        onWorldClick={handleWorldClick}
      // onEditConfirm={handleEditConfirm}
      />
      {naming && (
        <NameModal
          onPlacement={async (name) => {
            if (isPlacing) {
              log("10 - isPlacing, now calling await confirmElementPlacement(name) with name: ", name)
              await confirmElementPlacement(name);
            }
            if (isDrawing) {
              const cells = colorBuffer.getCells()
              log("17 - isDrawing, colorBuffer.getCells() yields: ", cells)
              log("18 - Calling 'await confirmZoneCreation(cells, name)' with arguments: ", cells, name)
              await confirmZoneCreation(cells, name);
            }
            setNaming(false);
          }}
          onAbort={() => {
            clearSelection();
            setNaming(false);
          }}
        />
      )}
      {propMenu && propMenuPosition && (
        <div
          style={{
            position: 'absolute',
            top: Math.min(propMenuPosition.y, window.innerHeight - 200),
            left: Math.min(propMenuPosition.x, window.innerWidth - 300),
            zIndex: 1000,
          }}
        >
          <PropMenu
            element={propMenu}
            onUpdate={(updatedData) => {
              log('🔧 PropMenu updated element:', updatedData);
              updateElement(updatedData);
              setPropMenu((prev) =>
                prev && prev.id === updatedData.id
                  ? { ...prev, ...updatedData }
                  : prev
              );
            }}
            onClose={() => setPropMenu(null)}
          />
        </div>
      )}
    </div>
  );
});

GardenCanvas.displayName = 'GardenCanvas';
export default GardenCanvas;