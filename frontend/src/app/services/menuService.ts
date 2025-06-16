import type { PaletteItem } from "../types";
import { menuItems } from "../lib/menuItems";

export async function fetchMenuItems(): Promise<PaletteItem[]> {
    return menuItems as PaletteItem[];
};