"use client";

import { useEffect, useCallback, useRef } from "react";
import Overlay from "../components/Overlay";
import Ruler from "../components/Ruler";
import GardenCanvas from "../components/GardenCanvas";
import debounce from "lodash.debounce";
import { useUIStore } from "../stores/useUIStore";
import { CanvasGridHandle } from "../components/CanvasGrid";
import { useGardenStore } from "../stores/useGardenStore";
import { useSelectionStore } from "../stores/useSelectionStore";



export default function Home() {

  const updateScale = useCallback(() => {
    const targetWidth = 2560;
    const targetHeight = 1440;
    const newScale = Math.min(
      window.innerWidth / targetWidth,
      window.innerHeight / targetHeight
    );
    useUIStore.getState().setScale(newScale);

  }, []);

  const canvasGridRef = useRef<CanvasGridHandle>(null);

  const updateElement = useGardenStore((s) => s.updateElement);
  const clearSelection = useSelectionStore((s) => s.clear);



  const handleEditConfirm = () => {
    const updated = canvasGridRef.current?.getTransformedElement();
    if (updated) {
      updateElement(updated); // whatever logic you use to update your element list
      clearSelection(); // etc.
    }
  };

  useEffect(() => {
    const debounced = debounce(updateScale, 100);
    debounced(); // run immediately on mount
    window.addEventListener("resize", debounced);
    return () => window.removeEventListener("resize", debounced);
  }, [updateScale]);

  // useEffect(() => {
  //   if (process.env.NODE_ENV === "development") {
  //     setInterval(() => {
  //       document.querySelector("body > nextjs-portal")?.remove();
  //     }, 10);
  //   }
  // }, []);

  return (

    <div
      style={{
        width: 1440,
        height: 1024,
        position: "relative", // this ensures absolute children work as expected
      }}
    >
      <Overlay onEditConfirm={handleEditConfirm} />

      {/* Stick ruler to bottom center */}
      <div className="fixed bottom-6 left-1/2 z-50" style={{ transform: "translateX(-50%)" }}>
        <Ruler />
      </div>

      <GardenCanvas
        ref={canvasGridRef} />
    </div>
  );
}
