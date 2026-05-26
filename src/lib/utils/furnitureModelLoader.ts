/**
 * Furniture Model Loader
 * Loads GLB models via external URLs provided in FurnitureDef.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createFurnitureModel } from './furnitureModels3d';
import type { FurnitureDef } from './furnitureCatalog';

const loader = new GLTFLoader();
const modelCache = new Map<string, THREE.Group>();
const loadingPromises = new Map<string, Promise<THREE.Group | null>>();

/**
 * Load a GLB model for the given definition.
 * Returns a clone from cache if available, or loads async via modelUrl.
 */
function loadGLBModel(def: FurnitureDef): Promise<THREE.Group | null> {
  const url = def.modelUrl;
  if (!url) return Promise.resolve(null);

  // Return cached clone
  if (modelCache.has(url)) {
    return Promise.resolve(modelCache.get(url)!.clone());
  }

  // Return existing loading promise
  if (loadingPromises.has(url)) {
    return loadingPromises.get(url)!.then(() => modelCache.has(url) ? modelCache.get(url)!.clone() : null);
  }

  const promise = new Promise<THREE.Group | null>((resolve) => {
    loader.load(
      url,
      (gltf) => {
        const group = new THREE.Group();
        gltf.scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        group.add(gltf.scene);
        modelCache.set(url, group);
        loadingPromises.delete(url);
        resolve(group.clone());
      },
      undefined,
      (err) => {
        console.error(`[FurnitureLoader] Failed to load GLB from ${url}`, err);
        loadingPromises.delete(url);
        resolve(null);
      }
    );
  });

  loadingPromises.set(url, promise);
  return promise;
}

/**
 * Scale a GLB model to match our catalog dimensions (cm).
 */
function scaleToFit(model: THREE.Group, def: FurnitureDef): void {
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  box.getSize(size);

  const EPSILON = 0.001;
  if (size.x < EPSILON || size.y < EPSILON || size.z < EPSILON) return;

  // Detect Z-up orientation and correct to Y-up
  if (size.y < 0.01 && size.z > size.y * 10) {
    model.rotation.x = -Math.PI / 2;
    model.updateMatrixWorld(true);
    box.setFromObject(model);
    box.getSize(size);
  }

  const scaleX = def.width / size.x;
  const scaleY = def.height / size.y;
  const scaleZ = def.depth / size.z;

  model.scale.set(scaleX, scaleY, scaleZ);

  // Re-center and ground
  const scaledBox = new THREE.Box3().setFromObject(model);
  const center = new THREE.Vector3();
  scaledBox.getCenter(center);
  model.position.sub(center);
  model.position.y -= scaledBox.min.y;

  const finalBox = new THREE.Box3().setFromObject(model);
  model.position.y -= finalBox.min.y;
}

/**
 * Create a furniture model — tries GLB via modelUrl, falls back to procedural.
 */
export function createFurnitureModelWithGLB(
  catalogId: string,
  def: FurnitureDef,
  onLoaded?: (model: THREE.Group) => void
): THREE.Group {
  const container = new THREE.Group();
  container.name = `furniture_${catalogId}`;

  // Start with procedural fallback
  const procedural = createFurnitureModel(catalogId, def);
  container.add(procedural);

  // Try to load GLB via URL
  if (def.modelUrl) {
    loadGLBModel(def).then((glbModel) => {
      if (glbModel) {
        try {
          container.remove(procedural);
          procedural.traverse((obj: any) => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
              if (Array.isArray(obj.material)) obj.material.forEach((m: any) => m.dispose());
              else obj.material.dispose();
            }
          });
          scaleToFit(glbModel, def);
          container.add(glbModel);
          onLoaded?.(container);
        } catch (err) {
          console.warn(`[FurnitureLoader] Render error for ${catalogId}:`, err);
        }
      }
    });
  }

  return container;
}

/** Check if a catalog item has a GLB model URL */
export function hasGLBModel(catalogId: string, def?: FurnitureDef): boolean {
  return !!def?.modelUrl;
}
