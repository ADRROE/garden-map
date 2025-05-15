import React, { useRef, useEffect } from 'react';
import { LayerManager } from '@/utils/LayerManager';
import { CanvasLayer } from '@/types';
import { Canvas } from 'fabric';
import { useGardenStore } from '@/hooks/useGardenStore';
import { useUIStore } from '@/stores/useUIStore';
import { useSelection } from '@/hooks/useSelection';

const NUM_ROWS = 225;
const NUM_COLS = 225;
const CELL_SIZE = 20;
const WIDTH = NUM_COLS * CELL_SIZE;
const HEIGHT = NUM_ROWS * CELL_SIZE;

interface CanvasGridProps {
  layers: CanvasLayer[];
  onWorldClick: (row: number, col: number) => void;
}

export default function CanvasGrid({
  layers,
  onWorldClick,
}: CanvasGridProps) {

  const datastate = useGardenStore(state => state.present)
  const {scale, setScale} = useUIStore()
  const {selectedItem} = useSelection()

  const scaleRef = useRef(scale);
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLCanvasElement>(null);
  const lmRef = useRef<LayerManager | null>(null);
  const panRef = useRef({ x: 0, y: 0 });
  const fabricCanvasRef = useRef<Canvas | null>(null);

  const cursorImage = datastate.pendingPosition ? datastate.selectedElement?.cursor : null ;

  const needsRedrawRef = useRef(false);
const frameRequestedRef = useRef(false);

const throttledRedraw = () => {
  if (frameRequestedRef.current) {
    needsRedrawRef.current = true;
    return;
  }

  frameRequestedRef.current = true;

  requestAnimationFrame(() => {
    redraw();
    frameRequestedRef.current = false;

    if (needsRedrawRef.current) {
      needsRedrawRef.current = false;
      throttledRedraw(); // immediately schedule the next frame
    }
  });
};

  const getRenderResolution = (scale: number) => {
    if (scale < 0.7) return 0.8;
    if (scale < 1.2) return 0.9;
    if (scale < 1.5) return 1.0;
    return 2.0;
  };

  const redraw = () => {
    const canvas = mainRef.current!;
    if (!canvas) return

    const ctx = canvas.getContext('2d')!;
  
    const renderFactor = getRenderResolution(scaleRef.current);
    const renderWidth = WIDTH * renderFactor;
    const renderHeight = HEIGHT * renderFactor;
  
    // Resize canvas resolution
    canvas.width = renderWidth;
    canvas.height = renderHeight;
  
    // Keep visual size the same via CSS
    canvas.style.width = `${WIDTH}px`;
    canvas.style.height = `${HEIGHT}px`;
  
    ctx.setTransform(renderFactor, 0, 0, renderFactor, 0, 0);  // scale context
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
  
    lmRef.current!.drawToMain(ctx, layers.map(l => l.name));
  };

  useEffect(() => {
    if (!mainRef.current) return;

    // Initialize Fabric only once
    fabricCanvasRef.current = new Canvas(mainRef.current, {
      selection: true,
      preserveObjectStacking: true,
    });
    fabricCanvasRef.current.defaultCursor = `url(${cursorImage}) 16 16, auto`;

    return () => {
      fabricCanvasRef.current?.dispose();
    };
  }, []);

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
      throttledRedraw();
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
  }, [scale, layers]);

  useEffect(() => {
    throttledRedraw();
  }, [scale, layers]);

  useEffect(() => {
    const fabricCanvas = fabricCanvasRef.current;
    if (!fabricCanvas) return;

    const cursorImage = selectedItem?.cursor;
  
    if (cursorImage) {
      const img = new Image();
      img.src = cursorImage;
  
      img.onload = () => {
        const cursorUrl = `url(${cursorImage}) 16 16, auto`;
        document.body.style.cursor = cursorUrl;
        fabricCanvas.defaultCursor = cursorUrl;
      };
  
      img.onerror = () => {
        console.warn("Failed to load cursor image:", cursorImage);
        document.body.style.cursor = "crosshair";
        fabricCanvas.defaultCursor = "crosshair";
      };
    } else {
      document.body.style.cursor = "default";
      fabricCanvas.defaultCursor = "default";
    }
  }, [selectedItem]);


  // 5️⃣ Compute world‑coordinates on click & toggle the Set
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = containerRef.current!.getBoundingClientRect();
    const xCss = e.clientX - rect.left;
    const yCss = e.clientY - rect.top;
  
    const worldX = xCss / scale + panRef.current.x;
    const worldY = yCss / scale + panRef.current.y;
  
    onWorldClick?.(worldX, worldY);
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
        throttledRedraw()
      });
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      cancelAnimationFrame(raf);
      container.removeEventListener('wheel', onWheel);
    };
  }, [setScale, layers]);  // only rebind if layer set changes


  return (
    <div ref={containerRef} style={{ width: WIDTH, height: HEIGHT, overflow: 'hidden', cursor: 'inherit' }}>
      <div
        ref={wrapperRef}
        onMouseDown={handleMouseDown}
        style={{ position: 'relative', width: WIDTH, height: HEIGHT, cursor: 'inherit' }}
      >
        <canvas
          ref={mainRef}
          style={{ position: 'absolute', top: 0, left: 0, cursor: 'inherit' }}
          width={WIDTH}
          height={HEIGHT}
        />
      </div>
    </div>
  );
}