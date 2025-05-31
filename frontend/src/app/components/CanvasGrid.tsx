import React, { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { LayerManager } from '../utils/LayerManager';
import { CanvasLayer, ColoredCell, GardenElement } from '../types';
import { Canvas, FabricObject } from 'fabric';
import { useSelectionStore } from '../stores/useSelectionStore';
import { createFabricElement } from '../utils/FabricHelpers';
import { constrainMatrix, log, warn } from "@/utils/utils";
import { useViewportStore } from "@/stores/useViewportStore";
import { useUIStore } from '@/stores/useUIStore';


const NUM_ROWS = 270;
const NUM_COLS = 270;
const CELL_SIZE = 20;
const WIDTH = NUM_COLS * CELL_SIZE;
const HEIGHT = NUM_ROWS * CELL_SIZE;


export interface CanvasGridHandle {
  getTransformedElement: () => GardenElement | null;
  colorCell: (cell: Partial<ColoredCell>) => void;
  uncolorCell: (col: number, row: number) => void;
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
  onWorldMove: (row: number, col: number) => void;
}


const CanvasGrid = forwardRef<CanvasGridHandle, CanvasGridProps>(
  ({ layers, selectedElement, onWorldClick, onWorldMove }, ref) => {
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
      colorCell: (cell: Partial<ColoredCell>) => {
        const ctx = colorCtxRef.current;
        if (!ctx) return;
        if (cell.color && cell.col && cell.row) {
          log(`8 - Now coloring cell from within CanvasGrid: Cell col: ${cell.col}, Cell row: ${cell.row}, Color: ${cell.color}`);
          ctx.fillStyle = cell.color;
          ctx.fillRect(cell.col * CELL_SIZE, cell.row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      },
      uncolorCell: (col: number, row: number) => {
        const ctx = colorCtxRef.current;
        if (!ctx) return;
        ctx.clearRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
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

    // 1. Replace legacy transform tracking with the viewportStore state
    const { matrix: transformMatrix } = useViewportStore();


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
      if (!canvas) return;

      const ctx = canvas.getContext('2d')!;
      const matrix = useViewportStore.getState().matrix;

      if (!matrix) return;

      const scale = matrix.a; // Assuming uniform scale
      const renderFactor = getRenderResolution(scale);

      const renderWidth = WIDTH * renderFactor;
      const renderHeight = HEIGHT * renderFactor;

      // Resize canvas resolution
      canvas.width = renderWidth;
      canvas.height = renderHeight;

      // CSS size stays the same
      canvas.style.width = `${WIDTH}px`;
      canvas.style.height = `${HEIGHT}px`;

      // 🔥 Clear the full canvas in raw pixel space
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, renderWidth, renderHeight);

      // 🔁 Now apply scaled transform
      const scaledMatrix = new DOMMatrix([
        matrix.a * renderFactor, matrix.b,
        matrix.c, matrix.d * renderFactor,
        matrix.e * renderFactor, matrix.f * renderFactor,
      ]);
      ctx.setTransform(scaledMatrix);

      lmRef.current!.drawToMain(ctx, layers.map(l => l.name));
    };

    useEffect(() => {
      if (!mainCanvasRef.current) return;

      // Initialize Fabric only once
      fabricCanvasRef.current = new Canvas('fabric-overlay', {
        selection: false,
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
      const scale = useViewportStore.getState().getScale()
      const bgCtx = lmRef.current.getContext('background')!;
      const renderFactor = scale ? getRenderResolution(scale) : 1;
      const img = new Image();
      img.src = '/grid.png';

      useUIStore.getState().setIsLoading(true);

      img.onload = () => {
        // draw static grid
        bgCtx.drawImage(img, 0, 0, WIDTH * renderFactor, HEIGHT * renderFactor);
        bgCtx.strokeStyle = '#CCC';

        // Line width shrinks when zooming out, so use 1/scale to maintain visibility
        if (scale) bgCtx.lineWidth = 0.25 / scale;

        for (let x = 0; x <= WIDTH; x += CELL_SIZE) {
          bgCtx.beginPath();
          bgCtx.moveTo(x, 0);
          bgCtx.lineTo(x, HEIGHT);
          bgCtx.stroke();
        }

        for (let y = 0; y <= HEIGHT; y += CELL_SIZE) {
          bgCtx.beginPath();
          bgCtx.moveTo(0, y);
          bgCtx.lineTo(WIDTH, y);
          bgCtx.stroke();
        }

        throttledRedraw();
        useUIStore.getState().setIsLoading(false);

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
    }, [layers, transformMatrix]);

    useEffect(() => {
      const fabricCanvas = fabricCanvasRef.current;
      if (!fabricCanvas) return;

      if (cursorImage) {
        const img = new Image();
        img.src = cursorImage;

        img.onload = () => {
          const cursorUrl = `url(${cursorImage}) 16 16, auto`;
          useUIStore.getState().dispatch({ type: 'SET_CURSOR', cursor: cursorUrl })
        };

        img.onerror = () => {
          warn("Failed to load cursor image:", cursorImage);
          useUIStore.getState().dispatch({ type: 'SET_CURSOR', cursor: "crosshair" })

        };

      } else {
        useUIStore.getState().dispatch({ type: 'SET_CURSOR', cursor: "default" })
      }
    }, [menuItem]);

    useEffect(() => {
      const unsubscribe = useUIStore.subscribe((state) => {
        const cursor = state.cursor
        // 1. Apply to body
        document.body.style.cursor = cursor;

        // 2. Apply to fabric canvas if initialized
        const fabricCanvas = fabricCanvasRef.current;
        if (fabricCanvas) {
          fabricCanvas.defaultCursor = cursor;

          // Also apply to the DOM element if needed
          const el = fabricCanvas.getElement?.();
          if (el) el.style.cursor = cursor;
        }
      });

      return () => {
        unsubscribe();
      };
    }, []);

    useEffect(() => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      canvas.clear();

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

    useEffect(() => {
      const wrapper = wrapperRef.current;
      const canvas = document.getElementById("fabric-overlay");

      if (!canvas || !wrapper) return;

      const matrix = useViewportStore.getState().matrix;
      if (!matrix) return;

      // CSS-compatible 2D matrix: matrix(a, b, c, d, e, f)
      const cssMatrix = `matrix(${matrix.a}, ${matrix.b}, ${matrix.c}, ${matrix.d}, ${matrix.e}, ${matrix.f})`;
      canvas.style.transform = cssMatrix;
      canvas.style.transformOrigin = '0 0';
    }, [transformMatrix]);

    const handleMouseDown = (e: React.MouseEvent) => {
      const rect = containerRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const matrix = useViewportStore.getState().matrix;
      if (matrix) {
        const transform = new DOMMatrix([
          matrix.a,
          matrix.b,
          matrix.c,
          matrix.d,
          matrix.e,
          matrix.f,
        ]);
        const pt = new DOMPoint(x, y).matrixTransform(transform.inverse());
        onWorldClick?.(pt.x, pt.y);
      }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      const rect = containerRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const matrix = useViewportStore.getState().matrix;
      if (matrix) {
        const transform = new DOMMatrix([
          matrix.a,
          matrix.b,
          matrix.c,
          matrix.d,
          matrix.e,
          matrix.f,
        ]);
        const pt = new DOMPoint(x, y).matrixTransform(transform.inverse());
        onWorldMove?.(pt.x, pt.y);
      }
    };

    // 6️⃣  Wheel → update pan/scale state only
    // 3. Update wheel zoom logic to use viewport store directly
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
          const { matrix: transformMatrix, setMatrix } = useViewportStore.getState(); // ✅ from store
          if (!transformMatrix) return;

          let newMatrix = new DOMMatrix([
            transformMatrix.a,
            transformMatrix.b,
            transformMatrix.c,
            transformMatrix.d,
            transformMatrix.e,
            transformMatrix.f,
          ]);

          if (e.ctrlKey || e.metaKey) {
            // Pan
            newMatrix = newMatrix.translate(-e.deltaX, -e.deltaY);
          } else {
            // Zoom
            const FACTOR = 1.05;
            const rawScale = e.deltaY > 0 ? 1 / FACTOR : FACTOR;
            const currentScale = transformMatrix.a;
            const newScale = currentScale * rawScale;
            const clampedScale = Math.max(0.5, Math.min(newScale, 2.0));

            const scaleFactor = clampedScale / currentScale;
            // Convert screen-space mouse position (px, py) to world space
            const inverseMatrix = transformMatrix.inverse();
            const pt = new DOMPoint(px, py).matrixTransform(inverseMatrix);
            const wx = pt.x;
            const wy = pt.y;

            // Now apply the scale around the world point (wx, wy)
            newMatrix = newMatrix
              .translate(wx, wy)
              .scale(scaleFactor)
              .translate(-wx, -wy);
          }

          // ✅ Constrain the result
          const bounds = { width: 4700, height: 4700 };
          const viewport = { width: window.innerWidth, height: window.innerHeight };
          const constrained = constrainMatrix(newMatrix, bounds, viewport);

          // ✅ Store + visual transform
          setMatrix(constrained);
          wrapperRef.current!.style.transformOrigin = '0 0';

          throttledRedraw();
        });
      };

      container.addEventListener("wheel", onWheel, { passive: false });
      return () => {
        cancelAnimationFrame(raf);
        container.removeEventListener("wheel", onWheel);
      };
    }, [transformMatrix]);


    return (
      <div ref={containerRef} style={{ width: WIDTH, height: HEIGHT, overflow: 'hidden', cursor: 'inherit' }}>
        <div
          ref={wrapperRef}
          onMouseDown={(e) => handleMouseDown(e)}
          onMouseMove={handleMouseMove}
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