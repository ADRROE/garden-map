import { GardenElement } from "../types";

const API_BASE = "http://localhost:8000/api/elements";

export async function fetchElements(): Promise<GardenElement[]> {
    const res = await fetch(API_BASE);
    return res.json();
}

export async function createElementAPI(newElement: GardenElement) {
    await fetch(API_BASE, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(newElement),
    });
}

export async function updateElementAPI(updatedElement: Partial<GardenElement> & {id: string} ) {
    await fetch(`${API_BASE}/${updatedElement.id}` , {
       method: "PUT",
       headers: {"Content-Type": "application/json"},
       body: JSON.stringify(updatedElement)
    });
}

export async function deleteElementAPI(id: string) {
    await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
  }