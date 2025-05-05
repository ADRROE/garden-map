import type { MenuElement } from "@/types";
import raw from '@/data/MenuElements.json';

export async function fetchMenuElements(): Promise<MenuElement[]> {
    // in the future this could do `await fetch("/api/menu")`
    // or pull from a CMS, GraphQL endpoint, etc.
    return raw as MenuElement[];
  };