import { createZoneAPI, fetchZones } from "@/services/apiService";
import { useGardenStore } from "@/stores/useGardenStore";
import { useSelectionStore } from "@/stores/useSelectionStore";
import { Cell } from "@/types";
import { log, error } from "@/utils/utils";

export function useGardenZone() {
    const { dispatch } = useGardenStore()
    const { clear } = useSelectionStore()

    const confirmPlacement = async (coloredCells: Record<string, Cell>,name: string) => {
        log("19 - confirmPlacement call detected from inside useGardenZone with: ", coloredCells, name);
        const coloredCellsArray: Cell[] = Object.values(coloredCells); // ✅ Convert to array
        log("20 - Dispatching colored cells after conversion to array:", coloredCellsArray);
        dispatch({ type: 'SET_COLORED_CELLS', cells: coloredCells })
        try {
            log("21 - Now calling createZoneAPI with arguments: ", coloredCellsArray, name);
            await createZoneAPI(coloredCellsArray, name);
            log("22 - Fetching zones...");
            const fetched = await fetchZones();
            log("23 - Received zones from backend: ", fetched);
            log("24 - Dispatching 'SET_ZONES'");
            dispatch({ type: 'SET_ZONES', zones: fetched });
            log("25 - Clearing selection...")
            clear()
        } catch (e) {
            error(e);
        }
    }

    return { confirmPlacement }
}