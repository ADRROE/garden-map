"use client";

import { useEffect, useCallback, useRef } from "react";
import Overlay from "../components/Overlay";
import Ruler from "../components/Ruler";
import GardenCanvas from "../components/GardenCanvas";
import debounce from "lodash.debounce";
import { useUIStore } from "../stores/useUIStore";
import { CanvasGridHandle } from "../components/CanvasGrid";
import { useGardenStore } from "../stores/useGardenStore";
import { useColorBuffer } from "@/hooks/useColorBuffer";
import { log, warn } from "@/utils/utils";

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

  const colorBuffer = useColorBuffer()

  const canvasGridRef = useRef<CanvasGridHandle>(null);

  const updateElement = useGardenStore((s) => s.updateElement);
  
  const handleEditConfirm = () => {
    log("9 - handleEditConfirm triggered in page via Overlay onEditConfirm prop.")
    const updatedElement = canvasGridRef.current?.getTransformedElement();
    log("10 - updatedElement as seen by page: ", updatedElement)
    if (updatedElement) {
      log("11 - ✅ Calling updateElement from within page with: ", updatedElement);
      updateElement(updatedElement);

    };
  if (canvasGridRef.current?.handleEditConfirm) {
    log("11 - canvasGridRef.current.handleConfirm is not null: ", canvasGridRef.current);
    log("12 - Calling canvasGridRef.current.handleEditConfirm()");
    canvasGridRef.current.handleEditConfirm();
  } else {
    warn("12 - GardenCanvas ref is not ready or handleEditConfirm is undefined");
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
        ref={canvasGridRef}
        colorBuffer={colorBuffer} />
    </div>
  );
}
