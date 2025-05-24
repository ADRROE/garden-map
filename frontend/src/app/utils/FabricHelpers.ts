import { FabricImage } from 'fabric';
import { GardenElement, MenuElement } from '../types';
import { log } from './utils';

export function isGardenElement(el: GardenElement | MenuElement): el is GardenElement {
  return 'x' in el && 'y' in el;
}

export async function createFabricElement(
    element: GardenElement | MenuElement,
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