from typing import List, Dict, Tuple, Set
from collections import deque
import uuid
from app.schemas import ColoredCell, GardenZone

def group_cells_into_zones(cells: List[ColoredCell]) -> List[GardenZone]:
    # Index the cells by their (x, y) coordinates
    cell_map: Dict[Tuple[int, int], ColoredCell] = {
        (int(cell.x), int(cell.y)): cell for cell in cells
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

'''
Define a function that takes a list of colored cells as input.

    Create an empty dictionary that maps coordinates (x, y) to the corresponding colored cell.

    For each cell in the input list:
        Convert the cell's x and y coordinates to integers.
        Store the cell in the dictionary using (x, y) as the key.

    Create an empty set to track which coordinates have already been visited.

    Create an empty list to store the resulting zones.

    Define a helper function called "bfs" that takes a starting coordinate:

        Create a queue and add the starting coordinate to it.
        Create an empty list to collect all cells that belong to the current zone.
        Mark the starting coordinate as visited.

        Retrieve the original cell at the starting coordinate.
        Store its color and menuElementId, which must match for connected cells.

        While the queue is not empty:
            Remove the first coordinate from the queue.
            Retrieve the cell for that coordinate.
            Add that cell to the current group.

            Look at the 4 neighboring coordinates (up, down, left, right).

            For each neighbor:
                If the neighbor exists in the dictionary AND has not been visited yet:
                    If the neighbor's color and menuElementId match the original:
                        Add it to the queue.
                        Mark it as visited.

        Return the group of connected cells.

    For each coordinate in the dictionary:
        If this coordinate has not been visited:
            Run the bfs function on it to get a group of connected cells.
            Create a new zone using a unique ID, the shared color, and the collected cells.
            Add this zone to the list of zones.

    Return the list of zones.
'''