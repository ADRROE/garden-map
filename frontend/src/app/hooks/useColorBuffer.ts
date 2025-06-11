// hooks/useColorBuffer.ts
import { useRef } from 'react';
import { Cell } from '../types';
import { log } from '@/utils/utils';

export function useColorBuffer() {
  const bufferRef = useRef<Record<string, Cell>>({});

  const getKey = (col: number, row: number) => `${col},${row}`;

  const addCell = (cell: Cell) => {
    const key = getKey(cell.col, cell.row);
    bufferRef.current[key] = cell;
    log('🧩 [useColorBuffer] - addCell:', key, cell);
    log('📦 [useColorBuffer] - Buffer after addCell:', { ...bufferRef.current });
  };

  const getCells = (): Record<string, Cell> => {
    log(' [useColorBuffer] - 🧪 getCells() called — current buffer:', { ...bufferRef.current });
    return { ...bufferRef.current };
  };

  const clearCell = (col: number, row: number) => {
  const key = getKey(col, row);
  const newBuffer = { ...bufferRef.current };
  delete newBuffer[key];
  bufferRef.current = newBuffer;
  }

  const clearCells = () => {
    log(' [useColorBuffer] - 🗑️ clearCells() called — clearing buffer');
    bufferRef.current = {};
  };

  return {
    addCell,
    getCells,
    clearCell,
    clearCells,
  };
}