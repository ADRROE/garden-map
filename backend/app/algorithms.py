from typing import List, Dict, Tuple, Set
from collections import deque
import uuid
from app.schemas import ColoredCell, GardenZone

def group_cells_into_zones(cells: List[ColoredCell]) -> List[GardenZone]:
    # Index the cells by their (col, row) coordinates
    cell_map: Dict[Tuple[int, int], ColoredCell] = {
        (int(cell.col), int(cell.row)): cell for cell in cells
    }

    visited: Set[Tuple[int, int]] = set()
    zones: List[GardenZone] = []

    def bfs(start_pos: Tuple[int, int]) -> Tuple[List[ColoredCell], Set[Tuple[Tuple[int, int], Tuple[int, int]]]]:
        queue = deque([start_pos])
        group = []
        borders = set()
        visited.add(start_pos)
        base_cell = cell_map[start_pos]

        # Directions and their associated border line segments
        directions = {
            (-1, 0): lambda x, y: ((x, y), (x, y + 1)),          # left
            (1, 0):  lambda x, y: ((x + 1, y), (x + 1, y + 1)),  # right
            (0, -1): lambda x, y: ((x, y), (x + 1, y)),          # top
            (0, 1):  lambda x, y: ((x + 1, y + 1), (x, y + 1))   # bottom
        }

        while queue:
            x, y = queue.popleft()
            current_cell = cell_map[(x, y)]
            group.append(current_cell)

            # Check 4-directional neighbors
            for dx, dy in directions:
                nx, ny = x + dx, y + dy
                neighbor_pos = (nx, ny)
                border_line = directions[(dx, dy)](x, y)

                if neighbor_pos not in cell_map:
                    borders.add(border_line)
                else:
                    neighbor_cell = cell_map[neighbor_pos]
                    if (
                        neighbor_cell.color != base_cell.color or
                        neighbor_cell.menuElementId != base_cell.menuElementId
                    ):
                        borders.add(border_line)
                    elif neighbor_pos not in visited:
                        visited.add(neighbor_pos)
                        queue.append(neighbor_pos)

        return group, borders
    
    for pos in cell_map:
        if pos not in visited:
            group, borders = bfs(pos)
            zone = GardenZone(
                id=str(uuid.uuid4()),
                name=None,
                color=group[0].color,
                coverage=group,
                borders=list(borders)  # Make sure GardenZone has this field!
            )
            zones.append(zone)

    return zones
