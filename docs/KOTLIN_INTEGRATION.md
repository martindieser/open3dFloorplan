# Kotlin & WebView Integration Guide

This document defines the communication protocol and data schemas between the Kotlin native application and the Svelte-based floor plan editor.

## 1. Communication Architecture

The integration uses a **JavaScript Interface** injected into the WebView to allow bi-directional communication.

### Web to Native (Persistence)
The editor notifies Kotlin whenever the project state changes (autosave pattern).

- **Interface Name:** `AndroidInterface`
- **Method:** `saveProject(jsonString: string)`
- **Behavior:** Triggered on every change to the `currentProject` store.

**Kotlin Implementation Snippet:**
```kotlin
webView.addJavascriptInterface(object {
    @JavascriptInterface
    fun saveProject(json: String) {
        // Save this JSON to local storage (Room, SharedPreferences, or File)
    }
}, "AndroidInterface")
```

### Native to Web (Loading/Actions)
Kotlin calls global functions exposed by the editor.

- **Load Project:** `window.loadFromKotlin(jsonString: string, config?: BridgeConfig)`
  - Resets the editor state and history with the provided JSON.
  - **BridgeConfig Object:**
    - `viewMode`: `'2d' | '3d'` (Default: `'2d'`)
    - `readOnly`: `boolean` (Default: `false`) - Disables all editing tools and persistence updates.
    - `integrationMode`: `boolean` (Default: `true`) - Hides internal UI elements like the "Back to Projects" button.

- **Health Check:** `window.pingKotlinBridge()`
  - Returns `"pong"` if the bridge is initialized.

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

### UI Customization
By setting `integrationMode: true` (default when using the bridge):
- "Back to Projects" navigation link is hidden.
- Project name editor is disabled (static label only).

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

### Example Minimal Project JSON
```json
{
  "id": "p1",
  "name": "My New Home",
  "floors": [
    {
      "id": "f1",
      "name": "Ground Floor",
      "level": 0,
      "walls": [],
      "rooms": [],
      "doors": [],
      "windows": [],
      "furniture": [],
      "stairs": [],
      "columns": [],
      "guides": [],
      "measurements": [],
      "annotations": [],
      "textAnnotations": [],
      "groups": []
    }
  ],
  "activeFloorId": "f1"
}
```
