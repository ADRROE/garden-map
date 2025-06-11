import { FabricImage, FabricObject, FabricText, Polygon, Rect } from 'fabric';
import { GardenElementObject, GardenZone, MenuElement } from '../types';
import { darkenColor, log } from './utils';

export function isGardenElement(el: GardenElementObject | MenuElement): el is GardenElementObject {
  return 'x' in el && 'y' in el;
}

export async function createFabricElement(
    element: GardenElementObject | MenuElement,
    isSelected: boolean,
  ): Promise<FabricImage> {
    log("Creating fabric element...")
    if (!isGardenElement(element)) {
      throw new Error('Unsupported element type');
    }
  
    const img = await FabricImage.fromURL(element.icon, {
      crossOrigin: 'anonymous'
    });
  
    img.set({
      left: element.x,
      top: element.y,
      scaleX: element.width / img.width!,
      scaleY: element.height / img.height!,
      selectable: true,
      hasControls: true,
      objectCaching: false,
      borderColor: isSelected ? 'blue' : 'transparent',
      cornerColor: isSelected ? 'blue' : 'transparent',
      cornerStyle: 'circle',
      cornerSize: 8,
      hasBorders: true,
      lockMovementX: false,
      lockMovementY: false,
      lockScalingX: false,
      lockScalingY: false,
    });
    img.on('selected', () => {
  log('Fabric image selected:', element.id);
});
img.on('mousedown', () => {
  log('Mouse down on image:', element.id);
});
  
    return img;
  }

const CELL_SIZE = 20;

export function createFabricZone(
  zone: GardenZone
): FabricObject[] {
  const zoneObjects: FabricObject[] = [];

  // 1. Convert borderPath to scaled points
  const polygonPoints = zone.borderPath.map(([x, y]) => ({
    x: x * CELL_SIZE,
    y: y * CELL_SIZE,
  }));

  const polygon = new Polygon(polygonPoints, {
    fill: 'transparent',
    stroke: darkenColor(zone.color, 0.6),
    strokeWidth: 1,
    selectable: false,
    objectCaching: false,
    hoverCursor: 'default',
    perPixelTargetFind: false,
  });

  zoneObjects.push(polygon);

  // 2. Add filled coverage cells inside
  for (const cell of zone.coverage) {
    const rect = new Rect({
      left: cell.col * CELL_SIZE,
      top: cell.row * CELL_SIZE,
      width: CELL_SIZE,
      height: CELL_SIZE,
      fill: zone.color,
      selectable: false,
      objectCaching: false,
      hoverCursor: 'default',
    });
    zoneObjects.push(rect);
  }

  // 3. Optionally, add zone label
  if (zone.displayName && zone.coverage.length > 0) {
    const minX = Math.min(...zone.coverage.map(c => c.col));
    const maxX = Math.max(...zone.coverage.map(c => c.col));
    const minY = Math.min(...zone.coverage.map(c => c.row));
    const maxY = Math.max(...zone.coverage.map(c => c.row));

    const centerX = ((minX + maxX + 1) / 2) * CELL_SIZE;
    const centerY = ((minY + maxY + 1) / 2) * CELL_SIZE;

    const text = new FabricText(zone.displayName, {
      left: centerX,
      top: centerY,
      fontSize: 14,
      fontWeight: 'bold',
      fill: darkenColor(zone.color, 0.6),
      originX: 'center',
      originY: 'center',
      selectable: false,
    });

    zoneObjects.push(text);
  }

  return zoneObjects;
}