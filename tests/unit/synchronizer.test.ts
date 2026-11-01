import { describe, it, expect } from 'vitest';
import {
  getActiveLineIndex,
  computeWordProgress,
} from '../../src/services/lyrics/synchronizer';
import { Lyric, LyricPart } from '../../src/types';

describe('Lyrics Synchronizer Engine', () => {
  const sampleLyrics: Lyric[] = [
    { startTimeMs: 5000, durationMs: 3000, words: 'Line 1' },
    { startTimeMs: 8000, durationMs: 4000, words: 'Line 2' },
    { startTimeMs: 12000, durationMs: 3000, words: 'Line 3' },
  ];

  it('identifies the active line correctly based on current playback timestamp', () => {
    // Before first line
    expect(getActiveLineIndex(sampleLyrics, 2000)).toBe(-1);

    // Inside first line
    expect(getActiveLineIndex(sampleLyrics, 6000)).toBe(0);

    // Inside second line
    expect(getActiveLineIndex(sampleLyrics, 9500)).toBe(1);

    // Inside third line
    expect(getActiveLineIndex(sampleLyrics, 13000)).toBe(2);

    // Past last line
    expect(getActiveLineIndex(sampleLyrics, 20000)).toBe(2);
  });

  it('computes word progress states accurately', () => {
    const part: LyricPart = {
      startTimeMs: 10000,
      durationMs: 2000,
      words: 'test',
    };

    // Before word starts
    const upcoming = computeWordProgress(part, 8000);
    expect(upcoming.state).toBe('upcoming');
    expect(upcoming.progress).toBe(0);

    // Halfway through word
    const halfway = computeWordProgress(part, 11000);
    expect(halfway.state).toBe('active');
    expect(halfway.progress).toBeCloseTo(0.5, 2);

    // Past word completion
    const past = computeWordProgress(part, 13000);
    expect(past.state).toBe('past');
    expect(past.progress).toBe(1);
  });
});
