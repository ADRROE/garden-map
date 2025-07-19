from typing import List, Union
from app import schemas

def to_column_letter(col: int) -> str:
    letter = ''
    while col >= 0:
        letter = chr((col % 26) + 65) + letter
        col = (col // 26) - 1
    return letter

def calculate_location(x: float, y: float, cell_size: int = 20) -> str:
    col = int(x // cell_size) + 1
    row = int(y // cell_size) + 1
    return f"{to_column_letter(col)}{row}"

def get_covered_cells(x: float, y: float, width: float, height: float, cell_size: int = 20) -> list[tuple[int, int]]:
    col_start = int(x // cell_size) + 1
    row_start = int(y // cell_size) + 1
    cols = int(width // cell_size)
    rows = int(height // cell_size)
    return [
        (col_start + dx, row_start + dy)
        for dx in range(cols)
        for dy in range(rows)
    ]

def serialize_cells(cells: List[Union[dict, 'schemas.Cell']]) -> List[str]:
    """Convert list of cells to Excel-style cell references (e.g. 'B3')."""
    return [f"{to_column_letter(cell.col)}{cell.row}" for cell in cells]