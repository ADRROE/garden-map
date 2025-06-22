from typing import List, Union
from app import schemas

def to_column_letter(n: int) -> str:
    """Convert a 1-based column number to Excel-style letters (1 -> A, 27 -> AA)."""
    result = ""
    while n > 0:
        n, remainder = divmod(n - 1, 26)
        result = chr(65 + remainder) + result
    return result

def serialize_cells(cells: List[Union[dict, 'schemas.Cell']]) -> List[str]:
    """Convert list of cells to Excel-style cell references (e.g. 'B3')."""
    return [f"{to_column_letter(cell.col)}{cell.row}" for cell in cells]