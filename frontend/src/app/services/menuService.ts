import type { MenuElement } from "../types";
import { menuItems } from "../lib/menuItems";

export async function fetchMenuElements(): Promise<MenuElement[]> {
    return menuItems as MenuElement[];
};