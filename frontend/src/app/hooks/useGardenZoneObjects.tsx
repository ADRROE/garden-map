import { useMemo } from "react";
import { useGardenStore } from "@/stores/useGardenStore";
import { GardenZoneObject } from "@/types"; // move this type to a shared file
import { makeZonePath } from "@/utils/DrawZone";

export function useGardenZoneObjects(): GardenZoneObject[] {
  const zones = useGardenStore(state => state.present.zones);
  
  const enrichedZones = useMemo(() => {
    return zones.map(zone => ({
      id: zone.id,
      displayName: zone.displayName,
      color: zone.color,
      coverage: zone.coverage,
      borderPath: zone.borderPath,
      ph: zone.ph,
      temp: zone.temp,
      fertDate: zone.fertDate,
      waterDate: zone.waterDate,
      waterAmount: zone.waterAmount,
      fertType: zone.fertType,
      soilMix: zone.soilMix,
      moisture: zone.moisture,
      sunshine: zone.sunshine,
      path: makeZonePath(zone),
      isSelected: false,
      isHovered: false,
    }));
  }, [zones]);

  return enrichedZones;
}