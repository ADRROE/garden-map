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
  name?: string;
  x: number;
  y: number;
  location?: string;
  rotation?: number;
  width: number;
  height: number;
  coverage?: string[];
  wcvpId?: string;
  rhsId?: string;
  datePlanted?: Date;
  price?: number;
  layer?: LayerName;
}

export interface GardenDataState {
  elements: GardenElementObject[];
  zones: GardenZone[];
  coloredCells: Record<string, ColoredCell>;
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
  | {type: 'element', object: GardenElementObject}
  | {type: 'zone', object: GardenZoneObject}

export interface GardenZone {
  id: string;
  name?: string;
  color: string;
  coverage: ColoredCell[];
  borderPath: Point[];
}

export type GardenZoneObject = {
  id: string;
  zone: GardenZone;
  path: Path2D;
  isSelected?: boolean;
  isHovered?: boolean;
};

export type ColoredCell = {
  col: number;
  row: number;
  color: string;
  menuElementId?: string;
  zoneId?: string;
};

export type CreateElementFn = (element: Omit<GardenElementObject, "name" | "x" | "y" | "width" | "height">, name: string, x: number, y: number, width: number, height: number) => void;
export type UpdateElementFn = (updatedElement: { id: string } & Partial<GardenElementObject>, record?: "create" | "update") => void;
export type UpdateZoneFn = (updatedZone: { id: string } & Partial<GardenZone>, record?: "create" | "modify") => void;

export type Vec2 = {
  x: number;
  y: number;
};


export type Point = [number, number];
export type LineSegment = [Point, Point];

export type ElementType = GardenElementObject | MenuElement;

export interface GardenElementProps {
  element: GardenElementObject;
  isSelected: boolean;

  onUpdate: (updatedElement: { id: string } & Partial<GardenElementObject>) => void;
  onSelect: () => void;
  onDelete: (id: string) => void;
}

export interface ZoneProps {
  zone: GardenZone;

  onClick: () => void;
  onUpdate: (updatedZone: { id: string } & Partial<GardenZone>) => void;
  onDelete: (id: string) => void;

  hoveredZoneId?: string | null;
  selectedZoneId?: string | null;

  setHoveredZoneId: (id: string | null) => void;
  setSelectedZoneId: (id: string | null) => void;
}

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