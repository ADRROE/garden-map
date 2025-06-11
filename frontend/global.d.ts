import type { GardenZoneObject } from "@/types";

declare global {
  interface CanvasRenderingContext2D {
    drawZone: (zoneObj: GardenZoneObject, isSelected: boolean) => void;
  }
}