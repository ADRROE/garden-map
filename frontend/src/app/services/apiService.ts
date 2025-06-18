/* eslint-disable @typescript-eslint/no-explicit-any */

import { Cell, GardenItem, GardenZone } from "@/types";
import { toColumnLetter } from "@/utils/utils";
import camelcaseKeys from 'camelcase-keys';
import snakecaseKeys from 'snakecase-keys';

const API_BASE_ITEMS = process.env.NEXT_PUBLIC_API_URL + "/api/items/";
const API_BASE_ZONES = process.env.NEXT_PUBLIC_API_URL + "/api/zones/";

export async function fetchItems(): Promise<GardenItem[]> {
    const res = await fetch(API_BASE_ITEMS);
    const payload = camelcaseKeys(await res.json(), { deep: true });
    return payload;
}

export async function createItemAPI(newItem: GardenItem) {
    const payload = snakecaseKeys({
        ...newItem,
        coverage: newItem.coverage ? serializeCells(newItem.coverage) : null
    }, { deep: true })
    const res = await fetch(API_BASE_ITEMS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const createdItem = await res.json();
    return camelcaseKeys(createdItem, { deep: true });
}

export async function updateItemAPI(id: string, updates: Partial<GardenItem>, operation: 'create' | 'modify') {
    const payload = snakecaseKeys({
        ...updates,
        coverage: updates.coverage ? serializeCells(updates.coverage) : null
    }, { deep: true })

    await fetch(`${API_BASE_ITEMS}${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: payload, operation })
    });
}

export async function deleteItemAPI(id: string) {
    await fetch(`${API_BASE_ITEMS}${id}`, { method: "DELETE" });
}

function deserializeCell(cell: any): Cell {
    return {
        ...cell,
        paletteItemId: cell.palette_item_id,
    };
}

function serializeCells(cells: Cell[]): string[] {
    return cells.map(cell => `${toColumnLetter(cell.col)}${cell.row}`);
}

export async function fetchZones(): Promise<GardenZone[]> {
    const res = await fetch(API_BASE_ZONES);
    const zonesFromBackend = camelcaseKeys(await res.json(), { deep: true });

    const zones: GardenZone[] = zonesFromBackend.map((zone: GardenZone) => ({
        ...zone,
        coverage: zone.coverage.map(deserializeCell),
    }));

    return zones;
}

export async function createZoneAPI(cells: Cell[], display_name: string) {
    const payload = snakecaseKeys({ cells, display_name }, { deep: true });

    await fetch(`${API_BASE_ZONES}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
}

export async function updateZoneAPI(id: string, updates: Partial<GardenZone>, operation: 'create' | 'modify') {
    const payload = snakecaseKeys({
        ...updates,
        coverage: updates.coverage ? updates.coverage : null
    }, { deep: true });

    await fetch(`${API_BASE_ZONES}${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: payload, operation }),
    });
}

export async function deleteZoneAPI(id: string) {
    await fetch(`${API_BASE_ZONES}${id}`, { method: "DELETE" });
}