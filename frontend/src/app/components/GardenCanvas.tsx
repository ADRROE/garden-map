import React, { useState, useRef, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react';
import CanvasGrid, { CanvasGridHandle } from './CanvasGrid';
import NameModal from './NameModal';
import { useGardenStore } from '../stores/useGardenStore';
import { CanvasLayer, GardenElement, Vec2 } from '../types';
import { useCanvasInteraction } from '../hooks/useCanvasInteraction';
import PropMenu from './PropMenu';
import { useSelectionStore } from '../stores/useSelectionStore';
import { useElementPlacement } from '../hooks/useElementPlacement';
import { fetchElements } from '../services/apiService';
import { useUIStore } from '../stores/useUIStore';

const CELL_SIZE = 20

const GardenCanvas = forwardRef<CanvasGridHandle, object>((props, ref) => {
  const canvasGridRef = useRef<CanvasGridHandle>(null);

  useImperativeHandle(ref, () => ({
    getTransformedElement: () => {
      return canvasGridRef.current?.getTransformedElement() ?? null;
    },
  }));

  const { activeLayers } = useUIStore();

  const selectedItem = useSelectionStore((s) => s.selection.kind === 'placing' ? s.selection.menuItem : null);
  const selectedElement = useSelectionStore((s) => s.selection.kind === 'editing' ? s.selection.element : null);
  const clearSelection = useSelectionStore((s) => s.clear);

  const elements = useGardenStore(state => state.present.elements);
  // const isEditing = useSelectionStore((s) => s.selection.kind === 'editing');
  const dispatch = useGardenStore((s) => s.dispatch);

  // const isPlacing = useSelectionStore((s) => s.isPlacing) <<< OPTIE 1
  // const isPlacing = useSelectionStore((s) => s.selection.kind === 'placing') <<< OPTIE 2

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
      //clearSelection();
    }
  });

  const { handleCellClick, confirmPlacement } = useElementPlacement();

  const handleWorldClick = (x: number, y: number) => {
    const target = onCanvasClick(x, y);
    if (!target){
      const col = Math.floor(x / CELL_SIZE);
      const row = Math.floor(y / CELL_SIZE);
      const position: Vec2 = { x: col * CELL_SIZE, y: row * CELL_SIZE };
      handleCellClick(position);
      if (selectedItem)
        setNaming(true)
  };}

  const layers = useMemo((): CanvasLayer[] => {
    return activeLayers.map((layer) => ({
      name: layer,
      draw: (ctx) => {
        if (layer === 'elements') {
          const cache = selectedElement ? null : imageCacheRef.current;

          elements.forEach(el => {
            const iconSrc = el.icon;

            // Try getting from cache
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

            // Fallback stroke (while loading or always visible)
            ctx.strokeStyle = 'rgba(0, 128, 0, 0.5)';
            ctx.strokeRect(el.x, el.y, el.width, el.height);

            // 🔵 Highlight if selected
            if (el.id === selectedElement?.id) {
              ctx.globalAlpha = 0.3;
              ctx.strokeStyle = 'blue';
              ctx.lineWidth = 2;
              ctx.strokeRect(el.x, el.y, el.width, el.height);
            }
          });
        }
      },
      deps: [selectedElement]
    }));
  }, [activeLayers, elements, selectedElement]);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearSelection(); // Clear selection
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
          dispatch({ type: 'SET_ELEMENTS', elements });
        }
      } catch (err) {
        console.error("Failed to load elements", err);
      }
    };

    initialLoad();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <CanvasGrid
        ref={canvasGridRef}
        layers={layers}
        selectedElement={selectedElement}
        onWorldClick={handleWorldClick}
        onEditConfirm={(updatedEl) => {
          dispatch({ type: 'UPDATE_ELEMENT', id: updatedEl.id, updates: updatedEl });
          clearSelection(); // or set mode = 'idle'
        }}
      />
      {naming && (
        <NameModal
          onPlacement={async (name) => {
            await confirmPlacement(name);
            setNaming(false)
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
            top: Math.min(propMenuPosition.y, window.innerHeight - 200), // clamp if too close to bottom
            left: Math.min(propMenuPosition.x, window.innerWidth - 300), // clamp if too close to right
            zIndex: 1000,
          }}
        >
          <PropMenu
            element={propMenu}
            onUpdate={(updatedData) => {
              // updateElement(updatedData);
              // also update local state if needed
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

GardenCanvas.displayName = 'GardenCanvas'; // ✅ to avoid eslint warning

export default GardenCanvas;
