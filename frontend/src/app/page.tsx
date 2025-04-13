"use client"
import GardenMap from "./GardenMap"
import ElementMenu from "./components/ElementMenu";
import { useEffect, useState } from "react";

export default function Home() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

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

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="h-screen overflow-y-auto">
        <ElementMenu />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative">
        <GardenMap dimensions={dimensions} />
      </div>
    </div>
  );
}
