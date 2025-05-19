// components/GardenElement.tsx
import { Canvas, FabricObject, Rect, Circle, FabricImage } from 'fabric';
import type { GardenElement } from '../types';

export default function GardenElement({
  element,
  fabricCanvas,
  isSelected,
}: {
  element: GardenElement;
  fabricCanvas: Canvas;
  isSelected: boolean;
}): FabricObject {
  let obj: FabricObject;

  if (element.category === '') {
    obj = new Rect({
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      selectable: true,
    });
  } else if (element.category === 'vegetation' && element.icon) {
    obj = new FabricImage(element.icon, {
      left: element.x,
      top: element.y,
      selectable: true,
    });
  } else {
    obj = new Circle({
      left: element.x,
      top: element.y,
      radius: 10,
      fill: 'gray',
      selectable: true,
    });
  }

  if (isSelected) {
    obj.set({ stroke: 'blue', strokeWidth: 2 });
  }

  obj.on('selected', () => {
    fabricCanvas.setActiveObject(obj);
  });

  return obj;
}