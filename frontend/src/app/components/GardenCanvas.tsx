import React, {
  useState, useRef, useEffect, useMemo, forwardRef, useImperativeHandle,
  useCallback
} from 'react';
import CanvasGrid, { CanvasGridHandle } from './CanvasGrid';
import NameModal from './NameModal';
import { useGardenStore } from '../stores/useGardenStore';
import { CanvasLayer, Cell, GardenItem, InteractiveZone, Vec2 } from '../types';
import { useCanvasInteraction } from '../hooks/useCanvasInteraction';
import PropMenu from './PropMenu';
import { useSelectionStore } from '../stores/useSelectionStore';
import { useGardenItem } from '../hooks/useGardenItem';
import { fetchItems, fetchZones } from '../services/apiService';
import { useUIStore } from '../stores/useUIStore';
import { useColorBuffer } from '@/hooks/useColorBuffer';
import { useGardenZone } from '@/hooks/useCells';
import { log, warn, error } from "@/utils/utils";
import { useViewportStore } from '@/stores/useViewportStore';
import UpdateModal from './UpdateModal';
import { fieldConfig } from '../lib/fieldConfig';
import { useMenuStore } from '@/stores/useMenuStore';
import { useInteractiveZones } from '@/hooks/useInteractiveZones';
import { useMenuItem } from '@/hooks/usePaletteItem';
import { useCursorSync } from '@/hooks/useCursorSync';

const CELL_SIZE = 20;

const GardenCanvas = forwardRef<CanvasGridHandle, { colorBuffer: ReturnType<typeof useColorBuffer> }>(({ colorBuffer }, ref) => {
  const innerCanvasGridRef = useRef<CanvasGridHandle>(null);
  const isMouseDown = useSelectionStore(s => s.isMouseDown);
  const isModifierKeyDown = useSelectionStore(s => s.isModifierKeyDown);

  useImperativeHandle(ref, () => ({
    getTransformedItem: () => {
      return innerCanvasGridRef.current?.getTransformedItem() ?? null;
    },
    colorCell: (cell) => {
      log('🎨 Imperative colorCell called with:', cell);
      innerCanvasGridRef.current?.colorCell(cell);
    },
    uncolorCell: (col, row) => {
      log('🎨 Imperative uncolorCell called with:', col, row);
      innerCanvasGridRef.current?.uncolorCell(col, row);
    },
    clearColoring: () => {
      log('🧼 clearColoring called');
      innerCanvasGridRef.current?.clearColoring();
    },
    getBounds: () => innerCanvasGridRef.current?.getBounds(),

    handleEditConfirm() {
      log("13 - Now, handleEditConfirm is triggered in GardenCanvas.")
      log("colorBuffer.getCells() as seen by GardenCanvas: ", colorBuffer.getCells());
      log("innerCanvasGridRef.current?.getTransformedItem() as seen by GardenCanvas: ", innerCanvasGridRef.current?.getTransformedItem());

      // const updatedItem = innerCanvasGridRef.current?.getTransformedItem();
      // if (updatedItem) {
      //   log('14 - ✅ Calling updateItem from within GardenCanvas with updatedItem:', updatedItem);
      //   updateItem(updatedItem);
      //   log("15 - Clearing selection...")
      //   clearSelection();
      // }

      const coloredCells = colorBuffer.getCells();
      log('14 - 📦 Pulling coloredCells out of buffer from within GardenCanvas by calling colorBuffer.getCells():', coloredCells);

      if (Object.keys(coloredCells).length > 0) {
        log("15 - coloredCells are not null and now dispatched by GardenCanvas.")
        gdispatch({ type: 'SET_COLORED_CELLS', cells: coloredCells });
        log("16 - Opening NameModal...")
        setNaming(true);
      } else {
        warn('⚠️ No colored cells found in buffer');
      }
    },
  }));

  const activeLayers = useUIStore((s) => s.activeLayers);
  const isMapLocked = useUIStore((s) => s.isMapLocked);
  const setLoading = useUIStore((s) => s.setIsLoading);

  const menudispatch = useMenuStore((s) => s.dispatch);
  const menu = useMenuStore();
  const menuItems = useMenuStore((s) => s.menuItems);

  const isDrawing = useSelectionStore((s) => s.selection.kind === 'drawing');
  const isEditing = useSelectionStore((s) => s.selection.kind === 'editing');
  const isPlacing = useSelectionStore((s) => s.selection.kind === 'placing');
  const isConfirming = useSelectionStore((s) => s.selection.kind === 'confirming');
  const selectedItemId = useSelectionStore((s) => s.selection.kind ? s.selectedItemId : null);
  const selectedPaletteItem = useMenuItem(selectedItemId);
  const selectedObj = useSelectionStore((s) => s.selectedObj);
  const setSelectedObjId = useSelectionStore((s) => s.setSelectedObjId);
  const clearSelection = useSelectionStore((s) => s.clear);

  const items = useGardenStore(state => state.present.items);
  const selectedGardenItem = items.find(el => el.id === selectedObj?.id)
  const zoneObjects = useInteractiveZones();
  const selectedZone = zoneObjects.find(z => z.id === selectedObj?.id) || null
  const gdispatch = useGardenStore((s) => s.dispatch);

  const [naming, setNaming] = useState(false);
  const [propMenu, setPropMenu] = useState<GardenItem | InteractiveZone | null>(null);
  const [floatingLabel, setFloatingLabel] = useState<string | null>(null);
  const [floatingLabelPosition, setFloatingLabelPosition] = useState<{ x: number; y: number } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const lastPropMenuRef = useRef<GardenItem | InteractiveZone | null>(null);

  const matrix = useViewportStore((s) => s.matrix);

  const fabricCanvas = innerCanvasGridRef.current?.fabricCanvas;
  useCursorSync(fabricCanvas, naming);

  const { onCanvasClick } = useCanvasInteraction({
    onSelect: (obj) => {
      setPropMenu(obj);
      setSelectedObjId(obj.id);
    },
    onDeselect: () => {
      menudispatch({ type: 'HIDE_MENU', menu: 'picker' });
    }
  });

  const { initPlacement, confirmPlacement, confirmUpdate } = useGardenItem();
  const { confirmPlacement: confirmZoneCreation } = useGardenZone();
  const { onCanvasHover } = useCanvasInteraction({
    onHoverChange: (el) => {
      if (el && el.category === 'vegetation') {
        setFloatingLabel(el.displayName || el.id);
        setFloatingLabelPosition({ x: el.position.x, y: el.position.y });
      } else {
        setFloatingLabel(null);
        setFloatingLabelPosition(null); // 🧼 make sure to clear it!
      }
    }
  });

  const handleWorldClick = useCallback((x: number, y: number) => {
    log("2 - handleWorldClick triggered in GardenCanvas with coordinates: ", x, y)
    const col = Math.floor(x / CELL_SIZE);
    log("3 - Converted and stored to col: ", col)
    const row = Math.floor(y / CELL_SIZE);
    log("4 - Converted and stored to row: ", row)
    const cell = { col: col, row: row, color: selectedPaletteItem?.color };
    log("5 - Defined 'cell': ", cell);

    if (isDrawing && innerCanvasGridRef.current) {
      if (!isModifierKeyDown) {
        log('6 - 🖌️ Coloring cell at', col, row);
        log("7 - innerCanvasGridRef.current.colorCell is now called. ");
        innerCanvasGridRef.current.colorCell(cell);
        const fullCell: Cell = {
          col: col,
          row: row,
          color: cell.color ?? "",
          paletteId: selectedPaletteItem!.id
        };
        log('8 - 🧠 Adding fullCell to color buffer:', fullCell);
        colorBuffer.addCell(fullCell);
        return;
      } else {
        log("6 - Detected modifierkey down");
        log("7 - innerCanvasGridRef.current.uncolorCell is now called. ");
        innerCanvasGridRef.current.uncolorCell(col, row);
        log("8 - Erasing from color buffer: ", col, row);
        colorBuffer.clearCell(col, row);
        return;
      }
    }
    log("6 - Now triggering onCanvasClick with x and y: ", x, y)
    const ctx = innerCanvasGridRef.current?.colorCtx
    const target = onCanvasClick(x, y, ctx);
    if (target) log("7 - onCanvasClick yielded non-null target: ", target)
    if (!target && isPlacing) {
      const position: Vec2 = { x: col * CELL_SIZE, y: row * CELL_SIZE };
      log("7 - onCanvasClick yielded null target so calling place hook with position: ", position);
      initPlacement(position);
      if (selectedPaletteItem) {
        setNaming(true)
      };
    }
  }, [isDrawing, isModifierKeyDown, isPlacing, selectedPaletteItem, colorBuffer, onCanvasClick, initPlacement, setNaming]);

  const handleWorldMove = useCallback((x: number, y: number) => {
    setMousePos({ x, y });
    onCanvasHover(x, y); // ⬅️ still efficient — no state update unless hover actually changes

    if (!isMouseDown) return;

    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);
    const cell = { col: col, row: row, color: selectedPaletteItem?.color };

    if (isDrawing && innerCanvasGridRef.current) {
      if (!isModifierKeyDown) {
        log('6 - 🖌️ Coloring cell at', col, row);
        log("7 - innerCanvasGridRef.current.colorCell is now called. ");
        innerCanvasGridRef.current.colorCell(cell);
        const fullCell: Cell = {
          col: col,
          row: row,
          color: cell.color ?? "",
          paletteId: selectedPaletteItem!.id
        };
        log('8 - 🧠 Adding fullCell to color buffer:', fullCell);
        colorBuffer.addCell(fullCell);
        return;
      } else {
        log("6 - Detected modifierkey down");
        log("7 - innerCanvasGridRef.current.uncolorCell is now called. ");
        innerCanvasGridRef.current.uncolorCell(col, row);
        log("8 - Erasing from color buffer: ", col, row);
        colorBuffer.clearCell(col, row);
        return;
      }
    }
  }, [isDrawing, isModifierKeyDown, isMouseDown, selectedPaletteItem, colorBuffer, onCanvasHover]);

  const layers = useMemo((): CanvasLayer[] => {
    return activeLayers.map((layer) => ({
      name: layer,
      draw: (ctx) => {
        if (layer === 'items') {
          const cache = selectedObj ? null : imageCacheRef.current;

          items.forEach(el => {
            const iconSrc = el.icon

            let img = cache?.get(iconSrc);

            if (!img) {
              img = new Image();
              img.src = iconSrc;

              img.onload = () => {
                if (img) {
                  cache?.set(iconSrc, img);
                  ctx.drawImage(img!, el.position.x, el.position.y, el.width, el.height);
                }
              };

              cache?.set(iconSrc, img);
            } else {
              if (img.complete) {
                ctx.drawImage(img, el.position.x, el.position.y, el.width, el.height);
              }
            }

            if (el.id === selectedObj?.id) {
              ctx.globalAlpha = 0.3;
              ctx.strokeStyle = 'blue';
              ctx.lineWidth = 2;
              ctx.strokeRect(el.position.x, el.position.y, el.width, el.height);
            }
          });
        }
        if (layer === 'zones') {
          zoneObjects.forEach(zone => {
            const isSelected = zone.id === selectedObj?.id;
            ctx.drawZone(zone, isSelected);
          });
        }

      },
      deps: [selectedObj],
    }));
  }, [activeLayers, items, zoneObjects, selectedObj, isEditing]);

  useEffect(() => {
    let mounted = true;

    const initialLoad = async () => {
      try {
        if (mounted) {
          const items = await fetchItems();
          log('🌱 Initial items loaded:', items);
          gdispatch({ type: 'SET_ITEMS', items });
          const zones = await fetchZones();
          log('🌱 Initial zones loaded:', zones);
          gdispatch({ type: 'SET_ZONES', zones });
        }
      } catch (err) {
        error('🚨 Failed to load items', err);
      }
    };
    requestAnimationFrame(() => {
      initialLoad();
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const preloadImages = async () => {
      const uniqueIcons = [...new Set(menuItems.map(el => el.icon))];
        Promise.all(
          uniqueIcons.map(src => new Promise<void>((resolve) => {
            const img = new Image();
            img.src = src;
            img.onload = () => resolve();
            imageCacheRef.current.set(src, img);
          }))
        )
    };

    if (items.length > 0) {
      preloadImages();
    }
  }, [items]);

  return (
    <div style={{ position: 'relative' }}>
      <CanvasGrid
        ref={innerCanvasGridRef}
        layers={layers}
        selectedItem={!isMapLocked && selectedGardenItem ? selectedGardenItem : null}
        selectedZone={!isMapLocked && selectedZone ? selectedZone : null}
        onWorldClick={handleWorldClick}
        onWorldMove={handleWorldMove}
      />
      {floatingLabel && floatingLabelPosition && (
        <div
          style={{
            position: 'absolute',
            top: matrix!.a * mousePos.y + matrix!.f - 20,
            left: matrix!.a * mousePos.x + matrix!.e + 10,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '4px',
            pointerEvents: 'none',
            fontSize: '12px',
            zIndex: 1000,
            whiteSpace: 'nowrap'
          }}
        >
          {floatingLabel}
        </div>
      )}
      {naming && (
        <NameModal
          onPlacement={async (name) => {
            if (isPlacing) {
              log("10 - isPlacing, now calling await confirmPlacement(name) with name: ", name)
              await confirmPlacement(name);
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
      {menu.activeMenu === 'prop' &&
        propMenu &&
        selectedObj?.id === menu.propMenuObjectId && (
          <PropMenu
            data={propMenu}
            onUpdate={(updatedData) => {
              log("🔧 PropMenu updated item:", updatedData);
              setPropMenu((prev) => {
                const next =
                  prev && prev.id === selectedObj?.id
                    ? { ...prev, ...updatedData }
                    : prev;
                lastPropMenuRef.current = next;
                return next;
              });
              useSelectionStore.getState().setConfirming();
            }}
            onClose={() => menudispatch({ type: "HIDE_MENU", menu: "prop" })}
            fieldConfig={fieldConfig}
          />
        )}
      {isConfirming &&
        <UpdateModal
          onEditConfirm={(operation) => {
            useSelectionStore.getState().clear()
            if(lastPropMenuRef.current && lastPropMenuRef.current?.interface === 'GardenItem')
               confirmUpdate(lastPropMenuRef.current.id, lastPropMenuRef.current, operation)
          }
          }
          onEditAbort={() => {
            useSelectionStore.getState().clear();
          }}
        />
      }

    </div>
  );
});

GardenCanvas.displayName = 'GardenCanvas';
export default GardenCanvas;