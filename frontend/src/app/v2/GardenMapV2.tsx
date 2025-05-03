import React, { useRef, useEffect, useState } from 'react';

const NUM_ROWS = 225;
const NUM_COLS = 225;
const CELL_SIZE = 20;
const WIDTH = NUM_COLS * CELL_SIZE;
const HEIGHT = NUM_ROWS * CELL_SIZE;

export default function CanvasGrid({ scale, setScale }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLCanvasElement>(null);
  const zonesRef = useRef<HTMLCanvasElement>(null);

  const [zones, setZones] = useState<Set<string>>(new Set());
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // 1️⃣ Draw the static background + grid exactly once
  useEffect(() => {
    const bg = bgRef.current!;
    bg.width = WIDTH;
    bg.height = HEIGHT;
    const ctx = bg.getContext('2d')!;

    const img = new Image();
    img.src = '/grid.png';
    img.onload = () => {
      ctx.drawImage(img, 0, 0, WIDTH, HEIGHT);
      ctx.strokeStyle = '#CCC';
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= WIDTH; x += CELL_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y <= HEIGHT; y += CELL_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(WIDTH, y);
        ctx.stroke();
      }
    };
  }, []);

  // 2️⃣ Re‐draw zones in *world* space whenever they change
  useEffect(() => {
    const zc = zonesRef.current!;
    zc.width = WIDTH;
    zc.height = HEIGHT;
    const ctx = zc.getContext('2d')!;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = 'green';
    zones.forEach(key => {
      const [row, col] = key.split(',').map(Number);
      ctx.fillRect(
        col * CELL_SIZE,
        row * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );
    });
  }, [zones]);

  // 3️⃣ When the wrapper pans or zooms, apply exactly pan*scale & scale(...)
  useEffect(() => {
    const w = wrapperRef.current!;
    // after (correct)
    w.style.transformOrigin = '0 0';
    w.style.transform = `
  scale(${scale})
  translate(${-pan.x}px, ${-pan.y}px)
`;

  }, [pan, scale]);

  // 4️⃣ Compute world‑coordinates on click & toggle the Set
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = containerRef.current!.getBoundingClientRect();
    const xCss = e.clientX - rect.left;
    const yCss = e.clientY - rect.top;

    const worldX = xCss / scale + pan.x;
    const worldY = yCss / scale + pan.y;

    const col = Math.floor(worldX / CELL_SIZE);
    const row = Math.floor(worldY / CELL_SIZE);
    if (row < 0 || row >= NUM_ROWS || col < 0 || col >= NUM_COLS) return;

    const key = `${row},${col}`;
    setZones(z => {
      const nxt = new Set(z);
      nxt.has(key) ? nxt.delete(key) : nxt.add(key);
      return nxt;
    });
  };

  // 5️⃣ Wheel → update pan/scale state only
  useEffect(() => {
    const container = containerRef.current!;
    const MIN = 0.5, MAX = 4, FACTOR = 1.05;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      if (e.ctrlKey || e.metaKey) {
        // pan
        setPan(p => ({
          x: p.x + e.deltaX / scale,
          y: p.y + e.deltaY / scale,
        }));
      } else {
        // zoom
        const dir = e.deltaY > 0 ? 1 / FACTOR : FACTOR;
        const rawScale = scale * dir;
        const nextScale = Math.min(Math.max(rawScale, MIN), MAX);
        if (nextScale === scale) return; // clamped

        // keep pointer’s world‐pos fixed
        const worldX = px / scale + pan.x;
        const worldY = py / scale + pan.y;
        setPan({
          x: worldX - px / nextScale,
          y: worldY - py / nextScale,
        });
        setScale(nextScale);
      }
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, [pan, scale, setScale]);

  return (
    <div ref={containerRef} style={{ width: WIDTH, height: HEIGHT, overflow: 'hidden' }}>
      <div
        ref={wrapperRef}
        onMouseDown={handleMouseDown}
        style={{ position: 'relative', width: WIDTH, height: HEIGHT }}
      >
        {/* the static grid */}
        <canvas
          ref={bgRef}
          style={{ position: 'absolute', top: 0, left: 0 }}
        />
        {/* the dynamic green zones */}
        <canvas
          ref={zonesRef}
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
        />
      </div>
    </div>
  );
}
