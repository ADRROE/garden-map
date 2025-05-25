import { GardenZone } from "@/types";
import { darkenColor } from "./utils";

const CELL_SIZE = 20; // adjust if needed

export default function drawZone(ctx: CanvasRenderingContext2D, zone: GardenZone, cache?: Map<string, Path2D>) {
    if (!zone.coverage || zone.coverage.length === 0) return;

    let path = cache?.get(zone.id);
    if (!path) {
        path = new Path2D();
        for (const cell of zone.coverage) {
            path.rect(cell.x * CELL_SIZE, cell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
        cache?.set(zone.id, path);
    }

    ctx.fillStyle = zone.color;
    ctx.beginPath();

    for (const cell of zone.coverage) {
        const { x, y } = cell;
        ctx.rect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }

    ctx.fill();

  // Draw borders
  if (zone.borders && zone.borders.length > 0) {
    ctx.strokeStyle = darkenColor(zone.color, 0.6);
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const [[x1, y1], [x2, y2]] of zone.borders) {
      ctx.moveTo(x1 * CELL_SIZE, y1 * CELL_SIZE);
      ctx.lineTo(x2 * CELL_SIZE, y2 * CELL_SIZE);
    }
    ctx.stroke();
  }

  // 🏷 Draw name at center of zone
  if (zone.name && zone.coverage.length > 0) {
    const minX = Math.min(...zone.coverage.map(c => c.x));
    const maxX = Math.max(...zone.coverage.map(c => c.x));
    const minY = Math.min(...zone.coverage.map(c => c.y));
    const maxY = Math.max(...zone.coverage.map(c => c.y));

    const centerX = ((minX + maxX + 1) / 2) * CELL_SIZE;
    const centerY = ((minY + maxY + 1) / 2) * CELL_SIZE;

    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = darkenColor(zone.color, 0.6);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(zone.name, centerX, centerY);
  }
}