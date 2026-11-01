# SONORA — Queue & Library Technical Audit

## 1. Executive Summary

Music listeners expect instant responsiveness, non-destructive queue management, and offline-persistent libraries.
Auditing **Feishin**, **Orchard**, **Moosik**, and **Cider** informs the design of SONORA's queue and personal library architectures.

---

## 2. Queue Engine Architecture

### 2.1 State Representation
The queue is modeled as an active cursor over an ordered playlist, with priority inserts:
```typescript
interface QueueState {
  currentTrack: Track | null;
  currentIndex: number;
  items: Track[];             // Base sequence
  shuffledIndices: number[];  // Precomputed permutation for non-destructive shuffle
  isShuffled: boolean;
  repeatMode: 'off' | 'all' | 'one';
  history: Track[];           // Past played tracks (max 100)
}
```

### 2.2 Key Queue Operations
1. **Play Next (Priority Insertion):**
   - Injects the chosen track immediately after the active playhead (`currentIndex + 1`), preserving the subsequent queue.
2. **Add to End:**
   - Appends the track to `items.length`.
3. **Non-destructive Fisher-Yates Shuffle:**
   - Instead of mutating the original track list, generates a pseudo-random permutation map of indices.
   - Disabling shuffle instantly restores the original album or playlist order without losing the listener's place.
4. **Drag-and-Drop Reorder:**
   - Moves an item from `sourceIndex` to `destinationIndex` while adjusting `currentIndex` accordingly.
5. **Advancement Logic:**
   - **Track Ends:**
     - If `repeatMode === 'one'`: Replay current track (`seek(0); play()`).
     - If `currentIndex < items.length - 1`: Advance to `currentIndex + 1`.
     - If `currentIndex === items.length - 1` and `repeatMode === 'all'`: Loop to index 0.
     - Else: Stop playback, set status to `ended`.

---

## 3. Library & Local-First Persistence

### 3.1 IndexedDB Schema (Dexie / Keyval)
```typescript
interface SonoraDatabase {
  likedTracks: {
    id: string; // track.id
    track: Track;
    addedAt: number;
  };
  playlists: {
    id: string;
    title: string;
    description: string;
    artworkUrl?: string;
    trackIds: string[];
    createdAt: number;
    updatedAt: number;
  };
  history: {
    id: string;
    track: Track;
    playedAt: number;
  };
  lyricsCache: {
    key: string; // `${normalizedArtist}:${normalizedTitle}`
    lyrics: Lyric[];
    cachedAt: number;
  };
}
```

### 3.2 Offline First Principles
- All favorites, playlists, and playback history are stored immediately in IndexedDB.
- Instant optimistic UI updates (toggling heart icon takes < 16ms with zero server latency).
- Export/Import JSON feature allows users to back up and restore their personal collections across browsers without an account.
