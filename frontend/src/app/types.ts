export interface MenuElement {
    id: string;
    name: string;
    icon: string;
    defaultWidth?: number;
    defaultHeight?: number;
    cursor?: string;
    category: string;
  }

export interface GardenElement extends MenuElement {
  x: number;
  y: number;
  location?: string;
  width: number;
  height: number;
  wcvpId?: string;
  rhsId?: string;
  datePlanted?: Date;
  price?: number;
}

export type CreateElementFn = (element: Omit<GardenElement, "x" | "y" | "width" | "height"> , x: number, y: number, width: number, height: number) => void;

export type UpdateElementFn = (updatedElement: { id: string } & Partial<GardenElement>) => void;

export interface GardenContextType {
  elements: GardenElement[];
  selectedElement: MenuElement | null;
  createElement: CreateElementFn;
  updateElement: UpdateElementFn;
  selectElement: (element: MenuElement | null) => void;
  placeElement: (x: number, y: number) => void;
  deleteElement: (id: string) => void;
}

export type ElementType = GardenElement | MenuElement;
export type ClickHandler = (event: React.MouseEvent) => void;

export interface DraggableElementProps {
  element: GardenElement;
  onUpdate: (updatedElement: { id: string } & Partial<GardenElement>) => void;
  onSelect: () => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
}