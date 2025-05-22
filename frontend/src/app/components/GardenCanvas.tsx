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
import { fetchElements } from '../services/apiService';
import { useUIStore } from '../stores/useUIStore';
import { useColorBuffer } from '@/hooks/useColorBuffer';

const CELL_SIZE = 20;

const GardenCanvas = forwardRef<CanvasGridHandle, { colorBuffer: ReturnType<typeof useColorBuffer> }>(({colorBuffer}, ref) => {
  const canvasGridRef = useRef<CanvasGridHandle>(null);

  useImperativeHandle(ref, () => ({
    getTransformedElement: () => {
      return canvasGridRef.current?.getTransformedElement() ?? null;
    },
    colorCell: (cell) => {
      console.log('🎨 Imperative colorCell called with:', cell);
      canvasGridRef.current?.colorCell(cell);
      colorBuffer.addCell(cell);
    },
    clearColoring: () => {
      console.log('🧼 clearColoring called');
      canvasGridRef.current?.clearColoring();
    },
  }));

  const { activeLayers } = useUIStore();
  const uidispatch = useUIStore((s) => s.dispatch);

  const isDrawing = useSelectionStore((s) => s.selection.kind === 'drawing');
  const selectedItem = useSelectionStore((s) => s.selection.kind === 'placing' ? s.selection.menuItem : null);
  const selectedElement = useSelectionStore((s) => s.selection.kind === 'editing' ? s.selection.element : null);
  const clearSelection = useSelectionStore((s) => s.clear);

  const elements = useGardenStore(state => state.present.elements);
  const gdispatch = useGardenStore((s) => s.dispatch);
  const updateElement = useGardenStore((s) => s.updateElement);

  const [naming, setNaming] = useState(false);
  const [propMenu, setPropMenu] = useState<GardenElement | null>(null);
  const [propMenuPosition, setPropMenuPosition] = useState<{ x: number; y: number } | null>(null);

  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  const { onCanvasClick } = useCanvasInteraction({
    onSelect: (el) => {
      setPropMenu(el);
      setPropMenuPosition({ x: el.x, y: el.y });
    },
    onDeselect: () => {
      setPropMenu(null);
      setPropMenuPosition(null);
      clearSelection();
      uidispatch({type: 'TOGGLE_SIDEBAR'})
    }
  });

  const { placeElementAt, confirmPlacement } = useGardenElement();

  const handleWorldClick = (x: number, y: number) => {
    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);
    const cell = { x: col, y: row, color: 'black' };

    if (isDrawing && canvasGridRef.current) {
      console.log('🖌️ Drawing mode — coloring cell at', col, row);
      canvasGridRef.current.colorCell(cell);

      const fullCell: ColoredCell = {
        x: col,
        y: row,
        color: cell.color,
        menuElementId: 'placeholdermenuelementid',
        zoneId: 'placeholderzoneid',
      };

      console.log('🧠 Adding to color buffer:', fullCell);
      colorBuffer.addCell(fullCell);

      return;
    }

    const target = onCanvasClick(x, y);
    if (!target) {
      const position: Vec2 = { x: col * CELL_SIZE, y: row * CELL_SIZE };
      placeElementAt(position);
      if (selectedItem) setNaming(true);
    }
  };

  const handleEditConfirm = () => {
    const updatedElement = canvasGridRef.current?.getTransformedElement();
    if (updatedElement) {
      console.log('✅ Confirming element update:', updatedElement);
      updateElement(updatedElement);
      clearSelection();
    }

    const coloredCells = colorBuffer.getCells();
    console.log('📦 Colored cells to dispatch:', coloredCells);

    if (Object.keys(coloredCells).length > 0) {
      gdispatch({ type: 'SET_COLORED_CELLS', coloredCells });
    } else {
      console.warn('⚠️ No colored cells found in buffer');
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

            ctx.strokeStyle = 'rgba(0, 128, 0, 0.5)';
            ctx.strokeRect(el.x, el.y, el.width, el.height);

            if (el.id === selectedElement?.id) {
              ctx.globalAlpha = 0.3;
              ctx.strokeStyle = 'blue';
              ctx.lineWidth = 2;
              ctx.strokeRect(el.x, el.y, el.width, el.height);
            }
          });
        }
      },
      deps: [selectedElement],
    }));
  }, [activeLayers, elements, selectedElement]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        console.log('🔚 Escape key pressed — clearing selection');
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
        const elements = await fetchElements();
        if (mounted) {
          console.log('🌱 Initial elements loaded:', elements);
          gdispatch({ type: 'SET_ELEMENTS', elements });
        }
      } catch (err) {
        console.error('🚨 Failed to load elements', err);
      }
    };

    initialLoad();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (selectedElement?.color) return useSelectionStore.getState().setDrawing(selectedElement.color)
  }, [selectedElement])

  return (
    <div style={{ position: 'relative' }}>
      <CanvasGrid
        ref={canvasGridRef}
        layers={layers}
        selectedElement={selectedElement}
        onWorldClick={handleWorldClick}
        onEditConfirm={handleEditConfirm}
      />
      {naming && (
        <NameModal
          onPlacement={async (name) => {
            await confirmPlacement(name);
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
              console.log('🔧 PropMenu updated element:', updatedData);
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