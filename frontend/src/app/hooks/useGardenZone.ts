/* eslint-disable @typescript-eslint/no-explicit-any */

import { createZoneAPI, fetchZones, updateZoneAPI } from "@/services/apiService";
import { useGardenStore } from "@/stores/useGardenStore";
import { useSelectionStore } from "@/stores/useSelectionStore";
import { Cell, GardenZone, InteractiveZone } from "@/types";
import { log, error } from "@/utils/utils";

export function useGardenZone() {
    const dispatch = useGardenStore((s) => s.dispatch);
    const updateZoneLocally = useGardenStore((s) => s.updateZoneLocally);
    const { clear } = useSelectionStore();

    const confirmPlacement = async (cells: Record<string, Cell>, name: string) => {
        log("19 - confirmPlacement call detected from inside useGardenZone with: ", cells, name);
        const coloredCellsArray: Cell[] = Object.values(cells); // ✅ Convert to array
        log("20 - Dispatching colored cells after conversion to array:", coloredCellsArray);
        dispatch({ type: 'SET_COLORED_CELLS', cells })
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

    const confirmUpdate = async (id: string, updates: Partial<GardenZone>, operation: 'create' | 'modify') => {
        updateZoneLocally(id, updates);
        try {
            await updateZoneAPI(id, updates, operation);
            const fetched = await fetchZones();
            dispatch({ type: 'SET_ZONES', zones: fetched });
        } catch (e) {
            error(e);
        }

    }

    return { confirmUpdate, confirmPlacement }
}