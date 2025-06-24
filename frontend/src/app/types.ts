import { FabricImage } from "fabric";

export type GardenEntity = GardenItem | InteractiveZone

export type GardenAction =
  | { type: 'plant', subject: GardenItem, form: 'root' | 'seed' | 'seedling' | 'sapling' }
  | { type: 'transplant', subject: GardenItem }
  | { type: 'prune', subject: GardenItem, degree: 'hard' | 'medium' | 'light' }
  | { type: 'amend', subject: GardenItem | GardenZone, product: string }
  | { type: 'water', subject: GardenItem | GardenZone }
  | { type: 'harvest', subject: GardenItem }

interface BaseItem {
  id: string;
  icon: string;
  color?: string;
  cursor?: string;
  category: string;
  subCategory?: string;
}

export interface PaletteItem extends BaseItem {
  kind: 'PaletteItem';
  label: string;
  defaultWidth: number;
  defaultHeight: number;
  children?: PaletteItem[];
  onClick?: () => void;
  grade?: string;
}

export interface GardenItem extends BaseItem {
  kind: 'GardenItem';
  paletteItemId: string;
  displayName?: string;
  position: Vec2;
  location: string;
  rotation?: number;
  width: number;
  height: number;
  coverage?: Cell[];
  layer?: LayerName;
  species?: string;
  genus?: string;
  wcvpId?: string;
  rhsId?: string;
  circumference?: number;
  price?: number;
  tWatered?: Date;
  dtWatered?: number;
  qWatered?: number;
  tAmended?: Date;
  qAmended?: number;
}

export interface GardenZone {
  kind: 'GardenZone';
  id: string;
  displayName?: string;
  color: string;
  coverage: Cell[];
  borderPath: Point[];
  ph?: number;
  temp?: number;
  moisture?: number;
  sunshine?: number;
  compaction?: number;
  soilMix?: string;
  tWatered?: Date;
  dtWatered?: number;
  qWatered?: number;
  tAmended?: Date;
  qAmended?: number;
}

export interface InteractiveZone extends GardenZone {
  path: Path2D | null;
  isSelected?: boolean;
  isHovered?: boolean;
};
export interface InteractiveImage extends FabricImage {
  id: string;
  customType: 'item';
}

export type Cell = {
  col: number;
  row: number;
  color?: string;
  paletteItemId?: string;
  zoneId?: string;
};

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

export type LayerName = 'background' | 'items' | 'zones';

export type CanvasLayer = {
  name: string;
  draw: (ctx: CanvasRenderingContext2D) => void;
  deps: unknown[];
};
