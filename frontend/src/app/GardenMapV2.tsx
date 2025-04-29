import React, { useRef, useEffect, useState } from 'react';

const NUM_ROWS = 100;
const NUM_COLS = 100;
const CELL_SIZE = 10;

type Grid = boolean[][];

const createEmptyGrid = (): Grid =>
  Array.from({ length: NUM_ROWS }, () =>
    Array.from({ length: NUM_COLS }, () => false)
  );

const GardenMapV2: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [grid, setGrid] = useState<Grid>(createEmptyGrid());
  const [isPainting, setIsPainting] = useState(false);

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, NUM_COLS * CELL_SIZE, NUM_ROWS * CELL_SIZE);
    for (let row = 0; row < NUM_ROWS; row++) {
      for (let col = 0; col < NUM_COLS; col++) {
        ctx.fillStyle = grid[row][col] ? 'green' : 'white';
        ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        ctx.strokeStyle = '#ccc';
        ctx.strokeRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    drawGrid(ctx);
  }, [grid]);

  const toggleCell = (x: number, y: number) => {
    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);

    if (col < 0 || col >= NUM_COLS || row < 0 || row >= NUM_ROWS) return;

    setGrid(prev => {
      const newGrid = prev.map(row => [...row]);
      newGrid[row][col] = true;
      return newGrid;
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPainting(true);
    const { offsetX, offsetY } = e.nativeEvent;
    toggleCell(offsetX, offsetY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPainting) return;
    const { offsetX, offsetY } = e.nativeEvent;
    toggleCell(offsetX, offsetY);
  };

  const handleMouseUp = () => {
    setIsPainting(false);
  };

  return (
    <canvas
      ref={canvasRef}
      width={NUM_COLS * CELL_SIZE}
      height={NUM_ROWS * CELL_SIZE}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ border: '1px solid black', cursor: 'crosshair' }}
    />
  );
};

export default GardenMapV2;
