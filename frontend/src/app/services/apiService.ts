/* eslint-disable @typescript-eslint/no-explicit-any */

import { Cell, GardenElementObject, GardenZone } from "@/types";
import { toColumnLetter } from "@/utils/utils";
import camelcaseKeys from 'camelcase-keys';
import snakecaseKeys from 'snakecase-keys';

const API_BASE_ELEMENTS = process.env.NEXT_PUBLIC_API_URL + "/api/elements/";
const API_BASE_ZONES = process.env.NEXT_PUBLIC_API_URL + "/api/zones/";

export async function fetchElements(): Promise<GardenElementObject[]> {
    const res = await fetch(API_BASE_ELEMENTS);
    const responseData = camelcaseKeys(await res.json(), { deep: true });
    return responseData;
}

export async function createElementAPI(newElement: GardenElementObject) {
    const newElementForBackend = snakecaseKeys({
        ...newElement,
        coverage: newElement.coverage ? serializeCells(newElement.coverage) : null
    })
    await fetch(API_BASE_ELEMENTS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newElementForBackend),
    });
}

export async function updateElementAPI(updates: Partial<GardenElementObject> & { id: string }, operation: 'create' | 'modify') {
    const updatesForBackend = snakecaseKeys({
        ...updates,
        coverage: updates.coverage ? serializeCells(updates.coverage) : null
    })

    await fetch(`${API_BASE_ELEMENTS}${updates.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({updates: updatesForBackend, operation})
    });
}

export async function deleteElementAPI(id: string) {
    await fetch(`${API_BASE_ELEMENTS}${id}`, { method: "DELETE" });
}

function deserializeCell(cell: any): Cell {
    return {
        ...cell,
        menuElementId: cell.menu_element_id,
    };
}

function serializeCells(cells: Cell[]): string[] {
  return cells.map(cell => `${toColumnLetter(cell.col)}${cell.row}`);
}

export async function fetchZones(): Promise<GardenZone[]> {
    const res = await fetch(API_BASE_ZONES);
    const zonesFromBackend = camelcaseKeys(await res.json());

    const zones: GardenZone[] = zonesFromBackend.map((zone: GardenZone) => ({
        ...zone,
        coverage: zone.coverage.map(deserializeCell),
    }));

    return zones;
}

export async function createZoneAPI(cells: Cell[], name: string) {
    await fetch(`${API_BASE_ZONES}`, snakecaseKeys({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({cells, name})
    }));
}

export async function updateZoneAPI( updatedZone: { id: string } & Partial<GardenZone>, operation: 'create' | 'modify') {
    await fetch(`${API_BASE_ZONES}${updatedZone.id}`, snakecaseKeys({
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({updatedZone, operation})
    }));
}

export async function deleteZoneAPI(id: string) {
    await fetch(`${API_BASE_ZONES}${id}`, { method: "DELETE" });
}