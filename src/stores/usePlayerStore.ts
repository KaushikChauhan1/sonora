import { create } from 'zustand';
import { Track, Lyric, RepeatMode } from '../types';
import { FEATURED_TRACKS } from '../services/metadata/catalogue';
import { resolveLyrics } from '../services/lyrics';
import { extractArtworkColors, applyArtworkColorsToRoot } from '../utils/colorExtractor';
import { YouTubeEmbedPlayer } from '../providers/youtube-embed/YouTubeEmbedPlayer';
import { useQueueStore } from './useQueueStore';
import { useLibraryStore } from './useLibraryStore';

interface PlayerStoreState {
  currentTrack: Track;
  isPlaying: boolean;
  positionSeconds: number;
  durationSeconds: number;
  bufferedSeconds: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  isLyricsStudioOpen: boolean;
  isQueueDrawerOpen: boolean;
  lyrics: Lyric[];
  isLyricsLoading: boolean;
  syncOffsetMs: number;

  // Internal Embed Player Reference
  embedPlayer: YouTubeEmbedPlayer | null;

  // Actions
  initEmbedPlayer: (containerId: string) => void;
  playTrack: (track: Track) => Promise<void>;
  playPlaylist: (playlistId: string) => void;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setLyricsStudioOpen: (open: boolean) => void;
  setQueueDrawerOpen: (open: boolean) => void;
  setSyncOffsetMs: (offset: number) => void;
  adjustSyncOffsetMs: (delta: number) => void;
}

let masterClockTicker: ReturnType<typeof setInterval> | null = null;
let lastTickPerf = typeof performance !== 'undefined' ? performance.now() : Date.now();

function startMasterClock(set: any, get: any) {
  if (masterClockTicker) return;
  lastTickPerf = typeof performance !== 'undefined' ? performance.now() : Date.now();

  masterClockTicker = setInterval(() => {
    const { isPlaying, positionSeconds, durationSeconds, embedPlayer } = get();
    if (!isPlaying) {
      stopMasterClock();
      return;
    }

    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const dtSeconds = Math.min(0.2, Math.max(0.001, (now - lastTickPerf) / 1000));
    lastTickPerf = now;

    // Check YouTube authoritative player time
    let ytTime = 0;
    if (embedPlayer) {
      try {
        ytTime = embedPlayer.getCurrentTime();
      } catch {}
    }

    let nextPos: number;
    // If YouTube reported a positive time and it differs significantly (>350ms), gently reconcile
    if (ytTime > 0 && Math.abs(ytTime - positionSeconds) > 0.35) {
      nextPos = ytTime;
    } else {
      nextPos = positionSeconds + dtSeconds;
    }

    if (durationSeconds > 0 && nextPos >= durationSeconds) {
      set({ positionSeconds: durationSeconds });
      get().nextTrack();
    } else {
      set({ positionSeconds: nextPos });
    }
  }, 50);
}

function stopMasterClock() {
  if (masterClockTicker) {
    clearInterval(masterClockTicker);
    masterClockTicker = null;
  }
}

export const usePlayerStore = create<PlayerStoreState>((set, get) => ({
  currentTrack: FEATURED_TRACKS[0],
  isPlaying: false,
  positionSeconds: 0,
  durationSeconds: FEATURED_TRACKS[0].durationSeconds,
  bufferedSeconds: 0,
  volume: 80,
  isMuted: false,
  repeatMode: 'off',
  isShuffled: false,
  isLyricsStudioOpen: false,
  isQueueDrawerOpen: false,
  lyrics: [],
  isLyricsLoading: false,
  syncOffsetMs: 0,
  embedPlayer: null,

  initEmbedPlayer: (containerId: string) => {
    if (get().embedPlayer) return;

    const player = new YouTubeEmbedPlayer(containerId, {
      onReady: () => {
        // Player ready
      },
      onStateChange: (state) => {
        // YT.PlayerState: 1 = PLAYING, 2 = PAUSED, 0 = ENDED
        if (state === 1) {
          set({ isPlaying: true });
          startMasterClock(set, get);
        } else if (state === 2) {
          set({ isPlaying: false });
          stopMasterClock();
        } else if (state === 0) {
          stopMasterClock();
          get().nextTrack();
        }
      },
      onTimeUpdate: (currentTime, duration, buffered) => {
        const currentPos = get().positionSeconds;
        const updateObj: Partial<PlayerStoreState> = {
          bufferedSeconds: buffered,
        };
        if (duration > 0) {
          updateObj.durationSeconds = duration;
        }
        if (currentTime > 0 && Math.abs(currentTime - currentPos) > 0.35) {
          updateObj.positionSeconds = currentTime;
          lastTickPerf = typeof performance !== 'undefined' ? performance.now() : Date.now();
        }
        set(updateObj);
      },
      onError: (errorCode) => {
        console.warn('Playback error code:', errorCode);
      },
    });

    set({ embedPlayer: player });

    // Initial lyrics load & color extraction for default track
    const defaultTrack = get().currentTrack;
    resolveLyrics(defaultTrack).then((l) => set({ lyrics: l }));
    extractArtworkColors(defaultTrack.artworkUrl).then(applyArtworkColorsToRoot);
  },

  playTrack: async (track: Track) => {
    const { embedPlayer } = get();

    stopMasterClock();
    lastTickPerf = typeof performance !== 'undefined' ? performance.now() : Date.now();

    set({
      currentTrack: track,
      positionSeconds: 0,
      durationSeconds: track.durationSeconds || 180,
      bufferedSeconds: 0,
      isPlaying: true,
      isLyricsLoading: true,
      syncOffsetMs: 0,
    });

    startMasterClock(set, get);

    // Extract dynamic ambient artwork colors
    extractArtworkColors(track.artworkUrl).then(applyArtworkColorsToRoot);

    // Save to recent tracks
    useLibraryStore.getState().addRecentTrack(track);

    // Load in embed player
    if (embedPlayer) {
      embedPlayer.loadVideo(track.videoId);
      embedPlayer.play();
    }

    // Resolve synchronized lyrics
    try {
      const lyrics = await resolveLyrics(track);
      set({ lyrics, isLyricsLoading: false });
    } catch {
      set({ lyrics: [], isLyricsLoading: false });
    }
  },

  playPlaylist: (playlistId: string) => {
    const { embedPlayer } = get();
    if (embedPlayer) {
      embedPlayer.loadPlaylist(playlistId);
      set({ isPlaying: true });
      startMasterClock(set, get);
    }
  },

  togglePlay: () => {
    const { isPlaying, embedPlayer } = get();
    if (isPlaying) {
      if (embedPlayer) embedPlayer.pause();
      set({ isPlaying: false });
      stopMasterClock();
    } else {
      if (embedPlayer) embedPlayer.play();
      set({ isPlaying: true });
      startMasterClock(set, get);
    }
  },

  seek: (seconds: number) => {
    const { embedPlayer, durationSeconds } = get();
    const clamped = Math.max(0, Math.min(seconds, durationSeconds));
    lastTickPerf = typeof performance !== 'undefined' ? performance.now() : Date.now();
    set({ positionSeconds: clamped });
    if (embedPlayer) {
      embedPlayer.seekTo(clamped);
    }
  },

  setVolume: (volume: number) => {
    const { embedPlayer } = get();
    const clamped = Math.max(0, Math.min(100, volume));
    set({ volume: clamped, isMuted: clamped === 0 });
    if (embedPlayer) {
      embedPlayer.setVolume(clamped);
    }
  },

  toggleMute: () => {
    const { isMuted, volume, embedPlayer } = get();
    if (isMuted) {
      set({ isMuted: false });
      if (embedPlayer) embedPlayer.setVolume(volume || 50);
    } else {
      set({ isMuted: true });
      if (embedPlayer) embedPlayer.setVolume(0);
    }
  },

  toggleShuffle: () => {
    set((state) => ({ isShuffled: !state.isShuffled }));
  },

  cycleRepeat: () => {
    set((state) => {
      const modes: RepeatMode[] = ['off', 'all', 'one'];
      const nextIdx = (modes.indexOf(state.repeatMode) + 1) % modes.length;
      return { repeatMode: modes[nextIdx] };
    });
  },

  nextTrack: () => {
    const { repeatMode } = get();
    const next = useQueueStore.getState().advanceQueue(repeatMode);
    if (next) {
      get().playTrack(next);
    } else {
      set({ isPlaying: false });
      stopMasterClock();
    }
  },

  previousTrack: () => {
    const prev = useQueueStore.getState().previousTrack();
    if (prev) {
      get().playTrack(prev);
    }
  },

  setLyricsStudioOpen: (open: boolean) => {
    set({ isLyricsStudioOpen: open });
  },

  setQueueDrawerOpen: (open: boolean) => {
    set({ isQueueDrawerOpen: open });
  },

  setSyncOffsetMs: (offset: number) => {
    set({ syncOffsetMs: offset });
  },

  adjustSyncOffsetMs: (delta: number) => {
    set((state) => ({
      syncOffsetMs: Math.max(-15000, Math.min(15000, state.syncOffsetMs + delta)),
    }));
  },
}));
