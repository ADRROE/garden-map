"use client";

import { useEffect } from "react";
import Overlay from "./components/Overlay";
import Ruler from "./components/Ruler";
import GardenMap from "./components/GardenMap";
import { useGarden } from "./context/GardenContext";


export default function Home() {

const {state, dispatch} = useGarden()

  useEffect(() => {
    const updateScale = () => {
      const targetWidth = 2560;
      const targetHeight = 1440;
      const newScale = Math.min(
        window.innerWidth / targetWidth,
        window.innerHeight / targetHeight
      );
      dispatch({ type:'SET_SCALE', scale: newScale })      };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [dispatch]);

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
        <div className="fixed bottom-20 left-1/2 z-50">
          <Ruler scale={state.scale} />
        </div>

        <GardenMap/>
      </div>
  );
}
