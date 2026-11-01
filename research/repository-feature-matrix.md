# SONORA — Repository Feature Matrix

This matrix compares the architectural capabilities, playback methods, synchronization precision, and visual systems across key audited repositories to guide SONORA's product engineering.

| Repository | Playback Type | Lyrics Sync Precision | Dynamic Visuals | Queue Capabilities | Offline / Local Storage | License Class | Target Runtime |
|---|---|---|---|---|---|---|---|
| **Better Lyrics** | External (YTM DOM Hook) | Word & Syllable (RichSync) | Liquid WebGL Shader | N/A (Delegated to Host) | Browser Storage Cache | GPL-3.0 | Chrome / Firefox Extension |
| **Braccato** | None (Renderer Engine) | Word, Syllable & Line | CSS transforms & Keyframes | N/A | None (In-memory) | MIT | Web Component / Core Engine |
| **Kawarp** | None (Visual Engine) | N/A | WebGL2 Kawase Blur + Domain Warp | N/A | None | MIT | Canvas / WebGL |
| **Composer** | HTML5 Audio / Waveform | Word / Syllable Editor | Waveform Canvas | Playhead timeline | Local file export | AGPL-3.0 | Web Application |
| **Orchard** | Native Rust (Rodio / AudioGraph) | Line-level (LRC) | Ambient Palette Shift | Full Priority Queue, Shuffle, History | SQLite / Local Files | GPL-3.0 | Tauri Desktop (macOS/Win/Linux) |
| **Riff** | Electron WebAudio / HLS | Line & RTL support | Canvas Audio Shapes | Basic linear queue | Local JSON store | MIT | Electron Desktop |
| **Zuno** | Native Audio Core | Unsynced / Line | Album Glow Border | Draggable Queue, Mini Player | Local SQLite | Apache-2.0 | Tauri Desktop |
| **Nixie Desktop** | Electron WebView Stream | Line-level (LRCLIB) | Static Album Art | Linear Queue, History | Electron Store | MIT | Electron Desktop |
| **YTMDesktop2** | Electron WebView / Native API | Plugin-driven | Themed CSS Injection | Plugin Queue, REST API | SQLite / Electron Store | CC0 1.0 | Electron Desktop |
| **LRCLIB** | REST API Server | Line & Word (enhanced LRC) | None | N/A | SQLite Server DB | MIT | Web Service |
| **LRCGet** | None (Batch Utility) | Line & Word (LRC files) | None | N/A | Local File System | MIT | Tauri Desktop Utility |
| **ThemeSong** | Injected YTM WebExtension | N/A | Dynamic Color Themes, Visualizer | N/A | Extension Sync Storage | MIT | Browser Extension |
| **Feishin** | Howler.js / WebAudio | Line-level synced | Responsive Grid Art | Advanced Virtualized Queue, Playlists | IndexedDB / LocalStorage | GPL-3.0 | Electron / Web |
| **Harmonoid** | LibVLC / MediaKit | Line-level LRC | Fluent Design Materials | Shuffle, Loop, Reorder | SQLite DB | PolyForm Strict | Flutter Desktop & Mobile |
| **Cider** | Electron Apple Music WebAudio | Line & Word | Apple Glass / Blur | Priority Queue, Up Next | IndexedDB | AGPL-3.0 | Electron Desktop |
| **YouTube.js** | Stream URL Resolver / Decryptor | YouTube TimedText | None | InnerTube Queue | In-memory Cache | MIT | Node.js / Isomorphic |
| **ytmusicapi** | None (Python Metadata) | Plain / YouTube TimedText | None | YouTube Music Playlist Endpoints | None | MIT | Python Backend |
| **SONORA** (Target) | **Official YT IFrame API + Handoff** | **Word, Syllable & Line (LRCLIB + Braccato model)** | **Light-Glass Liquid Blur (Kawarp-inspired + CSS Backdrop)** | **Full Local Queue (Drag/Drop, Shuffle, History)** | **IndexedDB Local-First** | **Clean MIT Baseline** | **Browser (Desktop + Mobile Responsive)** |

---

## Architectural Synthesis for SONORA

1. **Playback Engine:**
   - Standalone web applications cannot lawfully decrypt proprietary Widevine streams or bypass YouTube bot detection without breaking browser sandboxes or violating policies.
   - SONORA uses the **Official YouTube IFrame Player API** as its core playback provider, supplemented with an **External Handoff** link to `music.youtube.com`. This ensures 100% browser compatibility, zero CORS issues, compliant streaming, and native playback stability.

2. **Lyrics Synchronization:**
   - Braccato and Better Lyrics prove that word-by-word timing requires a structured model (`LyricPart` with `startTimeMs`, `durationMs`, and `words`), driven by a micro-interval playback clock with drift compensation.
   - LRCLIB provides a zero-friction, CORS-enabled public endpoint with word-level and line-level timestamps.

3. **Visual Environment:**
   - Cider and Harmonoid show the power of ambient album-art illumination.
   - Kawarp demonstrates that downsampling artwork to 128x128 on an offscreen WebGL canvas produces Apple Music-quality fluid blur while keeping GPU and CPU usage minimal (< 2% CPU on modern hardware).
   - SONORA combines this with a **Premium Light-Glass** design system: `#F6F4EF` canvas, liquid glass surfaces, and editorial typography (Inter + Manrope).
