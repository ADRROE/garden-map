import type { MenuElement } from "@/types";
import { menuItems } from "@/components/assets/menuItems";
import zones from '@/data/MenuZones.json';

export async function fetchMenuElements(which: string): Promise<MenuElement[]> {
  if (which === 'zones') {
    return zones as MenuElement[]

  } else {
    return menuItems as MenuElement[];
  }
};