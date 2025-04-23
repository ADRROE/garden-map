export interface MenuElement {
    id: string;
    iconName: string;
    icon: string;
    defaultWidth?: number;
    defaultHeight?: number;
    cursor?: string;
    category: string;
    subCategory?: string;
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

type Point = [number, number];
type LineSegment = [Point, Point];

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

export type CreateElementFn = (element: Omit<GardenElement, "name" | "x" | "y" | "width" | "height"> , name: string, x: number, y: number, width: number, height: number) => void;

export type UpdateElementFn = (updatedElement: { id: string } & Partial<GardenElement>) => void;

export interface GardenContextType {
  elements: GardenElement[];
  zones: GardenZone[];
  selectedElement: MenuElement | null;
  pendingPosition: { x: number, y: number } | null;
  coloredCells: Record<string, ColoredCell>;
  isMapLocked: boolean;
  setIsMapLocked: React.Dispatch<React.SetStateAction<boolean>>;
  colorCell: (x: number, y: number, color: string, menuElementId: string) => void;
  setColoredCells: React.Dispatch<React.SetStateAction<Record<string, ColoredCell>>>;
  setZones: React.Dispatch<React.SetStateAction<GardenZone[]>>;
  setSelectedElement: (element: MenuElement | null) => void;
  createElement: CreateElementFn;
  updateElement: UpdateElementFn;
  selectElement: (element: MenuElement | null) => void;
  setPendingPosition: (pos:{ x: number, y: number }) => void;
  placeElement: (x: number, y: number, name: string) => void;
  deleteElement: (id: string) => void;
}

export type ElementType = GardenElement | MenuElement;

export interface DraggableElementProps {
  element: GardenElement;
  onUpdate: (updatedElement: { id: string } & Partial<GardenElement>) => void;
  onSelect: () => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
}

export interface ZoneProps {
  zone: GardenZone;
  hoveredZoneId?: string | null;
  selectedZoneId?: string | null;
  setHoveredZoneId: (id: string | null) => void;
  setSelectedZoneId: (id: string | null) => void;
  onDeleteZone: (id: string) => void;
}