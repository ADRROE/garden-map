import { GardenElement } from "../types";

export async function fetchElements(): Promise<GardenElement[]> {
    const res = await fetch("/api/elements");
    return res.json();
}

export async function createElementAPI(newElement: GardenElement) {
    await fetch("/api/elements", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(newElement),
    });
}

export async function updateElementAPI(updatedElement: Partial<GardenElement> & {id: string} ) {
    await fetch("/api/elements", {
       method: "PUT",
       headers: {"Content-Type": "application/json"},
       body: JSON.stringify(updatedElement)
    });
}

export async function deleteElementAPI(id: string) {
    await fetch(`/api/elements?id=${id}`, { method: "DELETE" });
  }