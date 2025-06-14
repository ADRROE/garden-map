/* eslint-disable @typescript-eslint/no-explicit-any */

import { Cell, GardenItem, GardenZone } from "@/types";
import { toColumnLetter } from "@/utils/utils";
import camelcaseKeys from 'camelcase-keys';
import snakecaseKeys from 'snakecase-keys';

const API_BASE_ELEMENTS = process.env.NEXT_PUBLIC_API_URL + "/api/elements/";
const API_BASE_ZONES = process.env.NEXT_PUBLIC_API_URL + "/api/zones/";

export async function fetchElements(): Promise<GardenItem[]> {
    const res = await fetch(API_BASE_ELEMENTS);
    const responseData = camelcaseKeys(await res.json(), { deep: true });
    return responseData;
}

export async function createElementAPI(newElement: GardenItem) {
    const newElementForBackend = snakecaseKeys({
        ...newElement,
        coverage: newElement.coverage ? serializeCells(newElement.coverage) : null
    }, { deep: true })
    await fetch(API_BASE_ELEMENTS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newElementForBackend),
    });
}

export async function updateElementAPI(updates: Partial<GardenItem> & { id: string }, operation: 'create' | 'modify') {
    const updatesForBackend = snakecaseKeys({
        ...updates,
        coverage: updates.coverage ? serializeCells(updates.coverage) : null
    }, { deep: true })

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
        paletteId: cell.menu_element_id,
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

export async function updateZoneAPI(
  updatedZone: { id: string } & Partial<GardenZone>,
  operation: 'create' | 'modify'
) {
  const payload = snakecaseKeys({ updatedZone, operation }, { deep: true });

  await fetch(`${API_BASE_ZONES}${updatedZone.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function deleteZoneAPI(id: string) {
    await fetch(`${API_BASE_ZONES}${id}`, { method: "DELETE" });
}