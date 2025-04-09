"use client"
import GardenMap from "./GardenMap"
import ElementPicker from "./components/PickerMenu";
import { useEffect, useState } from "react";

export default function Home() {
  const sidebarWidth = 80;
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth - sidebarWidth,
        height: window.innerHeight,
      });
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [sidebarWidth]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-80 shrink-0 h-screen overflow-y-auto">
        <ElementPicker />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative">
        <GardenMap dimensions={dimensions} />
      </div>
    </div>
  );
}
