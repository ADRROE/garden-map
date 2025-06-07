"use client";

import { useRef } from "react";
import Overlay from "../components/Overlay";
import Ruler from "../components/Ruler";
import GardenCanvas from "../components/GardenCanvas";
import { CanvasGridHandle } from "../components/CanvasGrid";
import { useGardenStore } from "../stores/useGardenStore";
import { useSelectionStore } from "@/stores/useSelectionStore";
import { useColorBuffer } from "@/hooks/useColorBuffer";
import { log, warn } from "@/utils/utils";
import { useUIStore } from "@/stores/useUIStore";

export default function Home() {

  const colorBuffer = useColorBuffer()

  const canvasGridRef = useRef<CanvasGridHandle>(null);

  const updateElement = useGardenStore((s) => s.updateElement);

  const handleEditConfirm = (operation: 'create' | 'modify') => {
    console.log(operation);
    log("9 - handleEditConfirm triggered in page via Overlay onEditConfirm prop.")
    const updatedElement = canvasGridRef.current?.getTransformedElementObj();
    log("10 - updatedElement as seen by page: ", updatedElement)
    if (updatedElement) {
      log("11 - ✅ Calling updateElement from within page with: ", updatedElement);
      updateElement(updatedElement, operation);
    };
    if (canvasGridRef.current?.handleEditConfirm) {
      log("11 - canvasGridRef.current.handleConfirm is not null: ", canvasGridRef.current);
      log("12 - Calling canvasGridRef.current.handleEditConfirm()");
      canvasGridRef.current.handleEditConfirm();
    } else {
      warn("12 - GardenCanvas ref is not ready or handleEditConfirm is undefined");
    }
  };

  const handleEditAbort = () => {
    useSelectionStore.getState().clear();
    canvasGridRef.current?.clearColoring();
    useUIStore.getState().dispatch({ type: 'SET_MAP_LOCK', value: true })
  }

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
        position: "relative", // this ensures absolute children work as expected
      }}
    >
      <Overlay
        onEditConfirm={(operation) => handleEditConfirm(operation)}
        onEditAbort={handleEditAbort} />

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
