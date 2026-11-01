# SONORA — Artwork & Visual Effects Technical Audit

## 1. Executive Summary

SONORA's visual signature is **Premium Light-Glass**: editorial typography, cinematic album artwork, liquid glass surfaces, and restrained, physics-based transitions.
Auditing **Kawarp**, **Better Lyrics Shaders**, **ThemeSong**, and **Cider** informs the design of SONORA's real-time visual environment.

---

## 2. Upstream Visual Engines Analysis

### 2.1 Kawarp & Better Lyrics Shaders (WebGL2 & Kawase Blur)
- **Principle:** Downsamples album artwork to an off-screen $128 \times 128$ texture, applies 4–6 iterations of Kawase dual-filter blur, and maps a simplex-noise domain warp shader over time.
- **Resource Footprint:** By executing passes at $128 \times 128$ resolution before upscaling to the full viewport with bilinear filtering, GPU utilization remains below 3% on integrated graphics (e.g. Apple Silicon, Intel Iris).
- **Graceful Degradation:** If WebGL2 is unsupported or `prefers-reduced-motion` is active, the engine falls back to a static CSS radial gradient derived from the artwork's dominant color palette.

### 2.2 ThemeSong Color Extraction Engine
- **Approach:** Samples an offscreen canvas containing the album artwork image.
- **Color Clustering:** Extracts dominant, primary, secondary, and accent colors by quantizing RGB histograms.
- **Luminance & Contrast Calibration:** Calculates relative luminance:
  $$L = 0.2126 R + 0.7152 G + 0.0722 B$$
  Adjusts saturation and lightness to ensure text overlaid on glass elements maintains WCAG AAA compliance (contrast ratio $\ge 7:1$) against the light-glass background (`#F6F4EF`).

---

## 3. SONORA Light-Glass System Architecture

### 3.1 Design Tokens
```css
:root {
  /* Surfaces */
  --background: #F6F4EF;
  --surface: #FFFFFF;
  --surface-secondary: #EFEEE9;
  --surface-tertiary: #E8E5DE;

  /* Typography */
  --text-primary: #242321;
  --text-secondary: #85827C;
  --text-muted: #A3A09A;

  /* Accents */
  --accent: #9A86D8;
  --accent-light: #ECE7FA;
  --border: #E8E5DE;
  --border-light: rgba(232, 229, 222, 0.6);

  /* Glass Materials */
  --glass: rgba(255, 255, 255, 0.72);
  --glass-elevated: rgba(255, 255, 255, 0.88);
  --glass-border: rgba(255, 255, 255, 0.5);
  --glass-blur: blur(24px) saturate(160%);

  /* Shadows */
  --shadow-subtle: 0 4px 20px -2px rgba(36, 35, 33, 0.04);
  --shadow-elevated: 0 12px 36px -4px rgba(36, 35, 33, 0.08);
  --shadow-ambient: 0 24px 64px -8px rgba(154, 134, 216, 0.16);
}
```

### 3.2 Dynamic Ambient Backdrop
When a track is playing:
1. The artwork URL is loaded into an offscreen image.
2. A fast canvas extractor samples the top 2 vibrant colors (e.g. soft lavender, warm terracotta).
3. The background renders a multi-stop ambient light mesh:
   `background: radial-gradient(circle at 15% 20%, rgba(var(--dominant-rgb), 0.18) 0%, transparent 60%), radial-gradient(circle at 85% 80%, rgba(var(--accent-rgb), 0.14) 0%, transparent 60%), #F6F4EF;`
4. Provides continuous immersion without overwhelming the clean light-mode typography.

### 3.3 Performance & Lifecycle Safeguards
- All canvas animations disconnect and cancel their `requestAnimationFrame` handle when the tab is hidden (`document.visibilityState === 'hidden'`) or when paused.
- WebGL contexts release textures, shaders, and framebuffers upon track unmount.
- Respects `prefers-reduced-motion` media queries by freezing shader oscillations.
