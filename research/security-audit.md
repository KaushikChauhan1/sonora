# SONORA — Security, Privacy & Compliance Audit

## 1. Compliance Architecture & Boundaries

SONORA operates under strict security, privacy, and copyright compliance guidelines:
- **No DRM or Access Control Circumvention:** SONORA does not decrypt DRM-protected streams, crack Widevine tokens, or bypass subscription paywalls.
- **No Credential Harvesting:** SONORA does not request, store, or intercept Google user passwords, browser cookies, or private session tokens.
- **No Media Redistribution:** Audio and video are rendered strictly through the Google-approved YouTube IFrame Player embed architecture. No media files are downloaded or mirrored to third-party servers.
- **Terms of Service Compliance:** Uses documented YouTube IFrame embedding APIs and publicly accessible metadata.

---

## 2. Browser Security & Content Security Policy (CSP)

A robust CSP is specified for SONORA deployments:
```http
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://www.youtube.com https://s.ytimg.com;
  frame-src https://www.youtube.com https://www.youtube-nocookie.com;
  img-src 'self' data: blob: https://*.ytimg.com https://*.ggpht.com https://i.ytimg.com https://images.unsplash.com;
  connect-src 'self' https://lrclib.net https://suggestqueries.google.com https://*.googlevideo.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  media-src 'self' blob:;
```

---

## 3. Data Sanitization & XSS Mitigation

### 3.1 Lyrics & Metadata Sanitization
External lyrics files (LRC, TTML) and user-supplied playlist names can contain arbitrary text.
- All lyric line strings, title strings, and artist names are rendered via standard React JSX text nodes, which automatically escape HTML entities.
- Any raw HTML or markup injected via TTML is explicitly parsed with a strict whitelist DOM parser or discarded in favor of pure text parts.

### 3.2 URL Validation
- Video IDs are validated against standard YouTube alphanumeric patterns (`/^[a-zA-Z0-9_-]{11}$/`).
- External URLs (e.g. YouTube Music handoff) are strictly constrained to `https://music.youtube.com/watch?v=...`.

---

## 4. Local-First Privacy Protection
- All user data (playlists, likes, history, preferences) resides exclusively on the client machine in IndexedDB.
- No tracking telemetry, analytics beacons, or third-party ad pixels are present.
- Clearing browser data or clicking "Reset Library" completely purges local records.
