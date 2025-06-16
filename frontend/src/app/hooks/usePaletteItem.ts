import { PaletteItem } from "@/types";
import { useMemo } from "react";
import { useMenuItems } from "./usePaletteItems";

export function useMenuItem(id: string | null): PaletteItem | null {
    const { data: menuItems = [] } = useMenuItems();
    return useMemo(() => {
        if (!id) return null;
        const item = menuItems.find((el) => id === el.id)
        if (item) return item;
        return null
    }, [id, menuItems])
}