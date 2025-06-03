import React, {
  useState, useRef, useEffect, useMemo, forwardRef, useImperativeHandle,
  useCallback
} from 'react';
import CanvasGrid, { CanvasGridHandle } from './CanvasGrid';
import NameModal from './NameModal';
import { useGardenStore } from '../stores/useGardenStore';
import { CanvasLayer, ColoredCell, GardenElement, ElementType, Vec2 } from '../types';
import { useCanvasInteraction } from '../hooks/useCanvasInteraction';
import PropMenu from './PropMenu';
import { useSelectionStore } from '../stores/useSelectionStore';
import { useGardenElement } from '../hooks/useGardenElement';
import { fetchElements, fetchZones } from '../services/apiService';
import { useUIStore } from '../stores/useUIStore';
import { useColorBuffer } from '@/hooks/useColorBuffer';
import { useGardenZone } from '@/hooks/useGardenZone';
import { log, warn, error } from "@/utils/utils";
import {drawZone, makeZonePath} from '@/utils/DrawZone';
import { useViewportStore } from '@/stores/useViewportStore';
import UpdateModal from './UpdateModal';
import {GardenZoneObject} from './GardenZoneObject';
import { isGardenElement } from '@/utils/FabricHelpers';

const CELL_SIZE = 20;

const GardenCanvas = forwardRef<CanvasGridHandle, { colorBuffer: ReturnType<typeof useColorBuffer> }>(({ colorBuffer }, ref) => {
  const innerCanvasGridRef = useRef<CanvasGridHandle>(null);
  const isMouseDown = useSelectionStore(s => s.isMouseDown);
  const isModifierKeyDown = useSelectionStore(s => s.isModifierKeyDown);

  useImperativeHandle(ref, () => ({
    getTransformedElement: () => {
      return innerCanvasGridRef.current?.getTransformedElement() ?? null;
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
      log("innerCanvasGridRef.current?.getTransformedElement() as seen by GardenCanvas: ", innerCanvasGridRef.current?.getTransformedElement());

      // const updatedElement = innerCanvasGridRef.current?.getTransformedElement();
      // if (updatedElement) {
      //   log('14 - ✅ Calling updateElement from within GardenCanvas with updatedElement:', updatedElement);
      //   updateElement(updatedElement);
      //   log("15 - Clearing selection...")
      //   clearSelection();
      // }

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

  const activeLayers = useUIStore((s) => s.activeLayers);
  const uidispatch = useUIStore((s) => s.dispatch);
  const setLoading = useUIStore((s) => s.setIsLoading)

  const isDrawing = useSelectionStore((s) => s.selection.kind === 'drawing');
  const isEditing = useSelectionStore((s) => s.selection.kind === 'editing');
  const isPlacing = useSelectionStore((s) => s.selection.kind === 'placing');
  const isConfirming = useSelectionStore((s) => s.selection.kind === 'confirming');
  const selectedItem = useSelectionStore((s) => s.selection.kind ? s.selectedItem : null);
  const selectedElement = useSelectionStore((s) => s.selectedElement);
  const clearSelection = useSelectionStore((s) => s.clear);

  const elements = useGardenStore(state => state.present.elements);
  const zones = useGardenStore(state => state.present.zones);
  const gdispatch = useGardenStore((s) => s.dispatch);
  const updateElement = useGardenStore((s) => s.updateElement);

  const [naming, setNaming] = useState(false);
  const [propMenu, setPropMenu] = useState<GardenElement | GardenZoneObject | null>(null);
  const [propMenuPosition, setPropMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [floatingLabel, setFloatingLabel] = useState<string | null>(null);
  const [floatingLabelPosition, setFloatingLabelPosition] = useState<{ x: number; y: number } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const zonePathCache = useRef<Map<string, Path2D>>(new Map());;
  const lastPropMenuRef = useRef<GardenElement | null>(null);


  const matrix = useViewportStore((s) => s.matrix);

  const fabricCanvas = innerCanvasGridRef.current?.fabricCanvas;
  const menuItem = useSelectionStore((s) => s.selection.kind === 'placing' ? s.selection.menuItem : null);
  const cursorImage = menuItem?.cursor;

  const { onCanvasClick } = useCanvasInteraction({
    onSelect: (el) => {
      setPropMenu(el);
      if (isGardenElement(el)) setPropMenuPosition({ x: el.x, y: el.y });
    },
    onDeselect: () => {
      setPropMenu(null);
      setPropMenuPosition(null);
      uidispatch({ type: 'HIDE_SIDEBAR' })
    }
  });

  const { place: placeElementAt, confirmPlacement: confirmElementPlacement } = useGardenElement();
  const { confirmPlacement: confirmZoneCreation } = useGardenZone();
  const { onCanvasHover } = useCanvasInteraction({
    onHoverChange: (el) => {
      if (el && isGardenElement(el)) {
        setFloatingLabel(el.name || el.id);
        setFloatingLabelPosition({ x: el.x, y: el.y });
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
    const cell = { col: col, row: row, color: selectedItem?.metadata?.brushColor };
    log("5 - Defined 'cell': ", cell);

    if (isDrawing && innerCanvasGridRef.current) {
      if (!isModifierKeyDown) {
        log('6 - 🖌️ Coloring cell at', col, row);
        log("7 - innerCanvasGridRef.current.colorCell is now called. ");
        innerCanvasGridRef.current.colorCell(cell);
        const fullCell: ColoredCell = {
          col: col,
          row: row,
          color: cell.color ?? "",
          menuElementId: selectedItem!.id
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
    const target = onCanvasClick(x, y);
    if (target) log("7 - onCanvasClick yielded non-null target: ", target)
    if (!target && isPlacing) {
      const position: Vec2 = { x: col * CELL_SIZE, y: row * CELL_SIZE };
      log("7 - onCanvasClick yielded null target so calling place hook with position: ", position);
      placeElementAt(position);
      if (selectedItem) setNaming(true);
    }
  }, [isDrawing, isModifierKeyDown, isPlacing, selectedItem, colorBuffer, onCanvasClick, placeElementAt, setNaming]);

  const handleWorldMove = useCallback((x: number, y: number) => {
    setMousePos({ x, y });
    onCanvasHover(x, y); // ⬅️ still efficient — no state update unless hover actually changes

    if (!isMouseDown) return;

    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);
    const cell = { col: col, row: row, color: selectedItem?.metadata?.brushColor };

    if (isDrawing && innerCanvasGridRef.current) {
      if (!isModifierKeyDown) {
        log('6 - 🖌️ Coloring cell at', col, row);
        log("7 - innerCanvasGridRef.current.colorCell is now called. ");
        innerCanvasGridRef.current.colorCell(cell);
        const fullCell: ColoredCell = {
          col: col,
          row: row,
          color: cell.color ?? "",
          menuElementId: selectedItem!.id
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
  }, [isDrawing, isModifierKeyDown, isMouseDown, selectedItem, colorBuffer, onCanvasHover]);

const zonePaths = useMemo(() => {
  const map = zonePathCache.current;
  zones.forEach(zone => {
    const path = makeZonePath(zone);
    map.set(zone.id, path);
  });
  return map;
}, [zones]);

const zoneObjects = useMemo((): GardenZoneObject[] => {
  return zones.map((zone) => ({
    zone,
    path: makeZonePath(zone),
  }));
}, [zones]);

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
          zones.forEach(zone => drawZone(ctx, zone, zonePaths));
        }
      },
      deps: [selectedElement],
    }));
  }, [activeLayers, elements, zones, selectedElement, isEditing]);

  useEffect(() => {
    let mounted = true;

    const initialLoad = async () => {
      try {
        if (mounted) {
          const elements = await fetchElements();
          log('🌱 Initial elements loaded:', elements);
          gdispatch({ type: 'SET_ELEMENTS', elements });
          const zones = await fetchZones();
          log('🌱 Initial zones loaded:', zones);
          gdispatch({ type: 'SET_ZONES', zones });
        }
      } catch (err) {
        error('🚨 Failed to load elements', err);
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
        if (!fabricCanvas) return;
  
        if (cursorImage && !naming) {
          const img = new Image();
          img.src = cursorImage;
  
          img.onload = () => {
            const cursorUrl = `url(${cursorImage}) 16 16, auto`;
            useUIStore.getState().dispatch({ type: 'SET_CURSOR', cursor: cursorUrl })
          };
  
          img.onerror = () => {
            warn("Failed to load cursor image:", cursorImage);
            useUIStore.getState().dispatch({ type: 'SET_CURSOR', cursor: "crosshair" })
  
          };
  
        } else {
          useUIStore.getState().dispatch({ type: 'SET_CURSOR', cursor: "default" })
        }
      }, [menuItem, naming]);
  
      useEffect(() => {
        const unsubscribe = useUIStore.subscribe((state) => {
          const cursor = state.cursor
          // 1. Apply to body
          document.body.style.cursor = cursor;
  
          // 2. Apply to fabric canvas if initialized
          if (fabricCanvas) {
            fabricCanvas.defaultCursor = cursor;
  
            // Also apply to the DOM element if needed
            const el = fabricCanvas.getElement?.();
            if (el) el.style.cursor = cursor;
          }
        });
  
        return () => {
          unsubscribe();
        };
      }, [cursorImage]);
  

  useEffect(() => {
    const preloadImages = async () => {
      const uniqueIcons = [...new Set(elements.map(el => el.icon))];

      (() =>
        Promise.all(
          uniqueIcons.map(src => new Promise<void>((resolve) => {
            const img = new Image();
            img.src = src;
            img.onload = () => resolve();
            imageCacheRef.current.set(src, img);
          }))
        )
      );
    };

    if (elements.length > 0) {
      preloadImages();
    }
  }, [elements]);

  return (
    <div style={{ position: 'relative' }}>
      <CanvasGrid
        ref={innerCanvasGridRef}
        layers={layers}
        selectedElement={selectedElement}
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
              setPropMenu((prev) => {
                const next = prev && prev.id === updatedData.id
                  ? { ...prev, ...updatedData }
                  : prev;
                lastPropMenuRef.current = next;
                return next;
              });
              useSelectionStore.getState().setConfirming();
            }}
            onClose={() => setPropMenu(null)}
          />

        </div>
      )}
      {isConfirming &&
        <UpdateModal
          onEditConfirm={(operation) => {
            console.log("UpdateModal onEditConfirm in GardenCanvas with args: ", lastPropMenuRef.current, operation)
            return lastPropMenuRef.current && updateElement(lastPropMenuRef.current, operation)
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