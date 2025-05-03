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

export type CreateElementFn = (element: Omit<GardenElement, "name" | "x" | "y" | "width" | "height">, name: string, x: number, y: number, width: number, height: number) => void;
export type UpdateElementFn = (updatedElement: { id: string } & Partial<GardenElement>) => void;
export type UpdateZoneFn = (updatedZone: { id: string } & Partial<GardenZone>) => void;

export type PendingPosition = { x?: number; y?: number; subject: "element" | "zone" } | null;


export interface GardenContextType {
  elements: GardenElement[];

  createElement: CreateElementFn;
  updateElement: UpdateElementFn;
  selectElement: (element: MenuElement) => void;
  placeElement: (x: number, y: number, name: string) => void;
  deleteElement: (id: string) => void;

  colorCell: (x: number, y: number, color: string, menuElementId: string) => void;
  uncolorCell: (x: number, y: number) => void;
  updateZone: UpdateZoneFn;

  selectedElement: MenuElement | null;
  coloredCells: Record<string, ColoredCell>;
  zones: GardenZone[];
  pendingPosition: PendingPosition | null;
  isMapLocked: boolean;
  isSelectingElement: boolean;
  showZones: boolean;
  activeColor: { color: string } | null;

  setSelectedElement: (element: MenuElement | null) => void;
  setColoredCells: React.Dispatch<React.SetStateAction<Record<string, ColoredCell>>>;
  setZones: React.Dispatch<React.SetStateAction<GardenZone[]>>;
  setPendingPosition: React.Dispatch<React.SetStateAction<PendingPosition>>;
  setIsMapLocked: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSelectingElement: React.Dispatch<React.SetStateAction<boolean>>;
  setShowZones: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveColor: React.Dispatch<React.SetStateAction<{ color: string } | null>>;
}

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