import { FabricImage } from "fabric";

export type MapEntity =
  | { type: 'element', object: GardenItem }
  | { type: 'zoneObj', object: InteractiveZone }
export interface PaletteItem {
  id: string;
  label: string;
  icon: string;
  color?: string,
  iconWidth: number;
  iconHeight: number;
  cursor?: string;
  category: string;
  subCategory?: string;
  metadata?: Record<string, string>;
  onClick?: () => void;
  children?: PaletteItem[];
}
export interface GardenItem extends PaletteItem {
  id: string;
  paletteId?: string;
  position: Vec2;
  dimensions: {
    width: number,
    height: number,
  }
  layer?: LayerName;

  displayName?: string;
  species?: string;
  genus?: string;
  wcvpId?: string;
  rhsId?: string;
  dates?: {
    planted?: Date;
    fertilized?: Date;
    harvested?: Date;
    pruned?: Date;
    watered?: Date;
  }
  fertilizerType?: string;
  plantForm?: string;
  circumference?: number;
  price?: number;
  location?: string;
  rotation?: number;
  status?: string;
  coverage?: Cell[];
  kind?: MapEntity
}

export interface InteractiveImage extends FabricImage {
  id: string;
  customType: 'element';
}
export interface GardenZone {
  id: string;
  displayName?: string;
  color: string;
  coverage: Cell[];
  borderPath: Point[];
  metrics?: {
    ph?: number;
    temp?: number;
    moisture?: number;
    sunshine?: number;
    soilMix?: string;
  };
  watered?: {
    lastDate?: Date;
    amount?: number;
  };
  fertilization?: {
    lastDate?: Date;
    type?: string;
  };
}
export interface InteractiveZone extends GardenZone {
  path: Path2D | null;
  isSelected?: boolean;
  isHovered?: boolean;
  kind?: MapEntity
};

export type Cell = {
  col: number;
  row: number;
  color?: string;
  paletteId?: string;
  zoneId?: string;
};

export interface GardenDataState {
  elements: GardenItem[];
  zones: GardenZone[];
  interactiveZones: InteractiveZone[];
  cells: Record<string, Cell>;
}

export type GardenLayerState = {
  visibleLayers: LayerName[];
};

export type HistoryState<T> = {
  past: T[];
  present: T;
  future: T[];
};

export type Vec2 = {
  x: number;
  y: number;
};

export type Point = [number, number];
export type LineSegment = [Point, Point];

export type ItemType = GardenItem | PaletteItem;

export type LayerName = 'background' | 'elements' | 'zones';

export type CanvasLayer = {
  name: string;
  draw: (ctx: CanvasRenderingContext2D) => void;
  deps: unknown[];
};
