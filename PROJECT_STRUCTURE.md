# 📁 Project File Structure & Architecture Explanation

Welcome to the **GeniusConnects AI Announcement Image Generator** project! This document provides a complete guide to understanding every folder, file, and component within this repository.

---

## 🌳 Overall Directory Tree

```
ai-generator/
├── 📁 public/                     # Static assets accessible directly via URL
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── 📁 src/                        # Main Application Source Code
│   ├── 📁 app/                    # Next.js App Router (Pages & Layouts)
│   │   ├── globals.css            # Global CSS styles & Tailwind directives
│   │   ├── layout.tsx             # Root layout wrapper (HTML structure, fonts)
│   │   └── page.tsx               # Main Dashboard page (State management & UI shell)
│   │
│   ├── 📁 components/             # Reusable React UI Components
│   │   ├── Controls.tsx           # Sidebar settings panel (Tabs, Sliders, Text inputs)
│   │   └── PosterCanvas.tsx       # HTML5 Canvas engine for dynamic poster rendering & eraser
│   │
│   └── 📁 utils/                  # Helper modules & AI processing scripts
│       └── bgRemover.ts           # WebAssembly AI Background Removal & edge cleaning engine
│
├── ⚙️ Configuration & Build Files
├── package.json                   # Project dependencies & npm scripts
├── tsconfig.json                  # TypeScript compiler settings
├── next.config.ts                 # Next.js framework configuration
├── postcss.config.mjs             # PostCSS plugin configurations (Tailwind v4)
├── .gitignore                     # Git exclusion rules
├── AGENTS.md                      # Agent rules & Next.js guidelines
├── CLAUDE.md                      # Custom development context
└── README.md                      # Default project read-me
```

---

## 🔍 Detailed File & Directory Breakdown

### 1. 📁 `src/app/` — Next.js App Router Core

- **[`page.tsx`](file:///c:/Users/Naveen%20S/Downloads/ai-generator/src/app/page.tsx)**
  - **Role**: The central orchestrator & main page of the application.
  - **Key Responsibilities**:
    - Holds the primary state (`settings`, `personImageUrl`, `isRemovingBg`, `activeTab`, `isEraserMode`).
    - Manages file upload triggers and delegates AI background extraction to `bgRemover.ts`.
    - Handles poster export (High-Res PNG download with `canvas-confetti` fireworks, and copy-to-clipboard functionality).
    - Assembles the 2-column layout: **Poster Canvas (Left)** and **Controls Sidebar (Right)**.

- **[`layout.tsx`](file:///c:/Users/Naveen%20S/Downloads/ai-generator/src/app/layout.tsx)**
  - **Role**: The top-level HTML layout wrapper for all pages.
  - **Key Responsibilities**:
    - Defines metadata (`title: "GeniusConnects Poster Generator"`).
    - Loads Google Fonts dynamically (`Inter`, `Lexend Deca`, `Outfit`, etc.).
    - Wraps children with basic HTML `<body>` tags.

- **[`globals.css`](file:///c:/Users/Naveen%20S/Downloads/ai-generator/src/app/globals.css)**
  - **Role**: Global stylesheet.
  - **Key Responsibilities**:
    - Imports Tailwind CSS (`@import "tailwindcss"`).
    - Defines custom utility classes, scrollbar styles, and canvas animations.

---

### 2. 📁 `src/components/` — UI Components

- **[`PosterCanvas.tsx`](file:///c:/Users/Naveen%20S/Downloads/ai-generator/src/components/PosterCanvas.tsx)**
  - **Role**: High-performance HTML5 2D Canvas rendering engine.
  - **Key Responsibilities**:
    - Dynamically renders background gradients, custom text banners, and person cutouts at 1200×1500px resolution.
    - Applies image filters (scale, X/Y offsets, brightness, contrast, drop-shadows).
    - Includes interactive **Manual Eraser Brush Mode** allowing users to erase unwanted artifacts directly on the canvas.
    - Exposes a high-res image exporter callback (`getCanvasDataUrlRef`) to `page.tsx`.

- **[`Controls.tsx`](file:///c:/Users/Naveen%20S/Downloads/ai-generator/src/components/Controls.tsx)**
  - **Role**: Sidebar control dashboard for customization.
  - **Key Responsibilities**:
    - Organized into 4 main navigation tabs:
      1. **Upload & Samples**: Image dropzone, background remover button, sample portraits.
      2. **Text & Banner**: Input fields for announcement text, font picker, font size, banner height, banner opacity.
      3. **Cutout Adjustments**: Scale, Offset X/Y, Brightness/Contrast sliders, Manual Eraser mode toggle, Auto-Clean Top Head tool.
      4. **Poster Background**: Preset gradient buttons, custom color pickers, gradient angle slider.

---

### 3. 📁 `src/utils/` — Utility Services

- **[`bgRemover.ts`](file:///c:/Users/Naveen%20S/Downloads/ai-generator/src/utils/bgRemover.ts)**
  - **Role**: In-browser AI Background Removal engine.
  - **Key Responsibilities**:
    - Powered by `@imgly/background-removal` running ONNX / WebAssembly locally inside the browser.
    - Processes raw uploaded images (JPEG/PNG/SVG) and returns a transparent PNG cutout Blob.
    - Includes post-processing routines (`cleanCutoutImage`) for defringing edges, eroding boundary noise, and cleaning top head lamp/studio protrusions.

---

### 4. ⚙️ Root Configuration Files

- **[`package.json`](file:///c:/Users/Naveen%20S/Downloads/ai-generator/package.json)**: Lists project dependencies (`next`, `react`, `@imgly/background-removal`, `lucide-react`, `canvas-confetti`) and script triggers (`npm run dev`, `npm run build`).
- **[`tsconfig.json`](file:///c:/Users/Naveen%20S/Downloads/ai-generator/tsconfig.json)**: TypeScript compiler settings, alias paths (`@/*` pointing to `./src/*`).
- **[`next.config.ts`](file:///c:/Users/Naveen%20S/Downloads/ai-generator/next.config.ts)**: Next.js build-time and server configuration settings.
- **[`postcss.config.mjs`](file:///c:/Users/Naveen%20S/Downloads/ai-generator/postcss.config.mjs)**: Configures PostCSS with `@tailwindcss/postcss` for Tailwind CSS v4 styling.

---

## ⚡ How Data & Logic Flows

1. **User Uploads Image**:
   - `Controls.tsx` catches the file upload and invokes `onUploadImage(file)`.
   - `page.tsx` receives the file and calls `removeImageBackground(file)` in `bgRemover.ts`.
   - AI extracts the person, cleans up boundary pixels, and updates `personImageUrl`.

2. **Canvas Rendering**:
   - `PosterCanvas.tsx` receives updated `settings` and `personImageUrl`.
   - Re-draws the poster in real time: Background Gradient ➡️ Person Cutout with Drop Shadow ➡️ White Banner Box ➡️ Text Overlay.

3. **User Export**:
   - Clicking **Export** in the top bar or sidebar calls `handleDownloadPNG()`.
   - `PosterCanvas` extracts high-res PNG data (`canvas.toDataURL()`), downloads the file, and triggers a confetti animation.

---

*Generated for GeniusConnects Image Generator Workspace.*
