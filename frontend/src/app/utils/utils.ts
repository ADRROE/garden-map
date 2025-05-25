const DEBUG = false; // Toggle this to false in production

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
): string[] => {
  const cells: string[] = [];
  for (let dx = 0; dx < widthInCells; dx++) {
    for (let dy = 0; dy < heightInCells; dy++) {
      const col = colStart + dx;
      const row = rowStart + dy;
      cells.push(`${toColumnLetter(col)}${row}`);
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

export const log = (...args: any[]) => {
  if (DEBUG) {
    console.log(...args);
  }
};

export const warn = (...args: any[]) => {
  if (DEBUG) {
    console.warn(...args);
  }
};

export const error = (...args: any[]) => {
  if (DEBUG) {
    console.error(...args);
  }
};