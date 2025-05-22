import { GardenDataAction } from "./services/actions";
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
  metadata?: Record<string, unknown>;
  onClick?: () => void;
  children?: MenuElement[];
}

export interface GardenElement extends MenuElement {
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
  elements: GardenElement[];
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

export interface GardenZone {
  id: string;
  name?: string;
  color: string;
  coverage: ColoredCell[];
  borders: LineSegment[];
}

export type ColoredCell = {
  x: number;
  y: number;
  color: string;
  menuElementId: string;
  zoneId?: string;
};

export type CreateElementFn = (element: Omit<GardenElement, "name" | "x" | "y" | "width" | "height">, name: string, x: number, y: number, width: number, height: number) => void;
export type UpdateElementFn = (updatedElement: { id: string } & Partial<GardenElement>) => void;
export type UpdateZoneFn = (updatedZone: { id: string } & Partial<GardenZone>) => void;

export type Vec2 = {
  x: number;
  y: number;
};


type Point = [number, number];
type LineSegment = [Point, Point];

export type ElementType = GardenElement | MenuElement;

export interface GardenElementProps {
  element: GardenElement;
  isSelected: boolean;

  onUpdate: (updatedElement: { id: string } & Partial<GardenElement>) => void;
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

export type GardenDataContextType = {
  datastate: GardenDataState;
  datadispatch: React.Dispatch<GardenDataAction>;
  placeElement: (name: string) => void;
  deleteElement: (id: string) => void;
  updateElement: (element: GardenElement) => void;
  updateZone: (zone: GardenZone) => void;
  selectElement: (element: ElementType | null) => void;
  colorCell: (i: number, j: number, color: string, menuElementId: string) => void;
  uncolorCell: (i: number, j: number) => void;
};

export interface GardenFabricImage extends FabricImage {
  id: string;
  customType: 'element';
}