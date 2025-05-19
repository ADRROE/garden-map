import { CanvasLayer } from "../types";

export class LayerManager {
  private layers: Map<string, HTMLCanvasElement> = new Map();
  private width: number;
  private height: number;
  private renderScale: number;
  private visibleLayers: string[] = [];

  constructor(
    width: number,
    height: number,
    layerNames: string[],
    dpr = (typeof window !== "undefined" ? window.devicePixelRatio : 1),
    renderScale = 1
  ) {
    this.width = width;
    this.height = height;
    this.renderScale = renderScale;

    layerNames.forEach(name => {
      const canvas = document.createElement("canvas");
      const scaledWidth = width * dpr * renderScale;
      const scaledHeight = height * dpr * renderScale;
      canvas.width = scaledWidth;
      canvas.height = scaledHeight;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext("2d")!;
      ctx.scale(dpr * renderScale, dpr * renderScale);
      ctx.imageSmoothingEnabled = false;

      this.layers.set(name, canvas);
    });
  }

  getContext(name: string): CanvasRenderingContext2D | undefined {
    return this.layers.get(name)?.getContext('2d') ?? undefined;
  }

  setVisibleLayers(layers: string[]) {
    this.visibleLayers = layers;
  }

  getCanvasLayers(): CanvasLayer[] {
    return this.visibleLayers.map((layerName) => ({
      name: layerName,
      draw: (ctx: CanvasRenderingContext2D) => {
        const layerCanvas = this.layers.get(layerName);
        if (layerCanvas) {
          ctx.drawImage(layerCanvas, 0, 0, this.width, this.height);
        }
      },
      deps: [], // You can handle dependencies if needed
    }));
  }

  clearLayer(name: string) {
    const ctx = this.getContext(name);
    if (ctx) {
      ctx.clearRect(0, 0, this.width, this.height);
    }
  }

  // 3️⃣ Q: Why `mainCtx` as the parameter?  
  // A: It's a naming convention.  
  // `mainCtx` is the **2D drawing context** of the *visible* canvas on screen — the one React renders.  
  // We're copying (drawing) the off-screen layers onto it.
  drawToMain(mainCtx: CanvasRenderingContext2D, visibleLayers: string[]) {
    // 4️⃣ Q: Why `for...of` and not `for...in`?  
    // A: `for...of` iterates over array **values** (in this case: layer names like "zones", "background")  
    //     `for...in` would iterate over **indexes or object keys**, which is not what we want here
    for (const name of visibleLayers) {
      const layer = this.layers.get(name);
      if (layer) {
        mainCtx.drawImage(layer, 0, 0, this.width, this.height);
      }
    }
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    for (const canvas of this.layers.values()) {
      canvas.width = width * this.renderScale;
      canvas.height = height * this.renderScale;
    }
  }
}