from typing import List, Dict, Tuple, Set
from collections import deque
import uuid
from app.schemas import Cell, GardenZone

def sort_border_segments(
    border_set: Set[Tuple[Tuple[int, int], Tuple[int, int]]]
) -> List[Tuple[int, int]]:
    from collections import defaultdict

    # Map each point to all connected segments (undirected)
    adjacency = defaultdict(list)
    for a, b in border_set:
        adjacency[a].append(b)
        adjacency[b].append(a)

    # Start with the first point that has only 1 connection (if it's open)
    # or any point (if it's a closed loop)
    start = None
    for pt, neighbors in adjacency.items():
        if len(neighbors) == 1:
            start = pt
            break
    if not start:
        start = next(iter(adjacency))

    ordered_points = [start]
    prev = None
    curr = start

    while True:
        neighbors = adjacency[curr]
        next_pt = None
        for neighbor in neighbors:
            if neighbor != prev:
                next_pt = neighbor
                break
        if not next_pt or next_pt == ordered_points[0]:
            break
        ordered_points.append(next_pt)
        prev, curr = curr, next_pt

    return ordered_points

def group_cells_into_zones(cells: List[Cell]) -> List[GardenZone]:
    # Index the cells by their (col, row) coordinates
    cell_map: Dict[Tuple[int, int], Cell] = {
        (int(cell.col), int(cell.row)): cell for cell in cells
    }

    visited: Set[Tuple[int, int]] = set()
    zones: List[GardenZone] = []

    def bfs(start_pos: Tuple[int, int]) -> Tuple[List[Cell], Set[Tuple[Tuple[int, int], Tuple[int, int]]]]:
        queue = deque([start_pos])
        group = []
        borderPath = set()
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
                    borderPath.add(border_line)
                else:
                    neighbor_cell = cell_map[neighbor_pos]
                    if (
                        neighbor_cell.color != base_cell.color or
                        neighbor_cell.menuElementId != base_cell.menuElementId
                    ):
                        borderPath.add(border_line)
                    elif neighbor_pos not in visited:
                        visited.add(neighbor_pos)
                        queue.append(neighbor_pos)

        return group, borderPath
    
    for pos in cell_map:
        if pos not in visited:
            group, borderPath = bfs(pos)
            zone = GardenZone(
                id=str(uuid.uuid4()),
                display_name=None,
                color=group[0].color,
                coverage=group,
                borderPath=sort_border_segments(borderPath)
            )
            zones.append(zone)

    return zones
