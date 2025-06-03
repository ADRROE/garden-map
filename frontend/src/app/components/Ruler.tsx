import React from "react";
import "./assets/css/ruler.css";
import { useViewportStore } from "@/stores/useViewportStore";

// number of “1 m” segments
const SEGMENTS = 5;
// base width in px at zoom = 1
const BASE_UNIT = 100;

export default React.memo(function Ruler() {

  const matrix = useViewportStore((s) => s.matrix);

  // Extract horizontal scale (DOMMatrix.a == scaleX)
  const scaleX = matrix?.a ?? 1;  

  return (
    <div className="ruler-outer">
      <div
        className="ruler-inner"
        style={{
          width: `${SEGMENTS * BASE_UNIT * scaleX}px`,
          position: "relative",
        }}
      >
        {/* Scaled bars */}
        <div
          className="ruler-bars"
          style={{
            transform: `scaleX(${scaleX})`,
            transformOrigin: "left",
            position: "absolute",
            top: 0,
            left: 0,
            width: `${SEGMENTS * BASE_UNIT}px`,
            height: "100%",
          }}
        >
          {[...Array(SEGMENTS)].map((_, i) => {
            const value = 2.5 * (i + 1);
            const isMajor = value % 5 === 0;

            return (
              <div
                key={`bar-${i}`}
                className={`ruler-bar ${isMajor ? "minor" : "major"}`}
                style={{
                  left: `${i * BASE_UNIT}px`,
                  position: "absolute",
                }}
              />
            );
          })}
        </div>

        {/* Labels aligned to bar centers */}
        {[...Array(SEGMENTS)].map((_, i) => {
          const value = 2.5 * (i + 1);
          const scaledLeft = (i + 0.5) * BASE_UNIT * scaleX;

          return (
            <div
              key={`label-${i}`}
              className="ruler-label"
              style={{
                position: "absolute",
                left: `${scaledLeft}px`,
                transform: "translateX(-50%)",
              }}
            >
              {value} m
            </div>
          );
        })}
      </div>
    </div>
  );
});