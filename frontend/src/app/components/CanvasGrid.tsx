import React, { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { LayerManager } from '../utils/LayerManager';
import { CanvasLayer, ColoredCell, GardenElement } from '../types';
import { Canvas, FabricObject } from 'fabric';
import { useUIStore } from '../stores/useUIStore';
import { useSelectionStore } from '../stores/useSelectionStore';
import { createFabricElement } from '../utils/FabricHelpers';
import { log, warn } from "@/utils/utils";

const NUM_ROWS = 225;
const NUM_COLS = 225;
const CELL_SIZE = 20;
const WIDTH = NUM_COLS * CELL_SIZE;
const HEIGHT = NUM_ROWS * CELL_SIZE;


export interface CanvasGridHandle {
  getTransformedElement: () => GardenElement | null;
  colorCell: (cell: Partial<ColoredCell>) => void;
  clearColoring: () => void;
  getBounds: () => DOMRect | undefined;
  wrapper?: HTMLDivElement | null;
  mainCanvas?: HTMLCanvasElement | null;
  colorCanvas?: HTMLCanvasElement | null;
  handleEditConfirm?: () => void;
}

interface CanvasGridProps {
  layers: CanvasLayer[];
  selectedElement: GardenElement | null
  onWorldClick: (row: number, col: number) => void;
  onEditConfirm?: (updated: GardenElement) => void;
  onMouseMove?: (e: React.MouseEvent<HTMLDivElement>) => void;
}


const CanvasGrid = forwardRef<CanvasGridHandle, CanvasGridProps>(
  ({ layers, selectedElement, onWorldClick, onMouseMove }, ref) => {
    const fabricCanvasRef = useRef<Canvas | null>(null);
    const fabricObjectRef = useRef<FabricObject | null>(null);
    const colorCtxRef = useRef<CanvasRenderingContext2D | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const mainCanvasRef = useRef<HTMLCanvasElement>(null);
    const colorCanvasRef = useRef<HTMLCanvasElement>(null);

    useImperativeHandle(ref, () => ({
      getTransformedElement: () => {
        const obj = fabricObjectRef.current;
        if (!obj || !selectedElement) return null;

        return {
          ...selectedElement,
          x: obj.left ?? selectedElement.x,
          y: obj.top ?? selectedElement.y,
          width: obj.width! * obj.scaleX!,
          height: obj.height! * obj.scaleY!,
        };
      },
      colorCell: (cell) => {
        const ctx = colorCtxRef.current;
        if (!ctx) return;
        if (cell.color && cell.x && cell.y) {
          log("8 - Now coloring cell from within CanvasGrid.")
          ctx.fillStyle = cell.color;
          ctx.fillRect(cell.x * CELL_SIZE, cell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      },

      clearColoring: () => {
        const ctx = colorCtxRef.current;
        if (!ctx) return;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      },
      getBounds: () => wrapperRef.current?.getBoundingClientRect(),
      wrapper: wrapperRef.current,
      colorCanvas: colorCanvasRef.current,
      mainCanvas: mainCanvasRef.current,
    }));

    const { scale: initialScale, setScale, pan: initialPan, setPan } = useUIStore();

    const scaleRef = useRef(initialScale);
    const panRef = useRef(initialPan);
    const containerRef = useRef<HTMLDivElement>(null);


    const lmRef = useRef<LayerManager | null>(null);

    const menuItem = useSelectionStore((s) => s.selection.kind === 'placing' ? s.selection.menuItem : null)
    const cursorImage = menuItem?.cursor;

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

const getRenderResolution = (scale: number): number => {
  if (scale <= 0.8) return 0.75;

  if (scale <= 1.0) {
    // Smoothly interpolate from 0.75 to 0.85 between 0.8 and 1.0
    return 0.75 + ((scale - 0.8) / (1.0 - 0.8)) * (0.85 - 0.75);
  }

  if (scale <= 1.5) {
    // Interpolate from 0.85 to 2.0
    return 0.85 + ((scale - 1.0) / (1.5 - 1.0)) * (2.0 - 0.85);
  }

  return 2.0;
};
    const redraw = () => {
      const canvas = mainCanvasRef.current!;
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
      if (!mainCanvasRef.current) return;

      // Initialize Fabric only once
      fabricCanvasRef.current = new Canvas('fabric-overlay', {
        selection: true,
        preserveObjectStacking: true,
      });
      fabricCanvasRef.current.defaultCursor = `url(${cursorImage}) 16 16, auto`;

      return () => {
        fabricCanvasRef.current?.dispose();
      };
    }, []);

    useEffect(() => {
      if (!colorCanvasRef.current) return;
      colorCtxRef.current = colorCanvasRef.current.getContext('2d');
    }, []);


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
      const main = mainCanvasRef.current!;
      const ctx = main.getContext('2d')!;
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      lm.drawToMain(ctx, layers.map(l => l.name));

      // flatten all layer.deps into our effect's dependency array:
    }, [layers]);

    useEffect(() => {
      throttledRedraw();
    }, [layers]);

    useEffect(() => {
      const fabricCanvas = fabricCanvasRef.current;
      if (!fabricCanvas) return;

      if (cursorImage) {
        const img = new Image();
        img.src = cursorImage;

        img.onload = () => {
          const cursorUrl = `url(${cursorImage}) 16 16, auto`;
          document.body.style.cursor = cursorUrl;
          fabricCanvas.defaultCursor = cursorUrl;
        };

        img.onerror = () => {
          warn("Failed to load cursor image:", cursorImage);
          document.body.style.cursor = "crosshair";
          fabricCanvas.defaultCursor = "crosshair";
        };
      } else {
        document.body.style.cursor = "default";
        fabricCanvas.defaultCursor = "default";
      }
    }, [menuItem]);

    useEffect(() => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      canvas.clear(); // Clear previously added Fabric objects

      if (selectedElement) {
        log("selectedElement as seen in canvasGrid:", selectedElement)

        createFabricElement(selectedElement, true).then(fabricEl => {
          fabricObjectRef.current = fabricEl;
          canvas.add(fabricEl);
          canvas.setActiveObject(fabricEl);
          log(fabricEl)
          canvas.renderAll();
        });
      }
    }, [selectedElement]);


    // 5️⃣ Compute world‑coordinates on click & toggle the Set
    const handleMouseDown = (e: React.MouseEvent) => {
      const rect = containerRef.current!.getBoundingClientRect();
      const xCss = e.clientX - rect.left;
      const yCss = e.clientY - rect.top;

      const worldX = xCss / scaleRef.current + panRef.current.x;
      const worldY = yCss / scaleRef.current + panRef.current.y;

      log("1 - Mousedown triggered in CanvasGrid, passing worldX, worldY to GardenCanvas: ", worldX, worldY)
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
            next = Math.min(Math.max(next, 0.5), 2);

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
          setPan(panRef.current);
          // 👉 composite layers immediately:
          throttledRedraw()
        });
      };

      container.addEventListener('wheel', onWheel, { passive: false });
      return () => {
        cancelAnimationFrame(raf);
        container.removeEventListener('wheel', onWheel);
      };
    }, [layers]);  // only rebind if layer set changes


    return (
      <div ref={containerRef} style={{ width: WIDTH, height: HEIGHT, overflow: 'hidden', cursor: 'inherit' }}>
        <div
          ref={wrapperRef}
          onMouseDown={handleMouseDown}
          onMouseMove={onMouseMove}
          style={{ position: 'relative', width: WIDTH, height: HEIGHT, cursor: 'inherit' }}>
          <canvas
            ref={mainCanvasRef}
            style={{ position: 'absolute', top: 0, left: 0, cursor: 'inherit' }}
            width={WIDTH}
            height={HEIGHT} />
          <canvas
            ref={colorCanvasRef}
            style={{ position: 'absolute', top: 0, left: 0, cursor: 'inherit' }}
            width={WIDTH}
            height={HEIGHT} />
          <canvas
            id="fabric-overlay"
            style={{ position: 'absolute', top: 0, left: 0, cursor: 'inherit' }}
            width={WIDTH}
            height={HEIGHT} />

        </div>
      </div>
    );
  });

CanvasGrid.displayName = "CanvasGrid";

export default CanvasGrid;