"use client";

import { useEffect, useState } from "react";
import GardenMap from "./v1/GardenMap";
import ElementMenu from "./v1/components/ElementMenu";
import MenuController from "./v1/components/MenuController";
import { useGarden } from "./v1/context/GardenContext";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Overlay from "./v2/Overlay";
import Ruler from "./v2/components/Ruler";

// Dynamically import CanvasGrid (disable SSR to avoid window undefined errors)
const CanvasGrid = dynamic(() => import("./v2/GardenMapV2"), { ssr: false });

export default function Home() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const { isSelectingElement } = useGarden();

  const useCanvasGrid = process.env.NEXT_PUBLIC_USE_CANVAS_GRID === "true";

  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const targetWidth = 2560;
      const targetHeight = 1440;
      const newScale = Math.min(
        window.innerWidth / targetWidth,
        window.innerHeight / targetHeight
      );
      setScale(newScale);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      setInterval(() => {
        document.querySelector("body > nextjs-portal")?.remove();
      }, 10);
    }
  }, []);

  return (
    <div className="relative w-screen h-screen bg-white">
      <AnimatePresence>
        {isSelectingElement && (
          <motion.div
            key="element-menu"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 1 }}
            className="h-screen overflow-y-auto"
          >
            <ElementMenu />
          </motion.div>
        )}
      </AnimatePresence>
      <div
        style={{
          width: 1440,
          height: 1024,
          position: "relative", // this ensures absolute children work as expected
        }}
      >
{useCanvasGrid ? (
  <>
    <Overlay />

    {/* Stick ruler to bottom center */}
    <div className="fixed bottom-20 left-1/2 z-50">
  <Ruler scale={scale} />
</div>

    <CanvasGrid
      scale={scale}
      setScale={setScale}
    />
  </>
) : (
  <>
    <GardenMap dimensions={dimensions} />
    <MenuController />
  </>
)}
      </div>
    </div>
  );
}
