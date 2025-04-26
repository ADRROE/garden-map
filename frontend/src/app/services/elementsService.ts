import { ColoredCell, GardenElement, GardenZone } from "../types";

const API_BASE_ELEMENTS = process.env.NEXT_PUBLIC_API_URL + "/api/elements/";
const API_BASE_ZONES = process.env.NEXT_PUBLIC_API_URL + "/api/zones/";

export async function fetchElements(): Promise<GardenElement[]> {
    const res = await fetch(API_BASE_ELEMENTS);
    return res.json();
}

export async function createElementAPI(newElement: GardenElement) {
    await fetch(API_BASE_ELEMENTS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newElement),
    });
}

export async function updateElementAPI(updatedElement: Partial<GardenElement> & { id: string }) {
    await fetch(`${API_BASE_ELEMENTS}${updatedElement.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedElement)
    });
}

export async function deleteElementAPI(id: string) {
    await fetch(`${API_BASE_ELEMENTS}${id}`, { method: "DELETE" });
}

export async function fetchZones(): Promise<GardenZone[]> {
    const res = await fetch(API_BASE_ZONES);
    return res.json();
}

export async function createZoneAPI(cells: ColoredCell[], name: string) {
    await fetch(`${API_BASE_ZONES}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({cells, name})
    });
}

export async function updateZoneAPI( updatedZone: { id: string } & Partial<GardenZone>) {
    await fetch(`${API_BASE_ZONES}${updatedZone.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedZone)
    });
}

export async function deleteZoneAPI(id: string) {
    await fetch(`${API_BASE_ZONES}${id}`, { method: "DELETE" });
}