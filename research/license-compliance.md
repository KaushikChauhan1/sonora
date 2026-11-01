# SONORA — Open-Source License Compliance & IP Audit

## 1. Executive Summary

SONORA is engineered as a clean-room, production-grade application distributed under the **MIT License**.
To guarantee legal safety and intellectual property cleanliness, every acquired open-source repository was inspected for copyleft obligations, patent restrictions, and licensing incompatibilities.

---

## 2. Upstream License Classification

| License Class | Repositories Audited | Policy & Contamination Risk | SONORA Engineering Decision |
|---|---|---|---|
| **Permissive: MIT** | Braccato, Kawarp, RICS, Riff, Nixie Desktop, YouTube.js, ytmusicapi, LRCLIB, LRCGet, ThemeSong, OpenTune, Muriel | Zero copyleft contamination. Permitted for direct integration, adaptation, or clean-room implementation with attribution preserved. | Adopted as foundational reference. Braccato parser logic and Kawarp WebGL concepts adapted into clean TypeScript modules. |
| **Permissive: Apache-2.0** | Zuno Music | Permissive with patent grant clause. Compatible with MIT projects. | Studied for UI state transitions and mini-player layouts. |
| **Public Domain: CC0 1.0** | YTMDesktop2 | Unrestricted worldwide waiver of copyright. | Studied for plugin interface boundaries. |
| **Copyleft: GPL-3.0** | Better Lyrics, Better Lyrics API, Better Lyrics Shaders, Orchard, Lyrenne, ytm-rs, Moosik, YTMDesktop, Feishin | **High Contamination Risk.** Incorporating source code triggers reciprocal GPL-3.0 requirements across the entire codebase. | **Strictly Quarantine.** No code copied. Used exclusively for black-box architectural study, network protocol analysis, and timing verification. |
| **Strong Copyleft: AGPL-3.0** | Composer, Unison, Cider | **Extreme Contamination Risk.** Network interaction or server usage triggers copyleft source availability obligations. | **Strictly Quarantine.** Clean-room independent implementation only. |
| **Source-Available: PolyForm Strict** | Harmonoid | Commercial use and redistribution restrictions. Incompatible with open-source licensing. | **Study Only.** UI layout guidelines analyzed; no source code or assets incorporated. |

---

## 3. Clean-Room Implementation Protocol

To ensure SONORA's MIT licensing integrity:
1. **Isolated Research:** All 30 upstream repositories remain quarantined inside `research/repositories/` and are excluded from the production application bundle.
2. **Independent Re-Implementation:** All core modules under `src/` (the lyrics engine, playback state machine, queue manager, search cache, and light-glass UI) are authored cleanly from first principles.
3. **Third-Party Attribution:** Where conceptual algorithms originate from permissive MIT works (such as Braccato's LRC parsing tokens or Kawarp's WebGL Kawase blur filter), appropriate copyright notices and attribution statements are recorded in `src/legal/ATTRIBUTIONS.md`.
