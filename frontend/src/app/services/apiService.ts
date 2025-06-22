/* eslint-disable @typescript-eslint/no-explicit-any */

import { Cell, GardenItem, GardenZone } from "@/types";
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
        ...newItem
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
    const payload = snakecaseKeys(updates, { deep: true })

    await fetch(`${API_BASE_ITEMS}${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: payload, operation })
    });
}

export async function deleteItemAPI(id: string) {
    await fetch(`${API_BASE_ITEMS}${id}`, { method: "DELETE" });
}

export async function fetchZones(): Promise<GardenZone[]> {
    const res = await fetch(API_BASE_ZONES);
    const zones = camelcaseKeys(await res.json(), { deep: true });

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { coverage, ...rest } = updates
    const payload = snakecaseKeys(
        rest
        , { deep: true });

    await fetch(`${API_BASE_ZONES}${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: payload, operation }),
    });
}

export async function deleteZoneAPI(id: string) {
    await fetch(`${API_BASE_ZONES}${id}`, { method: "DELETE" });
}