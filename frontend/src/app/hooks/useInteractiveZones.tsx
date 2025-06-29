import { useMemo, useRef } from "react";
import { useGardenStore } from "@/stores/useGardenStore";
import { GardenZone, InteractiveZone } from "@/types";
import { makeZonePath } from "@/utils/DrawZone";

// Shallow equality check — customize as needed
function shallowEqualZone(a: GardenZone, b: GardenZone): boolean {
  return (
    a.id === b.id &&
    a.kind === b.kind &&
    a.color === b.color &&
    a.displayName === b.displayName &&
    a.borderPath === b.borderPath && // assumes reference equality for perf
    a.coverage === b.coverage &&     // same
    a.ph === b.ph &&
    a.temp === b.temp &&
    a.tAmended === b.tAmended &&
    a.qAmended === b.qAmended &&
    a.tWatered === b.tWatered &&
    a.dtWatered === b.dtWatered &&
    a.qWatered === b.qWatered &&
    a.compaction === b.compaction &&
    a.soilMix === b.soilMix &&
    a.moisture === b.moisture &&
    a.sunshine === b.sunshine
  );
}

interface CachedZone {
  raw: GardenZone;
  enriched: InteractiveZone;
}

export function useInteractiveZones(): InteractiveZone[] {
  const zones = useGardenStore(state => state.present.zones);
  const cacheRef = useRef<Map<string, CachedZone>>(new Map());

  const enrichedZones = useMemo((): InteractiveZone[] => {
    const newCache = new Map<string, CachedZone>();

    const result: InteractiveZone[] = zones.map(zone => {
      const cached = cacheRef.current.get(zone.id);

      const shouldReuse =
        cached && shallowEqualZone(cached.raw, zone);

      const enriched: InteractiveZone = shouldReuse
        ? cached!.enriched
        : {
            kind: zone.kind,
            id: zone.id,
            displayName: zone.displayName,
            color: zone.color,
            coverage: zone.coverage,
            borderPath: zone.borderPath,
            ph: zone.ph,
            temp: zone.temp,
            tAmended: zone.tAmended,
            qAmended: zone.qAmended,
            tWatered: zone.tWatered,
            dtWatered: zone.dtWatered,
            qWatered: zone.qWatered,
            soilMix: zone.soilMix,
            compaction: zone.compaction,
            moisture: zone.moisture,
            sunshine: zone.sunshine,
            path: makeZonePath(zone),
            isSelected: false,
            isHovered: false,
          };

      newCache.set(zone.id, {
        raw: zone,
        enriched,
      });

      return enriched;
    });

    cacheRef.current = newCache;
    return result;
  }, [zones]);

  return enrichedZones;
}