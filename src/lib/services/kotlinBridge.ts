import { currentProject, loadProject, isReadOnly, isIntegrationMode, viewMode, createDefaultProject } from '$lib/stores/project';
import { get } from 'svelte/store';
import { goto } from '$app/navigation';

interface BridgeConfig {
  viewMode?: '2d' | '3d';
  readOnly?: boolean;
  integrationMode?: boolean;
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
    console.log('[KotlinBridge] Received load request from Kotlin', { hasData: !!jsonString, config });

    // Apply configuration first
    isReadOnly.set(config?.readOnly ?? false);
    isIntegrationMode.set(config?.integrationMode ?? true);
    if (config?.viewMode) viewMode.set(config.viewMode);

    // Decide what to load
    if (!jsonString || jsonString.trim() === "" || jsonString === "null") {
      console.log('[KotlinBridge] Creating new default project');
      loadProject(createDefaultProject());
    } else {
      console.log('[KotlinBridge] Loading provided project JSON');
      const project = JSON.parse(jsonString);
      loadProject(project);
    }

    return { success: true };
  } catch (e) {
    console.error('[KotlinBridge] Error in loadFromKotlin', e);
    return { success: false, error: String(e) };
  }
};
    (window as any).pingKotlinBridge = () => {
      return "pong";
    };

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
