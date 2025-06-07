import { GardenZone, GardenZoneObject } from "@/types";
import { darkenColor } from "./utils";

const CELL_SIZE = 20; // adjust if needed
const RADIUS = 6

function drawRoundedPolygon(ctx: CanvasRenderingContext2D, points: [number, number][], radius: number) {
  const len = points.length;
  if (len < 3) return;

  ctx.beginPath();

  for (let i = 0; i < len; i++) {
    const [p0x, p0y] = points[(i - 1 + len) % len];
    const [p1x, p1y] = points[i];
    const [p2x, p2y] = points[(i + 1) % len];

    const v1x = p1x - p0x;
    const v1y = p1y - p0y;
    const v2x = p2x - p1x;
    const v2y = p2y - p1y;

    const len1 = Math.hypot(v1x, v1y);
    const len2 = Math.hypot(v2x, v2y);

    const r = Math.min(radius, len1 / 2, len2 / 2);

    // Normalize directions
    const n1x = v1x / len1;
    const n1y = v1y / len1;

    // Compute the tangent points
    const startX = p1x - n1x * r;
    const startY = p1y - n1y * r;

    if (i === 0) {
      ctx.moveTo(startX, startY);
    } else {
      ctx.lineTo(startX, startY);
    }

    ctx.arcTo(p1x, p1y, p2x, p2y, r);
  }

  ctx.closePath();
}

export function makeZonePath(zone: GardenZone): Path2D {
  // This is reused only for hit detection
  const path = new Path2D();
  for (const cell of zone.coverage) {
    path.rect(cell.col * CELL_SIZE, cell.row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  }
  return path;
}

export function drawZone(ctx: CanvasRenderingContext2D, zoneObj: GardenZoneObject) {
  const { zone, path } = zoneObj;
  if (!zone.coverage || zone.coverage.length === 0 || !path) return;

  const scaled = zone.borderPath.map(([x, y]) => [x * CELL_SIZE, y * CELL_SIZE] as [number, number]);

  ctx.save();

  // 1. Build the rounded border path
  drawRoundedPolygon(ctx, scaled, RADIUS);

  // 2. Set clip region
  ctx.clip();

  // 3. Fill coverage
  ctx.fillStyle = zone.color;
  for (const { col, row } of zone.coverage) {
    ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  }

  ctx.restore();

  // 4. Stroke border
  drawRoundedPolygon(ctx, scaled, RADIUS);
  ctx.strokeStyle = darkenColor(zone.color, 0.6);
  ctx.lineWidth = 1;
  ctx.stroke();

  // 5. Label (name)
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