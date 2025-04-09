const toColumnLetter = (col: number): string => {
    let letter = '';
    while (col >= 0) {
      letter = String.fromCharCode((col % 26) + 65) + letter;
      col = Math.floor(col / 26) - 1;
    }
    return letter;
  };

export const translatePosition = (x: number, y: number) => {
    const col = Math.floor((x-20)/20)+1;
    const row = (Math.floor((y-20)/20)+2).toString();

    return `${toColumnLetter(col)}${row}`
};