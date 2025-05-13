import { useGardenStore } from './useGardenStore';
import { GardenElement } from '@/types';

interface TransformOptions {
  snapToGrid?: boolean;
  gridSize?: number;
  clampToBounds?: boolean;
  bounds?: { width: number; height: number };
}

export const useElementTransform = (options?: TransformOptions) => {
const datadispatch = useGardenStore(state => state.dispatch);
  const {
    snapToGrid = false,
    gridSize = 20,
    clampToBounds = false,
    bounds = { width: Infinity, height: Infinity }
  } = options || {};

  const snap = (value: number) => (snapToGrid ? Math.round(value / gridSize) * gridSize : value);

  const clamp = (value: number, max: number) => Math.min(Math.max(value, 0), max);

  const updateElement = (id: string, updates: Partial<GardenElement>) => {
    datadispatch({ type: 'UPDATE_ELEMENT', id, updates });
  };

  const moveElement = (el: GardenElement, dx: number, dy: number) => {
    let newX = el.x + dx;
    let newY = el.y + dy;

    if (snapToGrid) {
      newX = snap(newX);
      newY = snap(newY);
    }

    if (clampToBounds) {
      newX = clamp(newX, bounds.width - el.width);
      newY = clamp(newY, bounds.height - el.height);
    }

    updateElement(el.id, { x: newX, y: newY });
  };

  const resizeElement = (el: GardenElement, width: number, height: number) => {
    let newWidth = snapToGrid ? snap(width) : width;
    let newHeight = snapToGrid ? snap(height) : height;

    if (clampToBounds) {
      newWidth = clamp(newWidth, bounds.width - el.x);
      newHeight = clamp(newHeight, bounds.height - el.y);
    }

    updateElement(el.id, { width: newWidth, height: newHeight });
  };

  const rotateElement = (el: GardenElement, degrees: number) => {
    updateElement(el.id, { rotation: degrees % 360 });
  };

  return {
    moveElement,
    resizeElement,
    rotateElement
  };
};