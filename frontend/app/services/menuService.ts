import type { MenuElement } from "@/types";
import objects from '@/data/MenuElements.json';
import zones from '@/data/MenuZones.json';

export async function fetchMenuElements(which: string): Promise<MenuElement[]> {
  console.log(which)
  if (which === 'zones') {
    console.log(zones)
    return zones as MenuElement[]

  } else {
    return objects as MenuElement[];
  }
};