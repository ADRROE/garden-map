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

  const cellSize = 19.5;
  const col = Math.floor((x - cellSize) / cellSize) + 1;
  const row = Math.floor((y - cellSize) / cellSize) + 2;

  console.log(`Translated position: ${col}, ${row}`);

  return [col, row]
};



export const capitalizeFirstLetter = (str: string) => {
  return str[0].toUpperCase() + str.slice(1);
};