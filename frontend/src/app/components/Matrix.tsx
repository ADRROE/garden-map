import { useViewportStore } from "@/stores/useViewportStore";
import { useState, useEffect } from "react";

export default function MatrixDebugger() {
  const matrix = useViewportStore((s) => s.matrix);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted || !matrix) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 10,
        left: 10,
        backgroundColor: "rgba(0,0,0,0.7)",
        color: "white",
        padding: "8px 12px",
        borderRadius: "8px",
        fontFamily: "monospace",
        fontSize: "12px",
        zIndex: 0,
      }}
    >
      <div>Matrix:</div>
      <div>a (scaleX): {matrix?.a.toFixed(3)}</div>
      <div>b (skewY): {matrix?.b.toFixed(3)}</div>
      <div>c (skewX): {matrix?.c.toFixed(3)}</div>
      <div>d (scaleY): {matrix?.d.toFixed(3)}</div>
      <div>e (translateX): {matrix?.e.toFixed(1)}</div>
      <div>f (translateY): {matrix?.f.toFixed(1)}</div>
    </div>
  );
}