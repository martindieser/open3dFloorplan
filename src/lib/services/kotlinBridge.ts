import { currentProject, loadProject, isReadOnly, viewMode, createDefaultProject } from '$lib/stores/project';
import { get } from 'svelte/store';
import { goto } from '$app/navigation';
import { activeCatalog } from '$lib/utils/furnitureCatalog';
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
