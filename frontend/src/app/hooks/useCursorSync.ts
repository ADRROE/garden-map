import { useEffect } from "react";
import { useUIStore } from "@/stores/useUIStore";
import { useSelectionStore } from "@/stores/useSelectionStore";
import { useMenuItem } from "@/hooks/usePaletteItem";
import { Canvas } from "fabric";
import { useSelectionState } from "./useSelectionState";
import { resolveCursor } from "@/lib/cursorMappings";

export function useCursorSync(fabricCanvas?: Canvas | null, naming?: boolean, overrideCursor?: string | null) {
    const selectedItemId = useSelectionStore((s) => s.selectedItemId);
    const menuItem = useMenuItem(selectedItemId);
    const selection = useSelectionState();

    // 1. Handle high-level cursor intent logic
    useEffect(() => {
        if (!fabricCanvas || overrideCursor) return;

        const image = menuItem?.cursor;
        const resolved = resolveCursor(selection.selection, naming, menuItem);

        if (selection.isPlacing && image && !naming) {
            const img = new Image();
            img.src = image;

            img.onload = () => {
                const cursorUrl = `url(${image}) 16 16, auto`;
                const currentCursor = useUIStore.getState().cursor;
                if (currentCursor !== resolved) {
                    useUIStore.getState().dispatch({ type: "SET_CURSOR", cursor: cursorUrl });
                }

            };

            img.onerror = () => {
                console.warn("Failed to load cursor image:", image);
                const currentCursor = useUIStore.getState().cursor;
                if (currentCursor !== resolved) {
                    useUIStore.getState().dispatch({ type: "SET_CURSOR", cursor: resolved });
                }

            };
        } else {
            // Fallback for non-image cursors or when naming is true
            const currentCursor = useUIStore.getState().cursor;
            if (currentCursor !== resolved) {
                useUIStore.getState().dispatch({ type: "SET_CURSOR", cursor: resolved });
            }

        }
    }, [fabricCanvas, naming, menuItem, selection, overrideCursor]);

    // 2. Reflect UI store cursor state to DOM and Fabric
    useEffect(() => {
        const unsubscribe = useUIStore.subscribe((state) => {
            const cursor = overrideCursor ?? state.cursor;
            // DOM body
            document.body.style.cursor = cursor;
            if (!fabricCanvas) return;

            // Fabric default
            fabricCanvas.defaultCursor = cursor;

            const el = fabricCanvas.getElement();
            if (el) el.style.cursor = cursor;
        });

        return () => unsubscribe();
    }, [fabricCanvas]);
}