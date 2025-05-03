// This class manages multiple off-screen canvases and allows layered drawing to a main canvas.
export class LayerManager {
  private layers: Map<string, HTMLCanvasElement> = new Map();
  private width:  number;
  private height: number;

  /**
   * @param width  logical width in CSS px
   * @param height logical height in CSS px
   * @param layerNames names of your layers
   * @param dpr devicePixelRatio (defaults to window.devicePixelRatio)
   */
  constructor(
    width: number,
    height: number,
    layerNames: string[],
    dpr = (typeof window !== "undefined" ? window.devicePixelRatio : 1)
  ) {
    this.width  = width;
    this.height = height;

    // Create one off-screen canvas per layer and store it by name
    layerNames.forEach(name => {
      const canvas = document.createElement("canvas");
      // give it a high‑DPI backing store
      canvas.width  = width  * dpr;
      canvas.height = height * dpr;
      // but keep its CSS size at the logical dimensions
      canvas.style.width  = `${width}px`;
      canvas.style.height = `${height}px`;
      // turn off smoothing and scale its drawing context
      const ctx = canvas.getContext("2d")!;
      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = false;

      this.layers.set(name, canvas);
    });
  }

  // 1️⃣ Q: How can we call getContext inside getContext?  
  // A: This is NOT a recursive call!  
  // `canvas.getContext('2d')` is a built-in browser method on <canvas> elements.  
  // It has nothing to do with our class method of the same name. Totally different scopes.
  getContext(name: string): CanvasRenderingContext2D | undefined {
    // Get the off-screen canvas by name and call the built-in canvas.getContext('2d') on it
    return this.layers.get(name)?.getContext('2d') ?? undefined;
    //         ^ Optional chaining: only calls getContext if canvas exists
    //                              ^ Nullish coalescing: fallback to undefined if result is null
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
    this.width  = width;
    this.height = height;
    for (const canvas of this.layers.values()) {
      canvas.width  = width;
      canvas.height = height;
    }
  }
}
