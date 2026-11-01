# SONORA — Open Source Attributions & Notices

SONORA is built using original code, clean-room implementations, and permissive open-source dependencies. We gratefully acknowledge the researchers, engineers, and creators whose open-source work inspired SONORA's architecture:

---

### 1. Braccato & Better Lyrics Ecosystem
- **Projects:** Braccato (`@braccato/parsers`, `@braccato/core`), Better Lyrics
- **Authors:** The Better Lyrics Team & Contributors
- **License:** MIT License / GPL-3.0
- **Notice:** SONORA adapts Braccato's LRC parsing grammar specification and word-level data models (`LyricPart` and `Lyric`) under clean-room TypeScript implementations.

### 2. Kawarp
- **Project:** Kawarp (Fluid Animated Background Renderer)
- **Authors:** Kawarp Contributors
- **License:** MIT License
- **Notice:** SONORA's ambient fluid background renderer adapts Kawarp's high-efficiency downsampling architecture ($128 \times 128$ offscreen texture passes with Kawase blur and domain warping).

### 3. LRCLIB
- **Project:** LRCLIB & LRCGet
- **Author:** Tran Xuan Thang (`@tranxuanthang`)
- **License:** MIT License
- **Notice:** SONORA connects directly to LRCLIB's public API (`https://lrclib.net`) as a primary lyrics data provider.

### 4. ThemeSong
- **Project:** ThemeSong
- **Author:** Kristoffer Troncoso (`@KristofferTroncoso`)
- **License:** MIT License
- **Notice:** Architectural inspiration for dynamic artwork color extraction and light-glass UI contrast adjustment.

### 5. YouTube IFrame Player API
- **Provider:** Google LLC / YouTube
- **Notice:** SONORA uses the official YouTube IFrame Player API in compliance with YouTube Developer Terms of Service and Embedding Guidelines.
