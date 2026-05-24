import { currentProject, loadProject, isReadOnly, viewMode, createDefaultProject } from '$lib/stores/project';
import { get } from 'svelte/store';
import { goto } from '$app/navigation';

interface BridgeConfig {
  viewMode?: '2d' | '3d';
  readOnly?: boolean;
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
        const readOnly = config?.readOnly === true; // Strict check to avoid accidental locking
        const vMode = config?.viewMode ?? '2d';

        console.log('[KotlinBridge] Incoming load request:', { 
          hasJson: !!jsonString, 
          jsonLength: jsonString?.length ?? 0,
          readOnly, 
          vMode 
        });

        // Apply configuration
        isReadOnly.set(readOnly);
        viewMode.set(vMode);

        if (readOnly) {
          console.warn('[KotlinBridge] Editor is now in READ-ONLY mode. Placement disabled.');
        } else {
          console.log('[KotlinBridge] Editor is in EDIT mode. Placement enabled.');
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

        // Validate project structure: if it's empty or missing floors, use default
        if (!project || !project.floors || !Array.isArray(project.floors)) {
          console.log('[KotlinBridge] Data is empty or invalid structure. Creating new default project');
          loadProject(createDefaultProject());
        } else {
          console.log('[KotlinBridge] Loading provided project JSON:', project.name);
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
