import { FabricImage } from 'fabric';
import { GardenItem, PaletteItem } from '../types';
import { log } from './utils';

export function isGardenItem(el: GardenItem | PaletteItem): el is GardenItem {
  return 'position' in el;
}

export async function createFabricItem(
  item: GardenItem | PaletteItem,
  isSelected: boolean,
): Promise<FabricImage> {
  log("Creating fabric item...")
  if (!isGardenItem(item)) {
    console.log('item: ', item)
    throw new Error('Unsupported item type');
  }

  const img = await FabricImage.fromURL(item.icon, {
    crossOrigin: 'anonymous'
  });

  img.set({
    left: item.position.x,
    top: item.position.y,
    scaleX: item.width / img.width!,
    scaleY: item.height / img.height!,
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
  img.setControlsVisibility({
    ml: false, // middle left
    mr: false, // middle right
    mt: false, // middle top
    mb: false  // middle bottom
  });
  img.on('selected', () => {
    log('Fabric image selected:', item.id);
  });
  img.on('mousedown', () => {
    log('Mouse down on image:', item.id);
  });

  return img;
}