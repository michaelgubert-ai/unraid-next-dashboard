# Release v0.0.1 — Initial Prototype Release 🚀

## 🌟 Overview
**Unraid Next Dashboard `v0.0.1`** is a radical reimagining of the Unraid WebGUI built with React 19, TypeScript, and Vite 8. It replaces dense Linux administration tables with a calm, atmospheric, centered workstation designed for modern displays.

---

## 🚀 What's New in v0.0.1

### 🌄 1. Atmospheric Mountain & Fog Living Backdrop
- Directly inspired by [CodePen QWbpqwR](https://codepen.io/animationbro/pen/QWbpqwR).
- High-resolution photographic lake & mountain landscape (*Antoine Barrès*).
- Multi-layered GPU-accelerated CSS3 animations for low-hanging mist (`fog-low.png`) and drifting clouds (`clouds.png` with `cloudLoop 80s`).
- Ambient cinematic vignette ensuring high contrast and readability.

### 🏝 2. Centered Workstation Architecture
- All widgets are organized into a floating island (`max-width: 1060px`) in the center of the viewport.
- Zero vertical scrolling at standard desktop resolutions (1366×768, 1440×900, 1920×1080).
- Frosted glass elevation (`backdrop-filter: blur(24px)`) with subtle borders and shadows.

### 💊 3. Floating Stadium Capsule Dock
- Side navigation floats detached from viewport edges (`16px` margin, `36px` border-radius).
- Pierre Sù inspired circular illuminated active pill (`#ff6b35`).
- Hover tooltips and 1-click smooth expansion into full card mode.

### 🟠 4. Storage Hero Card (Warm Orange Glass)
- Segmented multi-color donut gauge with large free space indicator (`5.65 TB FREE`).
- Categorized share allocation breakdown: Media (1.65 TB), Backups (0.45 TB), System (0.25 TB).
- Segmented Btrfs Fast Tier NVMe Cache progress line.

### ⚡ 5. Recent Events & Server Health Card
- Live activity feed tracking Mover actions, Time Machine snapshots, Plex media scans, and monthly parity integrity.
- Status badges: `Parity Valid`, `UPS 100% (45m)`, `LAN 1 Gbps`.

### 🔘 6. 3× Compact Circular Telemetry
- 4 sleek 52px micro-gauges vertically stacked:
  - **CPU**: Load percentage ring + 31°C flame badge.
  - **RAM**: Memory allocation ring (16 GB DDR5).
  - **NET**: Live throughput indicator.
  - **GPU**: VRAM allocation ring (RTX 3060).
- Detailed tooltips on hover; clicking opens the deep telemetry slide-over drawer.

### 🚀 7. Apps & Workloads Launcher Dock
- Clean 8×2 launcher grid of 50×50px squircles (macOS Launchpad / iPad style).
- Running status indicators, zero text truncation, category filters, and simulated WebUI launching.

### 📁 8. Modern Storage File Manager
- Dedicated Storage tab replacing the convoluted legacy shares table.
- macOS Finder / Windows Explorer feel with Starred shortcuts, Storage Pool filters, breadcrumbs, live search (`⌘K`), 1-click UNC network paths (`\\NASA2\Photos`), and plain-English caching explanations.

---

## 📦 How to Run

```bash
git clone https://github.com/michaelgubert-ai/unraid-next-dashboard.git
cd unraid-next-dashboard/prototype
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.
