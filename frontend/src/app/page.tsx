"use client"
import GardenMap from "./GardenMap"
import ElementMenu from "./components/ElementMenu";
import { useEffect, useState } from "react";
import MenuController from "./components/MenuController";
import { useGarden } from "./context/GardenContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const { isSelectingElement } = useGarden()

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
    <div className="flex h-screen">
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
      <div className="flex-1 relative">
        <GardenMap dimensions={dimensions} />
      </div>

      <MenuController />

    </div>
  );
}
