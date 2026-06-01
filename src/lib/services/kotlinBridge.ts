import { currentProject, loadProject, isReadOnly, viewMode, createDefaultProject, selectedTool, undo, redo, triggerZoomToFit, selectedElementId, removeElement, placingFurnitureId, placingStair, placingColumn, panMode, placingDoorType, placingWindowType, placingColumnShape, activeFloor, updateWall, updateDoor, updateWindow, updateFurniture, updateRoom, updateStair, updateColumn, updateTextAnnotation } from '$lib/stores/project';
import { draggingFromLibrary } from '$lib/stores/ui';
import { get } from 'svelte/store';
import { activeCatalog, getCatalogItem } from '$lib/utils/furnitureCatalog';
import type { FurnitureDef } from '$lib/utils/furnitureCatalog';

interface BridgeConfig {
  viewMode?: '2d' | '3d';
  readOnly?: boolean;
  catalog?: FurnitureDef[]; // renamed for clarity: this is THE catalog for the session
}

/**
 * KotlinBridgeService handles communication between the Svelte web editor 
 * and the native Kotlin (Android) wrapper via WebView.
 */
export class KotlinBridgeService {
  private static instance: KotlinBridgeService;
  private isInitialized = false;
  private editorLoaded = false;

  private constructor() {}

  public static getInstance(): KotlinBridgeService {
    if (!KotlinBridgeService.instance) {
      KotlinBridgeService.instance = new KotlinBridgeService();
    }
    return KotlinBridgeService.instance;
  }

  /**
   * Initializes the bridge. Exposes global functions for Kotlin to call
   * and subscribes to project changes to notify Kotlin.
   */
  public init() {
    if (this.isInitialized) return;

    console.log('[KotlinBridge] Initializing bridge...');
    // 1. Expose function for Kotlin to inject data
    (window as any).loadFromKotlin = (jsonString: string | null, config?: BridgeConfig) => {
      try {
        const readOnly = config?.readOnly === true;
        const vMode = config?.viewMode ?? '2d';

        console.log('[KotlinBridge] Incoming load request:', { 
          hasJson: !!jsonString, 
          readOnly, 
          vMode,
          catalogCount: config?.catalog?.length ?? 0
        });

        // Apply configuration
        isReadOnly.set(readOnly);
        viewMode.set(vMode);
        
        // Populate the catalog (Blank slate unless Kotlin provides one)
        if (config?.catalog) {
          console.log(`[KotlinBridge] Setting session catalog with ${config.catalog.length} items`);
          activeCatalog.set(config.catalog);
        } else {
          activeCatalog.set([]); 
        }

        if (readOnly) {
          console.warn('[KotlinBridge] Editor is now in READ-ONLY mode.');
        }

        // Decide what to load
        let project: any = null;
        if (jsonString && jsonString.trim() !== "" && jsonString !== "null") {
          try {
            project = JSON.parse(jsonString);
          } catch (e) {
            console.error('[KotlinBridge] Failed to parse project JSON', e);
          }
        }

        // Validate project structure: if it's empty or invalid structure, use default
        if (!project || !project.floors || !Array.isArray(project.floors)) {
          loadProject(createDefaultProject());
        } else {
          loadProject(project);
        }
        
        return { success: true, settings: { readOnly, vMode } };
      } catch (e) {
        console.error('[KotlinBridge] Error in loadFromKotlin', e);
        return { success: false, error: String(e) };
      }
    };

    (window as any).pingKotlinBridge = () => {
      return "pong";
    };

    (window as any).isEditorLoaded = () => {
      return this.editorLoaded;
    };

    // 2. Expose Editor Actions to Kotlin
    (window as any).editorActions = {
      addWall: () => {
        selectedTool.set('wall');
        placingFurnitureId.set(null);
        placingStair.set(false);
        placingColumn.set(false);
        draggingFromLibrary.set(null);
        panMode.set(false);
        return { success: true };
      },
      addDoor: (type: 'single' | 'double' | 'sliding' | 'french' | 'pocket' | 'bifold') => {
        selectedTool.set('door');
        placingDoorType.set(type);
        placingFurnitureId.set(null);
        placingStair.set(false);
        placingColumn.set(false);
        draggingFromLibrary.set(null);
        panMode.set(false);
        return { success: true };
      },
      addWindow: (type: 'standard' | 'fixed' | 'casement' | 'sliding' | 'bay') => {
        selectedTool.set('window');
        placingWindowType.set(type);
        placingFurnitureId.set(null);
        placingStair.set(false);
        placingColumn.set(false);
        draggingFromLibrary.set(null);
        panMode.set(false);
        return { success: true };
      },
      addFurniture: (catalogId: string) => {
        const catalog = get(activeCatalog);
        if (!catalog.some(f => f.id === catalogId)) {
          return { success: false, error: `ID "${catalogId}" not found in catalog.` };
        }

        // Use 'select' tool to avoid onMouseDown placement during drag
        selectedTool.set('select');
        draggingFromLibrary.set({ type: 'furniture', id: catalogId });
        placingFurnitureId.set(catalogId);

        placingStair.set(false);
        placingColumn.set(false);
        panMode.set(false);
        return { success: true };
      },
      addStair: () => {
        // Use 'select' tool and disable immediate placement flag
        selectedTool.set('select');
        draggingFromLibrary.set({ type: 'stair', id: 'stair' });
        placingStair.set(false);

        placingFurnitureId.set(null);
        placingColumn.set(false);
        panMode.set(false);
        return { success: true };
      },
      addColumn: (shape: 'round' | 'square') => {
        // Use 'select' tool and disable immediate placement flag
        selectedTool.set('select');
        draggingFromLibrary.set({ type: 'column', id: shape });
        placingColumn.set(false);
        placingColumnShape.set(shape);

        placingFurnitureId.set(null);
        placingStair.set(false);
        panMode.set(false);
        return { success: true };
      },

      cancelAction: () => {
        placingFurnitureId.set(null);
        placingStair.set(false);
        placingColumn.set(false);
        draggingFromLibrary.set(null);
        selectedTool.set('select');
        panMode.set(true);
        selectedElementId.set(null);
        return { success: true };
      },
      setMode: (mode: '2d' | '3d') => {
        viewMode.set(mode);
        return { success: true };
      },
      undo: () => {
        undo();
        return { success: true };
      },
      redo: () => {
        redo();
        return { success: true };
      },
      zoomToFit: () => {
        triggerZoomToFit.update(n => n + 1);
        return { success: true };
      },
      deleteSelected: () => {
        const id = get(selectedElementId);
        if (id) {
          removeElement(id);
          selectedElementId.set(null);
          return { success: true };
        }
        return { success: false, error: "No element selected" };
      },
      updateElement: (id: string, props: any) => {
        const floor = get(activeFloor);
        if (!floor) return { success: false, error: "No active floor" };

        if (floor.furniture.some(f => f.id === id)) {
          updateFurniture(id, props);
        } else if (floor.walls.some(w => w.id === id)) {
          updateWall(id, props);
        } else if (floor.doors.some(d => d.id === id)) {
          updateDoor(id, props);
        } else if (floor.windows.some(w => w.id === id)) {
          updateWindow(id, props);
        } else if (floor.stairs?.some(s => s.id === id)) {
          updateStair(id, props);
        } else if (floor.columns?.some(c => c.id === id)) {
          updateColumn(id, props);
        } else if (floor.textAnnotations?.some(t => t.id === id)) {
          updateTextAnnotation(id, props);
        } else {
          return { success: false, error: "Element not found" };
        }
        return { success: true };
      },
      clearProject: () => {
        loadProject(createDefaultProject());
        return { success: true };
      }
    };

    // Notify Kotlin that the bridge is initialized and ready to receive data
    const android = (window as any).AndroidInterface;
    if (android && android.onEditorReady) {
      console.log('[KotlinBridge] Notifying Kotlin that bridge is ready');
      try {
        android.onEditorReady();
      } catch (e) {
        console.error('[KotlinBridge] Failed to call AndroidInterface.onEditorReady', e);
      }
    }

    // 3. Subscribe to currentProject changes to notify Kotlin (Persistence)
    currentProject.subscribe((project) => {
      // Never send updates back if we are in Read-Only mode
      if (!project || get(isReadOnly)) return;

      const android = (window as any).AndroidInterface;
      if (android && android.saveProject) {
        try {
          android.saveProject(JSON.stringify(project));
        } catch (e) {
          console.error('[KotlinBridge] Failed to call AndroidInterface.saveProject', e);
        }
      }
    });

    this.isInitialized = true;
  }

  /**
   * Notifies Kotlin that the editor (the UI) has finished loading.
   */
  public notifyEditorLoaded() {
    if (this.editorLoaded) return;
    
    this.editorLoaded = true;
    const android = (window as any).AndroidInterface;
    if (android && android.onEditorLoaded) {
      console.log('[KotlinBridge] Notifying Kotlin that editor is loaded (first time)');
      try {
        android.onEditorLoaded();
      } catch (e) {
        console.error('[KotlinBridge] Failed to call AndroidInterface.onEditorLoaded', e);
      }
    } else {
      console.log('[KotlinBridge] Editor loaded signal processed');
    }
  }

  /**
   * Notifies Kotlin that an object (furniture/wall) has been selected in 3D.
   */
  public notifyObjectSelected(objectId: string, data: any = {}) {
    const android = (window as any).AndroidInterface;
    if (android && android.onObjectSelected) {
      console.log(`[KotlinBridge] Notifying object selection: ${objectId}`);
      try {
        android.onObjectSelected(JSON.stringify({ id: objectId, ...data }));
      } catch (e) {
        console.error('[KotlinBridge] Failed to call AndroidInterface.onObjectSelected', e);
      }
    } else {
      console.warn('[KotlinBridge] AndroidInterface.onObjectSelected not found');
    }
  }

  /**
   * Notifies Kotlin that the user wants to proceed to the next step.
   */
  public notifyNextStep() {
    const android = (window as any).AndroidInterface;
    if (android && android.onNextStep) {
      console.log('[KotlinBridge] Notifying Kotlin of next step');
      try {
        android.onNextStep();
      } catch (e) {
        console.error('[KotlinBridge] Failed to call AndroidInterface.onNextStep', e);
      }
    } else {
      console.warn('[KotlinBridge] Cannot notify next step: AndroidInterface.onNextStep not found');
    }
  }

  /**
   * Manually trigger a save to Kotlin.
   */
  public saveToNative() {
    if (get(isReadOnly)) return;
    const project = get(currentProject);
    if (project && (window as any).AndroidInterface) {
      (window as any).AndroidInterface.saveProject(JSON.stringify(project));
    }
  }
}

export const kotlinBridge = KotlinBridgeService.getInstance();
