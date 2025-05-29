// stores/useViewportStore.ts
import { constrainMatrix } from "@/utils/utils";
import { create } from "zustand";

type ViewportState = {
    matrix: DOMMatrix | null;
    setMatrix: (m: DOMMatrix) => void;
    reset: () => void;
    setScale: (scale: number, center?: { x: number; y: number }) => void;
    getScale: () => number;
};

export const useViewportStore = create<ViewportState>((set, get) => ({
    matrix: typeof window !== "undefined" ? new DOMMatrix() : null,
    setMatrix: (m) => {
        const bounds = { width: 4500, height: 4500 };
        const viewport = { width: window.innerWidth, height: window.innerHeight };
        const constrained = constrainMatrix(m, bounds, viewport);

        set({ matrix: constrained })
    },
    reset: () =>
        set({
            matrix: typeof window !== "undefined" ? new DOMMatrix() : null,
        }),
    setScale: (scale, center = {  x: window.innerWidth / 2, y: window.innerHeight / 2 }) => {
        if (typeof window === "undefined") return;
        const bounds = { width: 4500, height: 4500 };
        const viewport = { width: window.innerWidth, height: window.innerHeight };
        const clampedScale = Math.max(0.5, Math.min(scale, 2.0)); // or whatever range you want

        const current = get().matrix ?? new DOMMatrix();
        const updated = current
            .translate(center.x, center.y)
            .scale(clampedScale)
            .translate(-center.x, -center.y);

        const constrained = constrainMatrix(updated, bounds, viewport);
        set({ matrix: constrained });
    },
    getScale: () => get().matrix?.a ?? 1
}));