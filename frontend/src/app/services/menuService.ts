import type { PaletteItem } from "../types";
import { menuItems } from "../lib/menuItems";

export async function fetchMenuElements(): Promise<PaletteItem[]> {
    return menuItems as PaletteItem[];
};