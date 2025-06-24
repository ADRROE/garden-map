import type { PaletteItem } from "../types";
import { menuItems } from "../lib/paletteItems";

export async function fetchMenuItems(): Promise<PaletteItem[]> {
    return menuItems as PaletteItem[];
};