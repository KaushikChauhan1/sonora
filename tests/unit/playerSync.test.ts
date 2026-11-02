import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { usePlayerStore } from '../../src/stores/usePlayerStore';
import { getActiveLineIndex, computeWordProgress } from '../../src/services/lyrics/synchronizer';
import { FEATURED_TRACKS, SEED_WORD_SYNC_LYRICS } from '../../src/services/metadata/catalogue';

describe('Player Synchronization & Dual-Clock Engine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    usePlayerStore.setState({
      currentTrack: FEATURED_TRACKS[0],
      isPlaying: false,
      positionSeconds: 0,
      durationSeconds: 200,
      syncOffsetMs: 0,
      lyrics: SEED_WORD_SYNC_LYRICS['track-1'] || [],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with zero sync offset and correct defaults', () => {
    const state = usePlayerStore.getState();
    expect(state.syncOffsetMs).toBe(0);
    expect(state.positionSeconds).toBe(0);
    expect(state.isPlaying).toBe(false);
  });

  it('adjusts sync offset accurately and clamps within ±15s bounds', () => {
    const store = usePlayerStore.getState();
    store.adjustSyncOffsetMs(500);
    expect(usePlayerStore.getState().syncOffsetMs).toBe(500);

    store.adjustSyncOffsetMs(-750);
    expect(usePlayerStore.getState().syncOffsetMs).toBe(-250);

    store.setSyncOffsetMs(0);
    expect(usePlayerStore.getState().syncOffsetMs).toBe(0);

    // Test boundaries
    store.adjustSyncOffsetMs(20000);
    expect(usePlayerStore.getState().syncOffsetMs).toBe(15000);

    store.adjustSyncOffsetMs(-40000);
    expect(usePlayerStore.getState().syncOffsetMs).toBe(-15000);
  });

  it('advances playback position continuously when isPlaying is toggled true', () => {
    const store = usePlayerStore.getState();
    store.togglePlay();
    expect(usePlayerStore.getState().isPlaying).toBe(true);

    // Advance virtual timer by 250ms (5 ticks of 50ms)
    vi.advanceTimersByTime(250);
    const pos = usePlayerStore.getState().positionSeconds;
    expect(pos).toBeGreaterThan(0.2);
    expect(pos).toBeLessThanOrEqual(0.35);

    // Pause
    store.togglePlay();
    expect(usePlayerStore.getState().isPlaying).toBe(false);
    const pausedPos = usePlayerStore.getState().positionSeconds;

    // Timer advances should not increase position when paused
    vi.advanceTimersByTime(500);
    expect(usePlayerStore.getState().positionSeconds).toBe(pausedPos);
  });

  it('reconciles lyrics active line index using effective time with sync offset', () => {
    const lyrics = SEED_WORD_SYNC_LYRICS['track-1'];
    expect(lyrics.length).toBeGreaterThan(0);

    // Line 0 is at 14000ms ("Yeah, yeah")
    // Line 1 is at 26000ms ("I've been tryna call")
    // If playback position is at 12s (12000ms) with 0 offset: before line 0
    expect(getActiveLineIndex(lyrics, 12000)).toBe(-1);

    // If playback position is at 12s (12000ms) but user shifts offset by +2500ms (effective: 14500ms):
    const effectiveTime = 12000 + 2500;
    expect(getActiveLineIndex(lyrics, effectiveTime)).toBe(0);
    expect(lyrics[0].words).toBe('Yeah, yeah');

    // If playback position is at 28s (28000ms): inside line 1
    expect(getActiveLineIndex(lyrics, 28000)).toBe(1);

    // Word progress in line 1 ("I've been tryna call"):
    // "tryna" starts at 28200ms, duration 1200ms
    const wordPart = lyrics[1].parts![2];
    expect(wordPart.words).toBe('tryna');

    const progressBefore = computeWordProgress(wordPart, 28000);
    expect(progressBefore.state).toBe('upcoming');

    const progressMid = computeWordProgress(wordPart, 28800);
    expect(progressMid.state).toBe('active');
    expect(progressMid.progress).toBeCloseTo(0.5, 1);

    const progressAfter = computeWordProgress(wordPart, 29600);
    expect(progressAfter.state).toBe('past');
    expect(progressAfter.progress).toBe(1.0);
  });
});
