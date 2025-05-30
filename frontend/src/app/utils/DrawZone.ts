import { GardenZone } from "@/types";
import { darkenColor } from "./utils";

const CELL_SIZE = 20; // adjust if needed
const RADIUS = 6

export default function drawZone(ctx: CanvasRenderingContext2D, zone: GardenZone, cache?: Map<string, Path2D>) {
    if (!zone.coverage || zone.coverage.length === 0) return;

      const scaled = zone.borderPath.map(([x, y]) => [x * CELL_SIZE, y * CELL_SIZE] as [number, number]);

    let path = cache?.get(zone.id);
    if (!path) {
        path = new Path2D();
        for (const cell of zone.coverage) {
            path.rect(cell.col * CELL_SIZE, cell.row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
        cache?.set(zone.id, path);
    }

ctx.save(); // Save canvas state

// 1. Build the rounded border path
ctx.beginPath();
ctx.moveTo(scaled[0][0], scaled[0][1]);

for (let i = 0; i < scaled.length; i++) {
  const [x2, y2] = scaled[(i + 1) % scaled.length];
  const [x3, y3] = scaled[(i + 2) % scaled.length];
  ctx.arcTo(x2, y2, x3, y3, RADIUS);
}

ctx.closePath();

// 2. Set clip region to this rounded path
ctx.clip();

// 3. Fill the coverage inside the clip
ctx.fillStyle = zone.color;
for (const { col, row } of zone.coverage) {
  ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

ctx.restore(); // Restore to remove clipping

// 4. Stroke the rounded border for visual outline
ctx.beginPath();
ctx.moveTo(scaled[0][0], scaled[0][1]);

for (let i = 0; i < scaled.length; i++) {
  const [x2, y2] = scaled[(i + 1) % scaled.length];
  const [x3, y3] = scaled[(i + 2) % scaled.length];
  ctx.arcTo(x2, y2, x3, y3, RADIUS);
}

ctx.closePath();
ctx.strokeStyle = darkenColor(zone.color, 0.6);
ctx.lineWidth = 1;
ctx.stroke();

  // 🏷 Draw name at center of zone
  if (zone.name && zone.coverage.length > 0) {
    const minX = Math.min(...zone.coverage.map(c => c.col));
    const maxX = Math.max(...zone.coverage.map(c => c.col));
    const minY = Math.min(...zone.coverage.map(c => c.row));
    const maxY = Math.max(...zone.coverage.map(c => c.row));

    const centerX = ((minX + maxX + 1) / 2) * CELL_SIZE;
    const centerY = ((minY + maxY + 1) / 2) * CELL_SIZE;

    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = darkenColor(zone.color, 0.6);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(zone.name, centerX, centerY);
  }
}