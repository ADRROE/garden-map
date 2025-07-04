// hooks/useSelectedObj.ts
import { useSelectionStore } from '@/stores/useSelectionStore';
import { useGardenStore } from '@/stores/useGardenStore';
import { useInteractiveZones } from '@/hooks/useInteractiveZones';
import { GardenItem, InteractiveZone } from '@/types';

export default function useSelectedObjects() {
  const selectedObjId = useSelectionStore((s) => s.selectedObjId);
  const items = useGardenStore((s) => s.present.items);
  const zones = useInteractiveZones();

  const item = items.find((el): el is GardenItem => el.id === selectedObjId) || null;
  const zone = zones.find((z): z is InteractiveZone => z.id === selectedObjId) || null;
  const obj = item ?? zone;

  return { selectedObj: obj, selectedGardenItem: item, selectedGardenZone: zone };
}