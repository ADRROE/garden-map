import React, { useState, useRef, useMemo } from 'react';
import CanvasGrid from './CanvasGrid';
import NameModal from './NameModal';
import { useGardenStore } from '@/hooks/useGardenStore';
import { useGardenLayer } from '@/contexts/GardenLayerContext';
import { CanvasLayer, GardenElement } from '@/types';
import { isGardenElement } from '@/utils/FabricHelpers';
import { useCanvasInteraction } from '@/hooks/useCanvasInteraction';
import PropMenu from './PropMenu';

const CELL_SIZE = 20;

export default function GardenCanvas() {
  const datastate = useGardenStore(state => state.present)
  const datadispatch = useGardenStore(state => state.dispatch)
  const placeElement = useGardenStore(state => state.placeElement)
  const { layerstate } = useGardenLayer();

  const [naming, setNaming] = useState(false);
  const [propMenu, setPropMenu] = useState<GardenElement | null>(null);
  const [propMenuPosition, setPropMenuPosition] = useState<{ x: number; y: number } | null>(null);

  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  const { onCanvasClick } = useCanvasInteraction({
    onSelect: (el) => {
      setPropMenu(el);
      setPropMenuPosition({ x: el.x, y: el.y });
      document.body.style.cursor = 'pointer';
    },
    onDeselect: () => {
      setPropMenu(null);
      setPropMenuPosition(null);
      document.body.style.cursor = 'default';
    }
  });

  const handleWorldClick = (x: number, y: number) => {
    const clicked = onCanvasClick(x, y);
    if (!clicked) {
      const col = Math.floor(x / CELL_SIZE);
      const row = Math.floor(y / CELL_SIZE);
      handleCellClick(row, col);
    }
  };

  const handleCellClick = (row: number, col: number) => {
    if (datastate.selectedElement && !isGardenElement(datastate.selectedElement)) {
      datadispatch({
        type: 'SET_PENDING_POSITION',
        pos: { x: col * CELL_SIZE, y: row * CELL_SIZE },
        subject: 'element',
      });
      setNaming(true);
    } else {
      datadispatch({ type: 'SET_SELECTED_ELEMENT', element: null });
      setPropMenu(null);
      setPropMenuPosition(null);
    }
  };

  const layers = useMemo((): CanvasLayer[] => {
    return layerstate.visibleLayers.map((layer) => ({
      name: layer,
      draw: (ctx) => {
        if (layer === 'elements') {
          const elements = datastate.elements;
          const cache = imageCacheRef.current;

          elements.forEach(el => {
            const iconSrc = el.icon;

            // Try getting from cache
            let img = cache.get(iconSrc);

            if (!img) {
              img = new Image();
              img.src = iconSrc;

              img.onload = () => {
                if (img) {
                  cache.set(iconSrc, img);
                  ctx.drawImage(img!, el.x, el.y, el.width, el.height);
                }
              };

              cache.set(iconSrc, img);
            } else {
              if (img.complete) {
                ctx.drawImage(img, el.x, el.y, el.width, el.height);
              }
            }

            // Fallback stroke (while loading or always visible)
            ctx.strokeStyle = 'rgba(0, 128, 0, 0.5)';
            ctx.strokeRect(el.x, el.y, el.width, el.height);

            // 🔵 Highlight if selected
            if (el.id === datastate.selectedElement?.id) {
              ctx.strokeStyle = 'blue';
              ctx.lineWidth = 2;
              ctx.strokeRect(el.x, el.y, el.width, el.height);
            }
          });
        }
      },
      deps: [datastate.selectedElement]
    }));
  }, [layerstate.visibleLayers, datastate.elements, datastate.selectedElement]);

  return (
    <div style={{ position: 'relative' }}>
      <CanvasGrid
        scale={datastate.scale}
        setScale={(s: number) => datadispatch({ type: 'SET_SCALE', scale: s })}
        layers={layers}  // Pass the CanvasLayer objects to CanvasGrid
        onWorldClick={handleWorldClick}
      />
      {naming && (
        <NameModal
          onPlacement={async (name) => {
            await placeElement(name);
            setNaming(false);
          }}
          onAbort={() => {
            datadispatch({ type: 'SET_PENDING_POSITION', pos: null, subject: null });
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
}