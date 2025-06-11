import { FabricImage } from "fabric";

export interface MenuElement {
  id: string;
  label: string;
  icon: string;
  color?: string,
  defaultWidth?: number;
  defaultHeight?: number;
  cursor?: string;
  category: string;
  subCategory?: string;
  metadata?: Record<string, string>;
  onClick?: () => void;
  children?: MenuElement[];
}

export interface GardenElementObject extends MenuElement {
  menuElementId?: string;
  id: string;
  displayName?: string;
  species?: string;
  genus?: string;
  x: number;
  y: number;
  location?: string;
  rotation?: number;
  width: number;
  height: number;
  coverage?: Cell[];
  wcvpId?: string;
  rhsId?: string;
  datePlanted?: Date;
  dateFertilized?: Date;
  dateHarvested?: Date;
  dateWatered?: Date;
  amountWatered?: number;
  datePruned?: Date;
  fertilizerType?: string;
  plantForm?: string;
  status?: string;
  dateStatus?: Date;
  circumference?: number;
  price?: number;
  layer?: LayerName;
}

export interface GardenDataState {
  elements: GardenElementObject[];
  zones: GardenZone[];
  zoneObjects: GardenZoneObject[];
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

export type GardenObject =
  | { type: 'element', object: GardenElementObject }
  | { type: 'zoneObj', object: GardenZoneObject }

export interface GardenZone {
  id: string;
  displayName?: string;
  color: string;
  coverage: Cell[];
  borderPath: Point[];
  ph?: number;
  temp?: number;
  fertDate?: Date;
  waterDate?: Date;
  waterAmount?: number;
  fertType?: string;
  soilMix?: string;
  moisture?: number;
  sunshine?: number;
}

export interface GardenZoneObject extends GardenZone {
  path: Path2D | null;
  isSelected?: boolean;
  isHovered?: boolean;
};

export type Cell = {
  col: number;
  row: number;
  color?: string;
  menuElementId?: string;
  zoneId?: string;
};

export type CreateElementFn = (element: Omit<GardenElementObject, "name" | "x" | "y" | "width" | "height">, displayName: string, x: number, y: number, width: number, height: number) => void;
export type UpdateElementFn = (updatedElement: { id: string } & Partial<GardenElementObject>, record?: "create" | "update") => void;
export type UpdateZoneFn = (updatedZone: { id: string } & Partial<GardenZone>, record?: "create" | "modify") => void;

export type Vec2 = {
  x: number;
  y: number;
};

export type Point = [number, number];
export type LineSegment = [Point, Point];

export type ElementType = GardenElementObject | MenuElement;

export type LayerName = 'background' | 'elements' | 'zones';

export type CanvasLayer = {
  name: string;
  draw: (ctx: CanvasRenderingContext2D) => void;
  deps: unknown[];
};

export interface GardenFabricImage extends FabricImage {
  id: string;
  customType: 'element';
}