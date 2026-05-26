# Kotlin & WebView Integration Guide

This document defines the communication protocol and data schemas between the Kotlin native application and the Svelte-based floor plan editor.

## 1. Communication Architecture

The integration uses a **JavaScript Interface** injected into the WebView to allow bi-directional communication.

### Web to Native (Persistence & Lifecycle)
The editor notifies Kotlin whenever the project state changes or when the bridge is ready.

- **Interface Name:** `AndroidInterface`
- **Method:** `saveProject(jsonString: string)`
  - **Behavior:** Triggered on every change to the `currentProject` store (autosave).
- **Method:** `onEditorReady()`
  - **Behavior:** Triggered once when the Svelte editor and bridge functions are fully initialized. **This is the signal to call `loadFromKotlin` from the native side.**
- **Method:** `onNextStep()`
  - **Behavior:** Triggered when the user clicks the "Siguiente" button. Use this to advance the application flow (e.g., closing the WebView).

**Kotlin Implementation Snippet:**
```kotlin
webView.addJavascriptInterface(object {
    @JavascriptInterface
    fun saveProject(json: String) {
        // Save this JSON to local storage
    }

    @JavascriptInterface
    fun onEditorReady() {
        // Safe to call window.loadFromKotlin now
        webView.post {
            webView.evaluateJavascript("window.loadFromKotlin(json, config)", null)
        }
    }

    @JavascriptInterface
    fun onNextStep() {
        // User clicked "Next", handle navigation/closure
    }
}, "AndroidInterface")
```

### Native to Web (Actions)
Kotlin calls global functions exposed by the editor.

- **Load Project:** `window.loadFromKotlin(jsonString: string | null, config: BridgeConfig)`
  - Initializes the editor with a project and its object library.
  - **BridgeConfig Object:**
    - `viewMode`: `'2d' | '3d'` (Default: `'2d'`)
    - `readOnly`: `boolean` (Default: `false`)
    - `catalog`: `FurnitureDef[]` — **Mandatory.** Since the editor has no internal library, this provides the tools available in the sidebar and 3D view.

- **Health Check:** `window.pingKotlinBridge()` -> `"pong"`

---

## 2. Asset Management & External Models

The editor is a **generic shell**. It contains no hardcoded 3D models.

### Local & Remote GLB Loading
Every item in the `catalog` that isn't a 2D symbol should provide a `modelUrl`.
- **Remote:** `https://your-server.com/models/chair.glb`
- **Local:** `file:///android_asset/models/table.glb` (or internal storage paths).

**Critical Android Configuration:**
To support `file://` assets from internal storage or assets folder, the WebView must be configured as follows:
```kotlin
webView.settings.apply {
    allowFileAccess = true
    allowContentAccess = true
    allowFileAccessFromFileURLs = true
    allowUniversalAccessFromFileURLs = true
}
```

---

## 2. Implementation Workflow

### Recommended Setup
To achieve a flicker-free integration, load the editor directly into your WebView.

1. **Load URL:** `http://<your-server-address>/editor`
2. **Passive State:** The editor will load in a "waiting" state (empty canvas). It will NOT create a default project or attempt to load from local storage unless an `?id=` parameter is present.
3. **Inject Data:** In your `WebViewClient.onPageFinished` event, call the injection function:
   ```kotlin
   webView.evaluateJavascript("window.loadFromKotlin(jsonString, config)", null)
   ```

### Mode Behavior
By setting `readOnly: true`:
- All editing sidebars and toolbars are hidden.
- Undo/Redo and Settings buttons are removed.
- **Interaction Blocking:** The 2D canvas ignores all drag and modification attempts, allowing only pan and zoom.
- **Persistence Disabled:** No calls to `AndroidInterface.saveProject` will be made.

---

## 3. Data Schemas (JSON)

The editor operates on a `Project` object.

### Project Object
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier. |
| `name` | `string` | Display name. |
| `floors` | `Floor[]` | Array of floor objects. |
| `activeFloorId` | `string` | ID of the current floor. |
