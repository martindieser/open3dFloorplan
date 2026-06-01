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
- **Method:** `onEditorLoaded()`
  - **Behavior:** Triggered when the UI (the editor page) has finished loading its initial state and is ready for interaction.
- **Method:** `onNextStep()`
  - **Behavior:** Triggered when the user clicks the "Siguiente" button. Use this to advance the application flow (e.g., closing the WebView).
- **Method:** `onObjectSelected(jsonString: string)`
  - **Behavior:** Triggered when a user selects an element (furniture, wall, door, etc.) in **2D Editor** or **3D Preview**.
  - **Payload:** A JSON string containing the object's `id`, `type`, `properties`, and `metadata`.
  - **Note:** This allows Kotlin to show a native "Properties" panel (BottomSheet).

**Kotlin Implementation Snippet:**
```kotlin
webView.addJavascriptInterface(object {
    // ... previous methods ...

    @JavascriptInterface
    fun onObjectSelected(json: String) {
        val data = JSONObject(json)
        val type = data.getString("type") // 'furniture', 'wall', 'door', etc.
        val properties = data.getJSONObject("properties")
        // Show native UI BottomSheet based on properties...
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

- **Highlight Object:** `window.highlightObject(id: string, color: string, durationMs: number)`
  - Highlights an object in the 3D scene by changing its emissive color.        
  - `color`: Hex color string (e.g., `"#FF0000"`).
  - `durationMs`: How long to keep the highlight before reverting. Set to `0` for permanent.

- **Health Check:** `window.pingKotlinBridge()` -> `"pong"`

- **Status Check:** `window.isEditorLoaded()` -> `boolean`
  - Returns `true` if the editor UI has finished mounting.

### Editor Actions API (`window.editorActions`)
To achieve visual consistency with the native Android application, you can control the editor's functionality directly, allowing you to hide the default Svelte UI and replace it with native Kotlin components.

| Method | Description | Example (JS) |
| :--- | :--- | :--- |
| `addWall()` | Starts drawing a new wall. | `editorActions.addWall()` |        
| `addDoor(type)` | Starts placing a door. | `editorActions.addDoor('single')` |
| `addWindow(type)` | Starts placing a window. | `editorActions.addWindow('standard')` |
| `addFurniture(id)`| Starts placing a furniture item. | `editorActions.addFurniture('chair_01')` |
| `addStair()` | Starts placing a staircase. | `editorActions.addStair()` |     
| `addColumn(shape)` | Starts placing a column. | `editorActions.addColumn('round')` |
| `updateElement(id, props)` | Updates properties of an element. | `editorActions.updateElement('id123', { width: 100 })` |
| `cancelAction()` | Cancels current tool and resets state. | `editorActions.cancelAction()` |
| `setMode(mode)` | Toggles between `'2d'` and `'3d'`. | `editorActions.setMode('3d')` |
| `undo()` | Performs an undo action. | `editorActions.undo()` |
| `redo()` | Performs a redo action. | `editorActions.redo()` |
| `zoomToFit()` | Adjusts camera to show whole plan. | `editorActions.zoomToFit()` |
| `deleteSelected()` | Deletes the selected element. | `editorActions.deleteSelected()` |
| `clearProject()` | Resets the project. | `editorActions.clearProject()` |     

**Door Types:** `'single'`, `'double'`, `'sliding'`, `'french'`, `'pocket'`, `'bifold'`.
**Window Types:** `'standard'`, `'fixed'`, `'casement'`, `'sliding'`, `'bay'`.  
**Column Shapes:** `'round'`, `'square'`.

---

## 2. Property Editor Bridge

When an object is selected, the editor sends its current state to Kotlin via `onObjectSelected`. Kotlin can then call `updateElement` to apply changes.

### Element Schemas (Properties)

| Element `type` | Available `properties` |
| :--- | :--- |
| `furniture` | `name` (string), `width` (number), `depth` (number), `height` (number), `rotation` (number), `color` (hex), `material` (string) |
| `wall` | `thickness` (number), `height` (number), `color` (hex), `length` (number - readonly) |
| `door` | `type` (string), `width` (number), `height` (number), `swingDirection` ('left'\|'right'), `flipSide` (boolean), `position` (0.0-1.0) |
| `window` | `type` (string), `width` (number), `height` (number), `sillHeight` (number), `position` (0.0-1.0) |
| `stair` | `stairType` (string), `width` (number), `depth` (number), `riserCount` (number), `direction` ('up'\|'down'), `rotation` (number) |
| `column` | `shape` ('round'\|'square'), `diameter` (number), `height` (number), `color` (hex), `rotation` (number) |
| `room` | `name` (string), `area` (number - readonly), `roomType` ('indoor'\|'outdoor'\|'garage'\|'utility'), `color` (hex) |
| `textAnnotation` | `text` (string), `fontSize` (number), `color` (hex), `rotation` (number) |

---

## 3. Preview Mode (`/preview`)

The `/preview` route is a specialized, interactive 3D-only view designed for high-end visualization and object inspection.

### Characteristics:
1. **Interactive Raycasting:** Unlike the editor's 3D mode, touching an object in `/preview` triggers a selection event sent to Kotlin (`onObjectSelected`).    
2. **Minimal UI:** All editing toolbars, sidebars, and overlays are removed. Only the 3D viewer is rendered.
3. **Forced State:** This route automatically sets `readOnly: true` and `viewMode: '3d'`.

### Recommended Setup for Preview:
1. **Load URL:** `http://<your-server-address>/preview`
2. **Inject Data:** Just like the editor, wait for `onEditorReady()` and then call `window.loadFromKotlin()`.

---

## 4. Asset Management & External Models

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

## 5. Implementation Workflow

### Recommended Setup
To achieve a flicker-free integration, load the editor directamente.

1. **Load URL:** `http://<your-server-address>/editor`
2. **Passive State:** The editor will load in a "waiting" state (empty canvas). 
It will NOT create a default project or attempt to load from local storage unless an `?id=` parameter is present.
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

## 6. Data Schemas (JSON)

The editor operates on a `Project` object.

### Project Object
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier. |
| `name` | `string` | Display name. |
| `floors` | `Floor[]` | Array of floor objects. |
| `activeFloorId` | `string` | ID of the current floor. |
| `createdAt` | `Date` | Creation timestamp. |
| `updatedAt` | `Date` | Last modification timestamp. |
