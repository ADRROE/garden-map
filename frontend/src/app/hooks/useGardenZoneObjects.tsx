import { useMemo } from "react";
import { useGardenStore } from "@/stores/useGardenStore";
import { GardenZoneObject } from "@/types"; // move this type to a shared file
import { makeZonePath } from "@/utils/DrawZone";

export function useGardenZoneObjects(): GardenZoneObject[] {
  const zones = useGardenStore(state => state.present.zones);

  const enrichedZones = useMemo(() => {
    return zones.map(zone => ({
      id: zone.id,
      zone,
      path: makeZonePath(zone),
      isSelected: false,
      isHovered: false,
    }));
  }, [zones]);

  return enrichedZones;
}