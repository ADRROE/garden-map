export interface MenuElement {
  id: string;
  iconName: string;
  icon: string;
  defaultWidth?: number;
  defaultHeight?: number;
  cursor?: string;
  category: string;
  subCategory?: string;
  metadata?: Record<string, unknown>;
}

export interface GardenElement extends MenuElement {
  name?: string;
  x: number;
  y: number;
  location?: string;
  width: number;
  height: number;
  coverage?: string[];
  wcvpId?: string;
  rhsId?: string;
  datePlanted?: Date;
  price?: number;
}

export interface GardenState {
  elements: GardenElement[];
  zones: GardenZone[];
  coloredCells: Record<string, ColoredCell>;
  activeLayer: LayerType;
  selectedElement: ElementType | null;
  pendingPosition: { pos: {x?: number, y?: number} | null; subject: "element" | "zone" } | null;
  showZones: boolean;
  isSelectingElement: boolean;
  isMapLocked: boolean;
  pan: { x: number; y: number };
  scale: number;
}

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

export type LayerType = 'plants' | 'irrigation' | 'soil' | 'light';

export type CreateElementFn = (element: Omit<GardenElement, "name" | "x" | "y" | "width" | "height">, name: string, x: number, y: number, width: number, height: number) => void;
export type UpdateElementFn = (updatedElement: { id: string } & Partial<GardenElement>) => void;
export type UpdateZoneFn = (updatedZone: { id: string } & Partial<GardenZone>) => void;

export type PendingPosition = { x?: number; y?: number; subject: "element" | "zone" } | null;

type Point = [number, number];
type LineSegment = [Point, Point];

export type ElementType = GardenElement | MenuElement;

export interface DraggableElementProps {
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
  name: LayerName;
  draw: (ctx: CanvasRenderingContext2D) => void;
  deps: any[];
};