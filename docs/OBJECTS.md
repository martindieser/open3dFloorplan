# Object Standardization & Dynamic Injection

This document defines the standards for objects (furniture, fixtures, symbols) that can be placed in the 3D Floor Plan editor. The editor functions as a **generic rendering shell**, meaning it relies on the host application (Kotlin/Native) to provide object definitions and assets at runtime.

## Object Definition Standard

All objects must adhere to the `FurnitureDef` interface. These definitions are injected via the Kotlin Bridge.

### Interface: `FurnitureDef`

| Property | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier for the object. |
| `name` | `string` | Display name in the UI. |
| `category` | `string` | Category for grouping in the sidebar (e.g., 'Living Room', 'Kitchen'). |
| `icon` | `string` | Emoji or icon string used in the 2D view and sidebar. |
| `color` | `string` | Hex color used for the 2D representation and procedural fallback. |
| `width` | `number` | Default width in centimeters (cm). |
| `depth` | `number` | Default depth in centimeters (cm). |
| `height` | `number` | Default height in centimeters (cm). |
| `symbol` | `boolean` | (Optional) If `true`, the object is a 2D-only technical symbol (no 3D model). |
| `modelUrl` | `string` | (Optional) URL to an external GLB model file. Overrides procedural rendering. |

## Dynamic Injection (Kotlin/Native)

The editor starts with an empty catalog. The host must provide the library during initialization:
1. **Initial Load:** Pass the `catalog` array in `BridgeConfig` during `loadFromKotlin`.
2. **Runtime Updates:** Use `window.registerFurniture(jsonString)` to add new items (e.g., as YOLO detections occur).

## Reference Catalog (Legacy Examples)

The following items are provided as a reference for standard dimensions and categories. *Note: These are no longer built into the editor and must be injected if needed.*

### Living Room
| ID | Name | Dimensions (W×D×H) |
| :--- | :--- | :--- |
| `sofa` | Sofa | 200 × 90 × 80 |
| `chair` | Armchair | 80 × 80 × 90 |
| `coffee_table` | Coffee Table | 120 × 60 × 45 |
| `television` | Television | 120 × 8 × 70 |

### Bathroom
| ID | Name | Dimensions (W×D×H) |
| :--- | :--- | :--- |
| `toilet` | Toilet | 40 × 65 × 40 |
| `bathtub` | Bathtub | 170 × 75 × 60 |
| `sink_b` | Sink | 60 × 45 × 85 |

*(...rest of the categories follow the same pattern...)*

## 2D Architectural Symbols

These items represent technical installations and are only visible in the 2D view.

### Electrical
- **Power Outlet** (`sym_outlet`)
- **Light Switch** (`sym_switch`)
- **Smoke Detector** (`sym_smoke`)

### Plumbing
- **Water Supply** (`sym_water_supply`)
- **Drain Point** (`sym_drain`)
- **Gas Line** (`sym_gas_line`)

## Architectural Elements

Standard dimensions and types for structural components. All measurements are in centimeters (cm).

### Walls
- **Standard Height**: 280 cm
- **Standard Thickness**: 15 cm (interior/exterior)
- **Properties**: Can have textures/colors assigned to interior and exterior faces independently.

### Doors
- **Standard Width**: 90 cm
- **Standard Height**: 210 cm
- **Types**:
  - `single`: Standard swing door.
  - `double`: Double swing doors.
  - `sliding`: Sliding door.
  - `french`: French style glass doors.
  - `pocket`: Door that slides into a wall cavity.
  - `bifold`: Folding doors.

### Windows
- **Standard Width**: 120 cm
- **Standard Height**: 120 cm
- **Standard Sill Height**: 90 cm
- **Types**:
  - `standard`: Typical opening window.
  - `fixed`: Non-opening picture window.
  - `casement`: Side-hinged window.
  - `sliding`: Horizontal sliding window.
  - `bay`: Projecting window arrangement.
