import { PaletteItem } from "@/types";
import { useSelectionStore } from "@/stores/useSelectionStore";
import { log } from "@/utils/utils";

export function useSideBarActions() {
    const { setSelectedItemId, setDrawing } = useSelectionStore()

    const initPlacement = (item: PaletteItem) => {
        useSelectionStore.getState().setPlacing(item);
    };

    const handleItemClick = (item: PaletteItem) => {
        log("useMenuActions handleItemClick triggered with: ", item)
        setSelectedItemId(item.id)
        switch (item.category) {
            case 'vegetation':
                initPlacement(item);
                break
            case 'zone':
                setDrawing(item.color)
        }
    }
    return { handleItemClick }
}