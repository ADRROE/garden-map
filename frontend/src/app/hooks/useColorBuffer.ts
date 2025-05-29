// hooks/useColorBuffer.ts
import { useRef } from 'react';
import { ColoredCell } from '../types';
import { log } from '@/utils/utils';

export function useColorBuffer() {
  const bufferRef = useRef<Record<string, ColoredCell>>({});

  const getKey = (col: number, row: number) => `${col},${row}`;

  const addCell = (cell: ColoredCell) => {
    const key = getKey(cell.col, cell.row);
    bufferRef.current[key] = cell;
    log('🧩 [useColorBuffer] - addCell:', key, cell);
    log('📦 [useColorBuffer] - Buffer after addCell:', { ...bufferRef.current });
  };

  const getCells = (): Record<string, ColoredCell> => {
    log(' [useColorBuffer] - 🧪 getCells() called — current buffer:', { ...bufferRef.current });
    return { ...bufferRef.current };
  };

  const clearCells = () => {
    log(' [useColorBuffer] - 🗑️ clearCells() called — clearing buffer');
    bufferRef.current = {};
  };

  return {
    addCell,
    getCells,
    clearCells,
  };
}