import { useMemo } from "react";
import { useGardenStore } from "@/stores/useGardenStore";
import { InteractiveZone } from "@/types"; // move this type to a shared file
import { makeZonePath } from "@/utils/DrawZone";

export function useInteractiveZones(): InteractiveZone[] {
  const zones = useGardenStore(state => state.present.zones);
  
  const enrichedZones = useMemo(() => {
    return zones.map(zone => ({
      id: zone.id,
      displayName: zone.displayName,
      color: zone.color,
      coverage: zone.coverage,
      borderPath: zone.borderPath,
      ph: zone.metrics?.ph,
      temp: zone.metrics?.temp,
      fertDate: zone.fertilization?.lastDate,
      waterDate: zone.watered?.lastDate,
      waterAmount: zone.watered?.amount,
      fertType: zone.fertilization?.type,
      soilMix: zone.metrics?.soilMix,
      moisture: zone.metrics?.moisture,
      sunshine: zone.metrics?.sunshine,
      path: makeZonePath(zone),
      isSelected: false,
      isHovered: false,
    }));
  }, [zones]);

  return enrichedZones;
}