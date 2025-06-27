import { GardenZone, InteractiveZone } from "@/types";
import { darkenColor } from "./utils";
import polylabel from 'polylabel';
import { isoLines } from "marchingsquares";


const CELL_SIZE = 20; // adjust if needed

export function marchingSquares(mask: number[][], threshold = 0.5): [number, number][] {
  const result = isoLines(mask, threshold);
  if (result.length === 0) return [];

  const points = result[0].map(([x, y]) => [x, y] as [number, number]);
  return points;
}

function coverageToMask(coverage: { row: number; col: number }[]): {
  mask: number[][];
  rowOffset: number;
  colOffset: number;
} {
  const minRow = Math.min(...coverage.map(c => c.row));
  const maxRow = Math.max(...coverage.map(c => c.row));
  const minCol = Math.min(...coverage.map(c => c.col));
  const maxCol = Math.max(...coverage.map(c => c.col));

  const numRows = maxRow - minRow + 3; // +3 for buffer
  const numCols = maxCol - minCol + 3;

  const mask = Array.from({ length: numRows }, () => Array(numCols).fill(0));

  for (const { row, col } of coverage) {
    mask[row - minRow + 1][col - minCol + 1] = 1; // +1 buffer to prevent edge clipping
  }

  return {
    mask,
    rowOffset: minRow - 1, // mirror buffer
    colOffset: minCol - 1,
  };
}

function contourToBorderPath(contour: [number, number][], cellSize: number): [number, number][] {
  return contour.map(([col, row]) => [col * cellSize, row * cellSize]);
}

function simplifyRDP(points: [number, number][], epsilon: number): [number, number][] {
  if (points.length < 3) return points;

  const [startX, startY] = points[0];
  const [endX, endY] = points[points.length - 1];

  let maxDist = 0;
  let index = 0;

  for (let i = 1; i < points.length - 1; i++) {
    const [px, py] = points[i];
    const dist = perpendicularDistance(px, py, startX, startY, endX, endY);
    if (dist > maxDist) {
      index = i;
      maxDist = dist;
    }
  }

  if (maxDist > epsilon) {
    const left = simplifyRDP(points.slice(0, index + 1), epsilon);
    const right = simplifyRDP(points.slice(index), epsilon);
    return [...left.slice(0, -1), ...right];
  }

  return [points[0], points[points.length - 1]];
}

function perpendicularDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const num = Math.abs((y2 - y1) * px - (x2 - x1) * py + x2 * y1 - y2 * x1);
  const den = Math.hypot(y2 - y1, x2 - x1);
  return num === 0 || den === 0 ? 0 : num / den;
}

/**
 * Closed Chaikin corner cutting:
 * - doesn’t preserve “first” and “last” as special,
 * - instead it walks every edge including [Pₙ₋₁→P₀].
 */
function chaikinCutClosed(points: [number,number][]): [number,number][] {
  const newPts: [number,number][] = [];
  const n = points.length;
  if (n < 2) return points;

  for (let i = 0; i < n; i++) {
    const [x0,y0] = points[i];
    const [x1,y1] = points[(i+1) % n];  // wrap back to 0
    
    // 25% along edge
    newPts.push([ x0 * 0.75 + x1 * 0.25,  y0 * 0.75 + y1 * 0.25 ]);
    // 75% along edge
    newPts.push([ x0 * 0.25 + x1 * 0.75,  y0 * 0.25 + y1 * 0.75 ]);
  }

  return newPts;
}

/**
 * Densify closed polygon with multiple passes.
 */
function densifyClosed(points: [number,number][], passes = 2): [number,number][] {
  let pts = points;
  for (let i = 0; i < passes; i++) {
    pts = chaikinCutClosed(pts);
  }
  return pts;
}



function drawSmoothPolygon(ctx: CanvasRenderingContext2D, points: [number, number][]) {
  const len = points.length;
  if (len < 3) return;

  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);

  for (let i = 1; i < len - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;
    ctx.quadraticCurveTo(x0, y0, cx, cy);
  }

  // Close the curve to the first point
  ctx.quadraticCurveTo(points[len - 1][0], points[len - 1][1], points[0][0], points[0][1]);

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
if (typeof window !== 'undefined' && typeof CanvasRenderingContext2D !== 'undefined') {
  CanvasRenderingContext2D.prototype.drawZone = function (
    zoneObj: InteractiveZone,
    isSelected: boolean = false
  ) {
    const { path } = zoneObj;
    if (!zoneObj.coverage || zoneObj.coverage.length === 0 || !path) return;

    console.log("ZONE COVERAGE", zoneObj.coverage);
    const { mask, rowOffset, colOffset } = coverageToMask(zoneObj.coverage);
    console.log("MASK", mask.map(row => row.join("")).join("\n"));

// 1) Get your raw contour
let contour = marchingSquares(mask);
contour = contour.filter(([x, y]) => !(x === 0 && y === 0));
// 2) (Optionally) simplify lightly if it’s huge
if (contour.length > 50) contour = simplifyRDP(contour, 0.5);

// 3) Densify — turn those 5 points into 5 × (2^passes) roughly
contour = densifyClosed(contour, 2); // try passes=2 or 3
    console.log("RAW CONTOUR", contour);

    zoneObj.borderPath = contour.map(
      ([col, row]) => [
        (col + colOffset) * CELL_SIZE,
        (row + rowOffset) * CELL_SIZE,
      ] as [number, number]
    );
    console.log("SCALED PATH", zoneObj.borderPath);

    const scaled = zoneObj.borderPath;

// ↓↓↓ START DEBUG BLOCK ↓↓↓
this.save();

// 1) Draw a bright blue outline of the exact polygon points:
this.beginPath();
scaled.forEach(([x, y], i) => i === 0 ? this.moveTo(x, y) : this.lineTo(x, y));
this.closePath();
this.strokeStyle = 'blue';
this.lineWidth   = 2;
this.stroke();

// 2) Fill that same polygon with a semi-transparent blue:
this.beginPath();
scaled.forEach(([x, y], i) => i === 0 ? this.moveTo(x, y) : this.lineTo(x, y));
this.closePath();
this.fillStyle = 'rgba(0,0,255,0.3)';
this.fill();

this.restore();
// ↓↓↓ END DEBUG BLOCK ↓↓↓

// Now your normal stroke:
drawSmoothPolygon(this, scaled);
this.strokeStyle = isSelected ? 'yellow' : darkenColor(zoneObj.color, 0.6);
this.lineWidth   = isSelected ? 2        : 1;
this.setLineDash(isSelected ? [6,4] : []);
this.stroke();

    if (zoneObj.displayName && zoneObj.coverage.length > 0) {
      const poly = [scaled]; // polylabel expects a nested array for possible holes

      const [labelX, labelY] = polylabel(poly, 1.0);

      for (const { row, col } of zoneObj.coverage) {
        this.strokeStyle = 'red';
        this.strokeRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }

      this.font = 'bold 14px sans-serif';
      this.fillStyle = darkenColor(zoneObj.color, 0.6);
      this.textAlign = 'center';
      this.textBaseline = 'middle';
      this.fillText(zoneObj.displayName, labelX, labelY);
    }
  }
};