# Project Context - Curve Labs Website

## Overview
This is the frontend for the Curve Labs website, a venture laboratory for relational technologies. The site features animated hero backgrounds using Unicorn Studio animations.

## Current State (Feb 4, 2026)

### Hero Section Animations
The Hero section (`frontend/components/Hero.tsx`) displays "We Build Digital Souls" text with animated backgrounds. There are **4 animation options** that can be toggled via buttons in the top-right corner:

1. **Flower** - `/public/unicorn-flower.json` - Polar/flower pattern animation
2. **Liquify** - `/public/unicorn-liquify.json` - Liquify effect (working well)
3. **Flow** - `/public/unicorn-flow.json` - Flow/dither pattern animation
4. **Sphere** - `/public/unicorn-sphere.json` - Sphere with liquify effect

### Technical Implementation
- **Unicorn Studio SDK**: Loaded from CDN (`https://cdn.jsdelivr.net/gh/AliaksandrD/unicornstudio.js@1.0.0/dist/index.js`)
- **Animation Loading**: JSON files are loaded via `window.UnicornStudio.addScene()` with the `filePath` option
- **Container Sizing**: 
  - Sphere animation: 80% size, centered (smaller)
  - Other animations: 150% size with -25% offset (larger to cover text area)

### Key Files
- `frontend/components/Hero.tsx` - Main hero component with animation switching
- `frontend/public/unicorn-*.json` - Unicorn Studio animation JSON files
- `frontend/components/GradientFlowShader.tsx` - Custom WebGL shader (not currently used, was replaced by Sphere)

### Known Issues & Notes
- The Flower and Flow animations have internal positioning in their JSON (designed for 1440x900 artboard) which may cause them to appear offset
- The Liquify animation works well because it has a full-viewport gradient background layer
- Animation container is positioned absolutely behind the SVG text

### Animation JSON Structure
The working Liquify animation has this structure:
1. Background gradient effect (`"isBackground": true`)
2. Liquify effect
3. Shape layer with effects

The Flower/Flow animations start with a shape layer directly (no background), which may affect rendering.

## Development
- Run: `npm run dev` in `/frontend` directory
- Default port: 3000 (falls back to 3001 if busy)
- Framework: React + Vite + TypeScript + Tailwind CSS

## Next Steps / Potential Improvements
- [ ] Verify Flower and Flow animations are rendering correctly
- [ ] Consider adding background layer to Flower/Flow JSONs if they appear offset
- [ ] Fine-tune animation container positioning if needed
