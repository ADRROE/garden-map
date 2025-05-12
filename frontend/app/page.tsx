"use client";

import { useEffect, useCallback } from "react";
import Overlay from "./components/Overlay";
import Ruler from "./components/Ruler";
import GardenCanvas from "./components/GardenCanvas";
import { useGardenData } from "./contexts/GardenDataContext";
import debounce from "lodash.debounce";


export default function Home() {
  const { datadispatch } = useGardenData();

  const updateScale = useCallback(() => {
    const targetWidth = 2560;
    const targetHeight = 1440;
    const newScale = Math.min(
      window.innerWidth / targetWidth,
      window.innerHeight / targetHeight
    );
    datadispatch({ type: "SET_SCALE", scale: newScale });
  }, [datadispatch]);

  useEffect(() => {
    const debounced = debounce(updateScale, 100);
    debounced(); // run immediately on mount
    window.addEventListener("resize", debounced);
    return () => window.removeEventListener("resize", debounced);
  }, [updateScale]);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      setInterval(() => {
        document.querySelector("body > nextjs-portal")?.remove();
      }, 10);
    }
  }, []);

  return (

      <div
        style={{
          width: 1440,
          height: 1024,
          position: "relative", // this ensures absolute children work as expected
        }}
      >
        <Overlay />

        {/* Stick ruler to bottom center */}
        <div className="fixed bottom-6 left-1/2 z-50" style={{ transform: "translateX(-50%)" }}>
          <Ruler/>
        </div>

        <GardenCanvas/>
      </div>
  );
}
