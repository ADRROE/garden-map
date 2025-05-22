// hooks/useColorBuffer.ts
import { useRef } from 'react';
import { ColoredCell } from '../types';

export function useColorBuffer() {
  const bufferRef = useRef<Record<string, ColoredCell>>({});

  const getKey = (x: number, y: number) => `${x},${y}`;

  const addCell = (cell: ColoredCell) => {
    const key = getKey(cell.x, cell.y);
    bufferRef.current[key] = cell;
    console.log('🧩 addCell:', key, cell);
    console.log('📦 Buffer after addCell:', { ...bufferRef.current });
  };

  const getCells = (): Record<string, ColoredCell> => {
    console.log('🧪 getCells() called — current buffer:', { ...bufferRef.current });
    return { ...bufferRef.current };
  };

  const clearCells = () => {
    console.log('🗑️ clearCells() called — clearing buffer');
    bufferRef.current = {};
  };

  return {
    addCell,
    getCells,
    clearCells,
  };
}