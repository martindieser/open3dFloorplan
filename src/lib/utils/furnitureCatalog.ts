import { writable, derived } from 'svelte/store';

export interface FurnitureDef {
  id: string;
  name: string;
  category: string;
  icon: string;
  color: string;
  /** width x depth x height in cm */
  width: number;
  depth: number;
  height: number;
  /** If set, this is a 2D-only architectural symbol (not rendered in 3D) */
  symbol?: boolean;
  /** Optional URL to a custom GLB model (injected from Kotlin/Native) */
  modelUrl?: string;
}

/**
 * Single source of truth for the object catalog.
 * Starts empty and MUST be populated by the host (Kotlin) via the bridge.
 */
export const activeCatalog = writable<FurnitureDef[]>([]);

export function getCatalogItem(id: string): FurnitureDef | undefined {
  let item: FurnitureDef | undefined;
  activeCatalog.subscribe(c => {
    item = c.find(f => f.id === id);
  })();
  return item;
}

export const activeFurnitureCategories = derived(activeCatalog, ($catalog) => {
  return [...new Set($catalog.map(f => f.category))];
});
