import type { GardenZone } from "@/types"

export type GardenZoneObject = {
    id: string,
    zone: GardenZone,
    path: Path2D,
    isSelected?: boolean,
    isHovered?: boolean,
}

export default function GardenZoneObject(): null {
    return null;
}