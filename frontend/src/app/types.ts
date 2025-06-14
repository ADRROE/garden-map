import { FabricImage } from "fabric";

export type MapEntity =
  | { type: 'item', object: GardenItem }
  | { type: 'zone', object: InteractiveZone }

export type GardenAction = 
  | { type: 'plant', subject: GardenItem, form: 'root' | 'seed' | 'seedling' | 'sapling' }
  | { type: 'transplant', subject: GardenItem }
  | { type: 'prune', subject: GardenItem, degree: 'hard' | 'medium' | 'light' }
  | { type: 'amend', subject: GardenItem | GardenZone, product: string }
  | { type: 'water', subject: GardenItem | GardenZone }
  | { type: 'harvest', subject: GardenItem }

export interface PaletteItem {
  id: string;
  label: string;
  icon: string;
  color?: string,
  width: number;
  height: number;
  cursor?: string;
  category: string;
  subCategory?: string;
  children?: PaletteItem[];
  onClick?: () => void;
}

export interface GardenItem extends PaletteItem {
  id: string; 

    paletteItemId?: string;
    displayName?: string;
    position: Vec2;
    location: string;
    rotation?: number;
    coverage?: Cell[];
    layer?: LayerName;
    kind?: MapEntity

  species?: string;
  genus?: string;
  wcvpId?: string;
  rhsId?: string;
  metrics?: {
    circumference?: number;
    price?: number;
  tWatered?: Date;
  dtWatered?: number;
  qWatered?: number;
  tAmended?: Date;
  qAmended?: string;
  }
}

export interface InteractiveImage extends FabricImage {
  id: string;
  customType: 'element';
}

export interface GardenZone {
  id: string;
  metadata: {
    displayName?: string;
    color: string;
    coverage: Cell[];
    borderPath: Point[];
  };
  metrics?: {
    ph?: number;
    temp?: number;
    moisture?: number;
    sunshine?: number;
    compaction?: number;
  };
  soilMix?: string;
  tWatered?: Date;
  dtWatered?: number;
  qWatered?: number;
  tAmended?: Date;
  qAmended?: string;
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
