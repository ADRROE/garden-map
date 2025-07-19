import { useMemo, useRef } from "react";
import { useGardenStore } from "@/stores/useGardenStore";
import { GardenItem } from "@/types";

// Shallow equality check for GardenItems
function shallowEqualItem(a: GardenItem, b: GardenItem): boolean {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getTime = (val: any) => val ? new Date(val).getTime() : undefined;
  return (
    a.id === b.id &&
    a.displayName === b.displayName &&
    a.position === b.position &&
    a.location === b.location &&
    a.rotation === b.rotation &&
    a.width === b.width &&
    a.height === b.height &&
    a.coverage === b.coverage &&
    a.layer === b.layer &&
    a.species === b.species &&
    a.genus === b.genus &&
    a.wcvpId === b.wcvpId &&
    a.rhsId === b.rhsId &&
    a.circumference === b.circumference &&
    a.price === b.price &&
    getTime(a.tAmended) === getTime(b.tAmended) &&
    a.qAmended === b.qAmended &&
    getTime(a.tWatered) === getTime(b.tWatered) &&
    a.dtWatered === b.dtWatered &&
    a.qWatered === b.qWatered
  );
}

interface CachedItem {
  raw: GardenItem;
  enriched: GardenItem; // Could be enhanced with computed properties if needed
}

interface ImageCache {
  regular: Map<string, HTMLImageElement>; // For regular canvas rendering
  fabric: Map<string, HTMLImageElement>;  // For Fabric.js (if needed separately)
}

export function useGardenItems() {
  const items = useGardenStore(state => state.present.items);
  const itemCacheRef = useRef<Map<string, CachedItem>>(new Map());
  const imageCacheRef = useRef<ImageCache>({
    regular: new Map(),
    fabric: new Map()
  });

  const { enrichedItems, imageCache } = useMemo(() => {
    const newCache = new Map<string, CachedItem>();
    
    const result: GardenItem[] = items.map(item => {
      const cached = itemCacheRef.current.get(item.id);
      
      const shouldReuse = cached && shallowEqualItem(cached.raw, item);
      
      const enriched: GardenItem = shouldReuse
        ? cached.enriched
        : {
            ...item,
            // Add any computed properties here if needed
          };
      
      newCache.set(item.id, {
        raw: item,
        enriched,
      });
      
      return enriched;
    });

    // Preload images for both regular and fabric rendering
    const uniqueIcons = [...new Set(items.map(item => item.icon))];
    uniqueIcons.forEach(iconSrc => {
      // Regular canvas images
      if (!imageCacheRef.current.regular.has(iconSrc)) {
        const img = new Image();
        img.src = iconSrc;
        img.onload = () => {
          // Image loaded and cached
        };
        imageCacheRef.current.regular.set(iconSrc, img);
      }
      
      // Fabric images (if you need different handling)
      if (!imageCacheRef.current.fabric.has(iconSrc)) {
        const img = new Image();
        img.src = iconSrc;
        img.crossOrigin = 'anonymous'; // Important for Fabric.js
        imageCacheRef.current.fabric.set(iconSrc, img);
      }
    });

    itemCacheRef.current = newCache;
    return {
      enrichedItems: result,
      imageCache: imageCacheRef.current
    };
  }, [items]);

  return {
    items: enrichedItems,
    imageCache
  };
}