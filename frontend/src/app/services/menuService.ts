import type { MenuElement } from "../types";
import { menuItems } from "../components/assets/menuItems";

export async function fetchMenuElements(): Promise<MenuElement[]> {
    return menuItems as MenuElement[];
};