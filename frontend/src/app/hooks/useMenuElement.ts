import { MenuElement } from "@/types";
import { useMemo } from "react";
import { useMenuElements } from "./useMenuElements";

export function useMenuElement(id: string | null): MenuElement | null {
    const { data: menuElements = [] } = useMenuElements();
    return useMemo(() => {
        if (!id) return null;
        const element = menuElements.find((el) => id === el.id)
        if (element) return element;
        return null
    }, [id, menuElements])
}