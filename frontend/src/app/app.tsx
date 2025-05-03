// App.tsx or Home.tsx
import { useEffect, useState } from "react";
import CanvasGrid from "./CanvasGrid";
import Overlay from "./Overlay";

export default function App() {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) return; // skip pinch-zoom

      const zoomIntensity = 0.2;
      const zoomFactor = Math.exp(-e.deltaY * zoomIntensity * 0.01);

      const rect = document.body.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const worldX = (mouseX - offset.x) / scale;
      const worldY = (mouseY - offset.y) / scale;

      const newScale = Math.min(Math.max(scale * zoomFactor, 0.5), 4);

      const newOffset = {
        x: mouseX - worldX * newScale,
        y: mouseY - worldY * newScale,
      };

      setScale(newScale);
      setOffset(newOffset);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [scale, offset]);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Scaled and translated world */}
      <div
        className="absolute top-0 left-0"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: "top left",
          width: 2250,
          height: 2250,
        }}
      >
        <CanvasGrid
          scale={scale}
          setScale={setScale}
          onOffsetChange={setOffset} />
      </div>

      {/* Overlay UI - not scaled */}
      <div className="fixed top-0 left-0 z-50 pointer-events-none w-screen h-screen">
        <Overlay/>
        {/* Add any fixed UI like buttons here */}
      </div>
    </div>
  );
}

