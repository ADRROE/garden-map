import { Cell, GardenZone, InteractiveZone } from "@/types";
import { darkenColor } from "./utils";
import polylabel from "polylabel";
import { blendSoilMixColor } from "./colorMixer";

const CELL_SIZE = 20;

type Pt = [number, number];

/* -------------------------------------------------------------------------- */
/* Geometry helpers                                                           */
/* -------------------------------------------------------------------------- */

/** Chaikin corner-cutting on a closed ring (preserves loop order). */
function chaikinCutClosed(points: Pt[]): Pt[] {
  if (points.length < 2) return points;

  const out: Pt[] = [];
  for (let i = 0; i < points.length; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[(i + 1) % points.length];
    out.push([x0 * 0.75 + x1 * 0.25, y0 * 0.75 + y1 * 0.25]);
    out.push([x0 * 0.25 + x1 * 0.75, y0 * 0.25 + y1 * 0.75]);
  }
  return out;
}

/** Apply Chaikin `passes` times. */
function densifyClosed(points: Pt[], passes = 2): Pt[] {
  let out = points;
  for (let i = 0; i < passes; i++) out = chaikinCutClosed(out);
  return out;
}

/** Count direction runs (collinear segments). */
function countRuns(points: Pt[]): number {
  if (points.length < 2) return 0;

  const dir = (a: Pt, b: Pt) => `${Math.sign(b[0] - a[0])},${Math.sign(b[1] - a[1])}`;
  let runs = 1;
  let curr = dir(points[0], points[1]);

  for (let i = 1; i < points.length; i++) {
    const next = dir(points[i], points[(i + 1) % points.length]);
    if (next !== curr && next !== "0,0") {
      runs++;
      curr = next;
    }
  }
  return runs;
}

/** True when the outline is predominantly axis-aligned (few turns). */
function isRectilinear(points: Pt[]): boolean {
  return points.length === 0 ? false : countRuns(points) / points.length < 0.3;
}

/** True if `cells` form a completely filled rectangle/bar. */
function isFilledRectangle(cells: Cell[]): boolean {
  if (!cells.length) return false;

  const rows = cells.map(c => c.row);
  const cols = cells.map(c => c.col);
  const minR = Math.min(...rows), maxR = Math.max(...rows);
  const minC = Math.min(...cols), maxC = Math.max(...cols);

  const set = new Set(cells.map(c => `${c.row},${c.col}`));
  const expectedArea = (maxR - minR + 1) * (maxC - minC + 1);
  if (set.size !== expectedArea) return false; // hole found

  // All cells present ⇒ solid rect/bar
  return true;
}

/** Replace tiny 1×1 staircase steps with short diagonals. */
function smoothStairs(points: Pt[]): Pt[] {
  const out: Pt[] = [];

  for (let i = 0; i < points.length; i++) {
    const prev = points[(i - 1 + points.length) % points.length];
    const curr = points[i];
    const next = points[(i + 1) % points.length];

    const dx1 = curr[0] - prev[0];
    const dy1 = curr[1] - prev[1];
    const dx2 = next[0] - curr[0];
    const dy2 = next[1] - curr[1];

    const isStair =
      (Math.abs(dx1) === 1 && dy1 === 0 && dx2 === 0 && Math.abs(dy2) === 1) ||
      (dx1 === 0 && Math.abs(dy1) === 1 && Math.abs(dx2) === 1 && dy2 === 0);

    if (isStair) {
      out.push([(prev[0] + next[0]) / 2, (prev[1] + next[1]) / 2]);
      i++; // skip the next vertex
    } else {
      out.push(curr);
    }
  }

  return out;
}

/* -------------------------------------------------------------------------- */
/* Canvas helpers                                                             */
/* -------------------------------------------------------------------------- */

function drawSmoothPolygon(ctx: CanvasRenderingContext2D, pts: Pt[]): void {
  if (pts.length < 3) return;

  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    ctx.quadraticCurveTo(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
  }
  ctx.quadraticCurveTo(pts[pts.length - 1][0], pts[pts.length - 1][1], pts[0][0], pts[0][1]);
  ctx.closePath();
}

/* -------------------------------------------------------------------------- */
/* Public helpers                                                             */
/* -------------------------------------------------------------------------- */

export function makeZonePath(zone: GardenZone): Path2D {
  const path = new Path2D();
  zone.coverage.forEach(cell => {
    path.rect(cell.col * CELL_SIZE, cell.row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  });
  return path;
}

/* -------------------------------------------------------------------------- */
/* CanvasRenderingContext2D extension                                         */
/* -------------------------------------------------------------------------- */

if (typeof window !== "undefined" && typeof CanvasRenderingContext2D !== "undefined") {
  CanvasRenderingContext2D.prototype.drawZone = function (
    zone: InteractiveZone,
    isSelected = false
  ) {
    if (!zone.coverage?.length || !zone.path) return;

    // Copy the raw outline (grid-corner units)
    let contour: Pt[] = [...zone.borderPath];

    // Decide whether to smooth
    const shouldSmooth = !isRectilinear(contour) && !isFilledRectangle(zone.coverage);
    if (shouldSmooth) {
      contour = smoothStairs(contour);
      contour = densifyClosed(contour, 1);
    }

    // Scale to canvas coords
    const scaled = contour.map(([c, r]) => [c * CELL_SIZE, r * CELL_SIZE] as Pt);

    /* Draw */
    drawSmoothPolygon(this, scaled);
    this.strokeStyle = isSelected ? "orange" : darkenColor(zone.color, 0.6);
    this.fillStyle = blendSoilMixColor(zone.soilMix, zone.color);
    this.lineWidth = isSelected ? 5 : 2;
    this.setLineDash(isSelected ? [10, 4] : []);

    this.stroke();
    this.fill();

    // ↓↓↓ START DEBUG BLOCK ↓↓↓
    if (DEBUG) {
      this.save();

      // 1) Draw a bright blue outline of the exact polygon points:
      this.beginPath();
      scaled.forEach(([x, y], i) => i === 0 ? this.moveTo(x, y) : this.lineTo(x, y));
      this.closePath();
      this.strokeStyle = 'blue';
      this.lineWidth = 2;
      this.stroke();

      for (const { row, col } of zone.coverage) {
        this.strokeStyle = 'red';
        this.strokeRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }

      // 2) Fill that same polygon with a semi-transparent blue:
      this.beginPath();
      scaled.forEach(([x, y], i) => i === 0 ? this.moveTo(x, y) : this.lineTo(x, y));
      this.closePath();
      this.fillStyle = 'rgba(0,0,255,0.3)';
      this.fill();

      this.restore();
    }
    // ↓↓↓ END DEBUG BLOCK ↓↓↓

    /* Label */
    if (zone.displayName) {
      const [lx, ly] = polylabel([scaled]);
      this.font = "bold 14px sans-serif";
      this.fillStyle = darkenColor(zone.color, 0.6);
      this.textAlign = "center";
      this.textBaseline = "middle";
      this.fillText(zone.displayName, lx, ly);
    }
  };
}
