import { Cell } from "@/types";

const DEBUG = true; // Toggle this to false in production

export const screenToWorld = (
  x: number,
  y: number,
  transform: DOMMatrix
) => {
  const inv = transform.inverse(); // be sure this is stable
  const point = new DOMPoint(x, y).matrixTransform(inv);
  return { x: point.x, y: point.y };
};

export const worldToScreen = (
  x: number,
  y: number,
  transform: DOMMatrix
) => {
  const point = new DOMPoint(x, y).matrixTransform(transform);
  return { x: point.x, y: point.y };
};

export const zoomMatrix = (matrix: DOMMatrix, factor: number, center: { x: number, y: number }) => {
  return matrix
    .translate(center.x, center.y)
    .scale(factor)
    .translate(-center.x, -center.y);
};

export const panMatrix = (matrix: DOMMatrix, dx: number, dy: number) => {
  return matrix.translate(dx, dy);
};

export function constrainMatrix(
  matrix: DOMMatrix,
  bounds: { width: number; height: number },
  viewport: { width: number; height: number }
): DOMMatrix {
  const scale = matrix.a; // assume uniform scale (same for x/y)
  let tx = matrix.e;
  let ty = matrix.f;

  const scaledWidth = bounds.width * scale;
  const scaledHeight = bounds.height * scale;

  const maxX = 0;
  const minX = viewport.width - scaledWidth;
  const maxY = 0;
  const minY = viewport.height - scaledHeight;

  // clamp tx, ty
  tx = Math.min(maxX, Math.max(minX, tx));
  ty = Math.min(maxY, Math.max(minY, ty));

  // return a new constrained matrix
  const constrained = new DOMMatrix([matrix.a, matrix.b, matrix.c, matrix.d, tx, ty]);
  return constrained;
}

export function domMatrixToValues(m: DOMMatrix) {
  return {
    a: m.a,
    b: m.b,
    c: m.c,
    d: m.d,
    e: m.e,
    f: m.f,
  };
}

export const toColumnLetter = (col: number): string => {
  let letter = '';
  while (col >= 0) {
    letter = String.fromCharCode((col % 26) + 65) + letter;
    col = Math.floor(col / 26) - 1;
  }
  return letter;
};

export const getCoveredCells = (
  colStart: number,
  rowStart: number,
  widthInCells: number,
  heightInCells: number
): Cell[] => {
  const cells: Cell[] = [];
  for (let dx = 0; dx < widthInCells; dx++) {
    for (let dy = 0; dy < heightInCells; dy++) {
      cells.push({
        col: colStart + dx,
        row: rowStart + dy,
      });
        }
  }
  return cells;
};

export const translatePosition = (x: number, y: number) => {

  const cellSize = 20;
  const col = Math.floor((x - cellSize)) + 1;
  const row = Math.floor((y - cellSize)) + 2;

  return [col, row]
};


export const capitalizeFirstLetter = (str: string) => {
  return str[0].toUpperCase() + str.slice(1);
};

export function darkenColor(hex: string, amount = 0.5): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.floor(((num >> 16) & 255) * amount);
  const g = Math.floor(((num >> 8) & 255) * amount);
  const b = Math.floor((num & 255) * amount);
  return `rgb(${r}, ${g}, ${b})`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const log = (...args: any[]) => {
  if (DEBUG) {
    console.log(...args);
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const warn = (...args: any[]) => {
  if (DEBUG) {
    console.warn(...args);
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const error = (...args: any[]) => {
  if (DEBUG) {
    console.error(...args);
  }
};