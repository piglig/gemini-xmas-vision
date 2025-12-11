# 🎄 Gemini-Xmas-Vision

[![English](https://img.shields.io/badge/lang-English-blue)](README_EN.md) [![Chinese](https://img.shields.io/badge/lang-中文-red)](README.md)

**Gemini-Xmas-Vision** is an interactive WebAR 3D particle Christmas tree. It combines the particle system of **Three.js** with **MediaPipe** hand-tracking so users can control a shimmering tree and browse a spiral photo wall with gestures.

---

## ✨ Features

1.  **Particle Christmas tree**
    *   Trunk, leaves, ornaments, and a star made entirely from particles with flowing light effects.
    *   Breathing animation plus rotating light beams.
2.  **AI hand interaction (WebAR)**
    *   **🖐️ Hover**: show your palm to enter interaction mode.
    *   **👋 Wave**: wave left or right to trigger on-screen greetings.
    *   **↔️ Move**: move your palm left/right to rotate the tree; up/down to zoom the camera.
    *   **👌 Pinch**: pinch thumb and index finger to select and enlarge a photo.
3.  **Smart spiral photo wall**
    *   Photos float in a spiral around the tree.
    *   **Dual-sided**: mirrored backs keep orientation correct.
    *   **Smart raycast**: pinch shows the photo you point at; otherwise the nearest one.
    *   **Adaptive layout**: frames auto-fit landscape or portrait photos.
4.  **Immersive vibe**
    *   Snowfall background; pinch slows to a “bullet time” effect while viewing photos.
    *   Background music control included.

---

## 🚀 Quick Start

Due to browser CORS and camera permissions, you **cannot** open `index.html` directly. Run a local server instead.

### 1. Start a local server
Choose any method you like:

#### Option A: VS Code Live Server (recommended)
1. Install the `Live Server` extension in VS Code.
2. Open `index.html`, right-click, and choose `Open with Live Server`.

#### Option B: Python simple HTTP server
Make sure Python 3 is installed, then in the project root run:

```bash
# Starts a simple HTTP server on port 8080
python3 -m http.server 8080
```

#### Option C: Run the Python backend
If you need backend logic, run `app.py`:

```bash
python app.py
```

### 2. Open the site
Use Chrome or Safari and visit: **http://localhost:8080**

### 3. Grant permissions
On first load the browser will request camera access. Click **Allow**.

---

## 🌐 CDN Configuration

`config.json` controls how CDN resources are loaded. Edit the `cdn_region` field based on your network conditions:

```json
{
    "cdn_region": "LOCAL",
    "note": "Set cdn_region to 'CN' for China, 'GLOBAL' for international, or 'LOCAL' for offline use."
}
```

Supported values:

*   **`"GLOBAL"` (International CDN)**:
    *   Use `cdnjs.cloudflare.com` and `cdn.jsdelivr.net`; good performance outside mainland China.
*   **`"CN"` (China CDN)**:
    *   Use `cdn.bootcdn.net` and `npm.elemecdn.com`; optimized for mainland China. May fail (403 or timeouts) outside China.
*   **`"LOCAL"` (Local cache)**:
    *   Load all required Three.js and MediaPipe assets from `libs/`. Best for offline or unstable networks.

**Recommendations**
*   If unsure or often hit network issues, pick **`"LOCAL"`** for maximum stability.
*   Outside mainland China: use `"GLOBAL"` or `"LOCAL"`.
*   For mainland China users: use `"CN"` if reachable; otherwise `"LOCAL"`.

---

## 🖼️ Image Management

The project auto-reads images from the `assets` folder.

### Add photos
1.  Drop your photos (jpg/png/heic) into `assets/`.
2.  Run the rename script (Mac/Linux):
    ```bash
    # Grant execute permission (once)
    chmod +x rename_assets.sh
    
    # Run the script
    ./rename_assets.sh
    ```
    *Renames images to `1.jpg`, `2.jpg`, etc., for automatic loading.*
3.  Refresh the page to see the updated wall.

---

## 🎮 User Guide

| Gesture | Icon | Action |
| :--- | :---: | :--- |
| **Open palm** | ✋ | **Activate**: shows a yellow cursor that follows your hand. |
| **Move left/right** | ↔️ | **Rotate view**: orbit around the tree. |
| **Move up/down** | ↕️ | **Zoom view**: move the camera closer/farther. |
| **Wave** | 👋 | **Send wishes**: triggers “Merry Christmas” style effects. |
| **Pinch thumb/index** | 👌 | **View photo**: <br>1) Point and pinch → open that photo. <br>2) Pinch in empty space → open the nearest photo. <br>Hold to lock view; release to exit. |

---

## ⚠️ Precautions

1.  **Camera permissions**
    *   WebAR must run on **localhost** or **HTTPS**.
    *   Accessing via LAN IP (e.g., `http://192.168.x.x:8080`) may block the camera if not HTTPS.
2.  **Lighting**
    *   Use in good lighting. Backlight or darkness can destabilize hand tracking (cursor shaking or missing).
3.  **Performance**
    *   About 8000+ particles render by default. If the device heats up or stutters, lower `particleCount` (leaves) or `snowflakeCount` (snow) in `CONFIG`.
4.  **Image formats**
    *   The script handles `.jpg`, `.png`, `.heic`, and renames them to `.jpg` for the web, which modern browsers support well.

---

## 🛠️ Tech Stack
*   **Three.js**: 3D rendering (particles, materials, scenes).
*   **MediaPipe Hands**: real-time hand landmark tracking.
*   **HTML5/CSS3**: UI overlays.

---

*Created on December 6, 2025*
