// components/GardenMap.tsx
import React, { useState, useMemo } from 'react';
import CanvasGrid from './CanvasGrid';
import NameModal from './NameModal';
import { useGarden } from '../context/GardenContext';
import { CanvasLayer } from '@/types';

export default function GardenMap() {
  const { state, dispatch, placeElement } = useGarden();
  const [naming, setNaming]            = useState(false);

const CELL_SIZE = 20;


  const layers = useMemo<CanvasLayer[]>(() => [
    {
      name: 'background',
      deps: [],
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      draw: bgCtx => {}
    },
    {
      name: 'elements',
      deps: [state.elements],
      draw: (elCtx: CanvasRenderingContext2D) => {
        state.elements.forEach(el => {
          const img = new Image();
          img.src = el.icon;
          img.onload = () => elCtx.drawImage(img, el.x, el.y, el.width, el.height);
        });
      },
    },
    {
      name: 'zones',
      deps: [state.zones],
      draw: zoneCtx => {
        zoneCtx.fillStyle = 'green';
        state.zones.forEach(key => {
          const [r, c] = key.split(',').map(Number);
          zoneCtx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        });
      },
    },
  ], [state.elements, state.zones]);

  const handleCellClick = (row: number, col: number) => {
    dispatch({
      type: 'SET_PENDING_POSITION',
      pos:{x: col * CELL_SIZE, y: row * CELL_SIZE},
      subject: 'element',
    });
    setNaming(true);
  };

  return (
    <div className="relative w-full h-full">
      <CanvasGrid
        scale={state.scale}
        setScale={(s: number) => dispatch({ type:'SET_SCALE', scale: s })}
        layers={layers}
        onGridClick={handleCellClick}
      />

      {/* open naming when pendingPosition set */}
      {naming && (
        <NameModal
          onPlacement={async (name) => {
            await placeElement(name);
            setNaming(false);
          }}
          onAbort={() => {
            dispatch({ type:'SET_PENDING_POSITION', pos: null, subject: null });
            setNaming(false);
          }}
        />
      )}
    </div>
  );
}
