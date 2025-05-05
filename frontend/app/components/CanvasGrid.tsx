import React, { useRef, useEffect } from 'react';
import { LayerManager } from '@/utils/LayerManager';
import { CanvasLayer } from '@/types';

const NUM_ROWS = 225;
const NUM_COLS = 225;
const CELL_SIZE = 20;
const WIDTH = NUM_COLS * CELL_SIZE;
const HEIGHT = NUM_ROWS * CELL_SIZE;

interface CanvasGridProps {
  scale: number;
  setScale: (s: number) => void;
  layers: CanvasLayer[];
  onGridClick: (row: number, col: number) => void;
}

export default function CanvasGrid({
  scale,
  setScale,
  layers,
  onGridClick,
}: CanvasGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLCanvasElement>(null);
  const lmRef = useRef<LayerManager | null>(null);
  const panRef = useRef({ x: 0, y: 0 });
  const scaleRef = useRef(scale);

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  // 1️⃣ init LayerManager
  useEffect(() => {
    lmRef.current = new LayerManager(WIDTH, HEIGHT, layers.map(l => l.name));
    const bgCtx = lmRef.current.getContext('background')!;
    const img = new Image();
    img.src = '/grid.png';
    img.onload = () => {
      // draw static grid
      bgCtx.drawImage(img, 0, 0, WIDTH, HEIGHT);
      bgCtx.strokeStyle = '#CCC'; bgCtx.lineWidth = 0.5;
      for (let x = 0; x <= WIDTH; x += CELL_SIZE) {
        bgCtx.beginPath(); bgCtx.moveTo(x, 0); bgCtx.lineTo(x, HEIGHT); bgCtx.stroke();
      }
      for (let y = 0; y <= HEIGHT; y += CELL_SIZE) {
        bgCtx.beginPath(); bgCtx.moveTo(0, y); bgCtx.lineTo(WIDTH, y); bgCtx.stroke();
      }
      redraw();
    };
  }, [layers]);

  // 2️⃣ for each layer, re‐draw when its deps change
  useEffect(() => {
    const lm = lmRef.current!;

    // redraw each offscreen layer
    layers.filter(l => l.name !== 'background')
      .forEach(({ name, draw }) => {
        const ctx = lm.getContext(name)!;
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        draw(ctx);
      });

    // composite to main canvas
    const main = mainRef.current!;
    const ctx = main.getContext('2d')!;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    lm.drawToMain(ctx, layers.map(l => l.name));

    // flatten all layer.deps into our effect's dependency array:
  }, [scale, panRef, layers]);

  // composite helper
  const redraw = () => {
    const main = mainRef.current!;
    const ctx = main.getContext('2d')!;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    lmRef.current!.drawToMain(ctx, layers.map(l => l.name));
  };


  // 5️⃣ Compute world‑coordinates on click & toggle the Set
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = containerRef.current!.getBoundingClientRect();
    const xCss = e.clientX - rect.left;
    const yCss = e.clientY - rect.top;

    const worldX = xCss / scale + panRef.current.x;
    const worldY = yCss / scale + panRef.current.y;

    const col = Math.floor(worldX / CELL_SIZE);
    const row = Math.floor(worldY / CELL_SIZE);
    if (row < 0 || row >= NUM_ROWS || col < 0 || col >= NUM_COLS) return;

    onGridClick(row, col);
  };

  // 6️⃣  Wheel → update pan/scale state only
  useEffect(() => {
    const container = containerRef.current!;
    let raf = 0;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();

      const rect = container.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        // 👉 Update panRef or scaleRef directly:
        if (e.ctrlKey || e.metaKey) {
          panRef.current = {
            x: panRef.current.x + e.deltaX / scaleRef.current,
            y: panRef.current.y + e.deltaY / scaleRef.current,
          };
        } else {
          const FACTOR = 1.05;
          const dir = e.deltaY > 0 ? 1 / FACTOR : FACTOR;
          let next = scaleRef.current * dir;
          next = Math.min(Math.max(next, 0.5), 4);

          // keep pointer world‑pos fixed
          const worldX = px / scaleRef.current + panRef.current.x;
          const worldY = py / scaleRef.current + panRef.current.y;
          panRef.current = {
            x: worldX - px / next,
            y: worldY - py / next,
          };
          scaleRef.current = next;
        }

        // 👉 apply transform once:
        const w = wrapperRef.current!;
        w.style.transformOrigin = '0 0';
        w.style.transform = `
          scale(${scaleRef.current})
          translate(${-panRef.current.x}px,${-panRef.current.y}px)
        `;
        setScale(scaleRef.current);
        // 👉 composite layers immediately:
        const main = mainRef.current!.getContext('2d')!;
        main.clearRect(0, 0, WIDTH, HEIGHT);
        lmRef.current!.drawToMain(main, layers.map(l => l.name));
      });
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      cancelAnimationFrame(raf);
      container.removeEventListener('wheel', onWheel);
    };
  }, [setScale, layers]);  // only rebind if layer set changes


  return (
    <div ref={containerRef} style={{ width: WIDTH, height: HEIGHT, overflow: 'hidden' }}>
      <div
        ref={wrapperRef}
        onMouseDown={handleMouseDown}
        style={{ position: 'relative', width: WIDTH, height: HEIGHT }}
      >
        <canvas
          ref={mainRef}
          style={{ position: 'absolute', top: 0, left: 0 }}
          width={WIDTH}
          height={HEIGHT}
        />
      </div>
    </div>
  );
}
