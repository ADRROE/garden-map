import React from "react";
import './ruler.css';

interface RulerProps {
  scale: number;
}

const Ruler: React.FC<RulerProps> = ({ scale }) => {
  const baseWidth = 40;
  const labels = [1, 2, 3, 4, 5];
  const totalWidth = labels.length * baseWidth * scale;

  return (
    <div
      className="fixed bottom-4 z-50"
      style={{
        left: `calc(50% - ${totalWidth / 2}px)`,
        width: `${totalWidth}px`,
        height: "40px", // ensure space for bars + labels
        position: "fixed",
      }}
    >
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        {/* Bars */}
        {labels.map((val, idx) => (
          <div
            key={`bar-${idx}`}
            className={`scalepart-${idx}`}
            style={{
              position: 'absolute',
              top: 30.48,
              left: idx * baseWidth * scale,
              width: baseWidth * scale,
              height: 9.52,
              backgroundColor: idx % 2 === 0 ? '#000' : '#fff',
            }}
          />
        ))}

        {/* Labels */}
        {labels.map((val, idx) => (
  <div
    key={`label-${idx}`}
    className={`shape text c-${val}-m`}
    style={{
      position: 'absolute',
      top: 0,
      left: idx * baseWidth * scale + (baseWidth * scale - 44) / 2,
      width: 44,
      height: 30.48,
      textAlign: 'center',
    }}
  >
    <span
      className="text-node root-0-paragraph-set-0-paragraph-0-text-0"
      style={{ fontSize: 14 }}
    >
      {val} m
    </span>
  </div>
))}
      </div>
    </div>
  );
};

export default Ruler;