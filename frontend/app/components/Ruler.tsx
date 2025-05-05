// components/Ruler.tsx
import React, { useLayoutEffect, useRef } from "react";
import { useGarden } from "@/context/GardenContext";
import "@/components/assets/css/ruler.css";

// number of “1 m” segments
const SEGMENTS = 5;
// base width in px at zoom = 1
const BASE_UNIT = 150;

export default React.memo(function Ruler() {
  const {
    state: { scale },
  } = useGarden();
  const inner = useRef<HTMLDivElement>(null);

  // GPU‐accelerated transform
  useLayoutEffect(() => {
    if (inner.current) {
      inner.current.style.transform = `scaleX(${scale})`;
    }
  }, [scale]);

  return (
    <div className="ruler-outer">
      <div
        ref={inner}
        className="ruler-inner"
        style={{
          width: `${SEGMENTS * BASE_UNIT}px`,
          transformOrigin: "0 0",
          willChange: "transform",
        }}
      >
        {[...Array(SEGMENTS)].map((_, i) => (
          <React.Fragment key={i}>
            <div
              className={`ruler-bar ${i % 2 ? "odd" : "even"}`}
              style={{ left: `${i * BASE_UNIT}px` }}
            />
            <div
              className="ruler-label"
              style={{ left: `${i * BASE_UNIT + (BASE_UNIT - 44) / 2}px` }}
            >
              {i + 1} m
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
});
