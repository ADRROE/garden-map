import type { InteractiveZone } from "@/types";

declare global {
  interface CanvasRenderingContext2D {
    drawZone: (zoneObj: InteractiveZone, isSelected: boolean) => void;
  };
  var DEBUG: boolean;
}