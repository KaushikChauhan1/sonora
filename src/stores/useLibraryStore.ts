import { create } from 'zustand';
import { Track, Playlist } from '../types';
import { EDITORIAL_PLAYLISTS, FEATURED_TRACKS, KAUSHIK_PLAYLISTS } from '../services/metadata/catalogue';

const STORAGE_KEYS = {
  LIKED: 'sonora_liked_tracks_v1',
  PLAYLISTS: 'sonora_playlists_v1',
  HISTORY: 'sonora_history_v1',
  SEARCH: 'sonora_search_history_v1',
};

interface LibraryState {
  likedTrackIds: string[];
  playlists: Playlist[];
  recentTracks: Track[];
  searchHistory: string[];

  // Actions
  toggleLike: (trackId: string) => boolean;
  isLiked: (trackId: string) => boolean;
  createPlaylist: (title: string, description?: string) => Playlist;
  addSyncedPlaylist: (playlist: Playlist) => void;
  deletePlaylist: (playlistId: string) => void;
  addTrackToPlaylist: (playlistId: string, track: Track) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  addRecentTrack: (track: Track) => void;
  addSearchTerm: (term: string) => void;
  clearSearchHistory: () => void;
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('Storage save failed:', e);
  }
}

const initialPlaylists = (() => {
  const stored = loadFromStorage<Playlist[]>(STORAGE_KEYS.PLAYLISTS, EDITORIAL_PLAYLISTS);
  const missingKaushik = KAUSHIK_PLAYLISTS.filter((kp) => !stored.some((sp) => sp.id === kp.id));
  const merged = [...missingKaushik, ...stored];
  saveToStorage(STORAGE_KEYS.PLAYLISTS, merged);
  return merged;
})();

export const useLibraryStore = create<LibraryState>((set, get) => ({
  likedTrackIds: loadFromStorage<string[]>(STORAGE_KEYS.LIKED, ['track-1', 'track-2', 'track-4']),
  playlists: initialPlaylists,
  recentTracks: loadFromStorage<Track[]>(STORAGE_KEYS.HISTORY, [FEATURED_TRACKS[0], FEATURED_TRACKS[1]]),
  searchHistory: loadFromStorage<string[]>(STORAGE_KEYS.SEARCH, ['The Weeknd', 'Daft Punk', 'Synthwave']),

  toggleLike: (trackId: string) => {
    const { likedTrackIds } = get();
    const exists = likedTrackIds.includes(trackId);
    const updated = exists ? likedTrackIds.filter((id) => id !== trackId) : [...likedTrackIds, trackId];
    
    set({ likedTrackIds: updated });
    saveToStorage(STORAGE_KEYS.LIKED, updated);
    return !exists;
  },

  isLiked: (trackId: string) => {
    return get().likedTrackIds.includes(trackId);
  },

  createPlaylist: (title: string, description = '') => {
    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      title,
      description,
      artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
      trackCount: 0,
      tracks: [],
      isCustom: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updated = [newPlaylist, ...get().playlists];
    set({ playlists: updated });
    saveToStorage(STORAGE_KEYS.PLAYLISTS, updated);
    return newPlaylist;
  },

  addSyncedPlaylist: (playlist: Playlist) => {
    // Avoid duplicate playlists
    const filtered = get().playlists.filter((p) => p.id !== playlist.id);
    const updated = [playlist, ...filtered];
    set({ playlists: updated });
    saveToStorage(STORAGE_KEYS.PLAYLISTS, updated);
  },

  deletePlaylist: (playlistId: string) => {
    const updated = get().playlists.filter((p) => p.id !== playlistId);
    set({ playlists: updated });
    saveToStorage(STORAGE_KEYS.PLAYLISTS, updated);
  },

  addTrackToPlaylist: (playlistId: string, track: Track) => {
    const updated = get().playlists.map((p) => {
      if (p.id === playlistId) {
        if (p.tracks.some((t) => t.id === track.id)) return p;
        const newTracks = [...p.tracks, track];
        return {
          ...p,
          tracks: newTracks,
          trackCount: newTracks.length,
        };
      }
      return p;
    });

    set({ playlists: updated });
    saveToStorage(STORAGE_KEYS.PLAYLISTS, updated);
  },

  removeTrackFromPlaylist: (playlistId: string, trackId: string) => {
    const updated = get().playlists.map((p) => {
      if (p.id === playlistId) {
        const newTracks = p.tracks.filter((t) => t.id !== trackId);
        return {
          ...p,
          tracks: newTracks,
          trackCount: newTracks.length,
        };
      }
      return p;
    });

    set({ playlists: updated });
    saveToStorage(STORAGE_KEYS.PLAYLISTS, updated);
  },

  addRecentTrack: (track: Track) => {
    const current = get().recentTracks.filter((t) => t.id !== track.id);
    const updated = [track, ...current.slice(0, 24)];
    set({ recentTracks: updated });
    saveToStorage(STORAGE_KEYS.HISTORY, updated);
  },

  addSearchTerm: (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    const current = get().searchHistory.filter((t) => t.toLowerCase() !== trimmed.toLowerCase());
    const updated = [trimmed, ...current.slice(0, 9)];
    set({ searchHistory: updated });
    saveToStorage(STORAGE_KEYS.SEARCH, updated);
  },

  clearSearchHistory: () => {
    set({ searchHistory: [] });
    saveToStorage(STORAGE_KEYS.SEARCH, []);
  },
}));
