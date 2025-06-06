/* eslint-disable @typescript-eslint/no-explicit-any */

import { ColoredCell, GardenElementObject, GardenZone } from "@/types";

const API_BASE_ELEMENTS = process.env.NEXT_PUBLIC_API_URL + "/api/elements/";
const API_BASE_ZONES = process.env.NEXT_PUBLIC_API_URL + "/api/zones/";

export async function fetchElements(): Promise<GardenElementObject[]> {
    console.log(API_BASE_ELEMENTS)
    const res = await fetch(API_BASE_ELEMENTS);
    return res.json();
}

export async function createElementAPI(newElement: GardenElementObject) {
    await fetch(API_BASE_ELEMENTS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newElement),
    });
}

export async function updateElementAPI(updates: Partial<GardenElementObject> & { id: string }, operation: 'create' | 'modify') {
    console.log(`UpdateElementAPI called with updates: ${updates}, operation: ${operation}`);
    await fetch(`${API_BASE_ELEMENTS}${updates.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({updates, operation})
    });
}

export async function deleteElementAPI(id: string) {
    await fetch(`${API_BASE_ELEMENTS}${id}`, { method: "DELETE" });
}

function deserializeCell(cell: any): ColoredCell {
    return {
        ...cell,
        menuElementId: cell.menu_element_id,
    };
}

export async function fetchZones(): Promise<GardenZone[]> {
    const res = await fetch(API_BASE_ZONES);
    const zonesFromBackend = await res.json();

    const zones: GardenZone[] = zonesFromBackend.map((zone: GardenZone) => ({
        ...zone,
        coverage: zone.coverage.map(deserializeCell),
    }));

    return zones;
}

export async function createZoneAPI(cells: ColoredCell[], name: string) {
    await fetch(`${API_BASE_ZONES}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({cells, name})
    });
}

export async function updateZoneAPI( updatedZone: { id: string } & Partial<GardenZone>, operation: 'create' | 'modify') {
    await fetch(`${API_BASE_ZONES}${updatedZone.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({updatedZone, operation})
    });
}

export async function deleteZoneAPI(id: string) {
    await fetch(`${API_BASE_ZONES}${id}`, { method: "DELETE" });
}