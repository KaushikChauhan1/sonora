import { Lyric, LyricPart } from '../../types';

export interface WordProgressState {
  state: 'past' | 'active' | 'upcoming';
  progress: number; // 0 to 1
}

/**
 * Calculates the active lyric line index for a given playback position in milliseconds.
 */
export function getActiveLineIndex(lyrics: Lyric[], currentTimeMs: number): number {
  if (!lyrics || lyrics.length === 0) return -1;

  for (let i = 0; i < lyrics.length; i++) {
    const line = lyrics[i];
    const lineEndMs = line.startTimeMs + line.durationMs;
    
    // Check if the current time falls inside this line
    if (currentTimeMs >= line.startTimeMs && currentTimeMs < lineEndMs) {
      return i;
    }

    // Check if between this line and the next line
    if (i < lyrics.length - 1) {
      const nextLine = lyrics[i + 1];
      if (currentTimeMs >= lineEndMs && currentTimeMs < nextLine.startTimeMs) {
        return i;
      }
    }
  }

  // If before first line
  if (currentTimeMs < lyrics[0].startTimeMs) {
    return -1;
  }

  // If past last line
  return lyrics.length - 1;
}

/**
 * Computes word state (past, active, upcoming) and completion progress (0..1) for word-by-word animation.
 */
export function computeWordProgress(part: LyricPart, currentTimeMs: number): WordProgressState {
  const partEndMs = part.startTimeMs + part.durationMs;

  if (currentTimeMs >= partEndMs) {
    return { state: 'past', progress: 1.0 };
  }

  if (currentTimeMs < part.startTimeMs) {
    return { state: 'upcoming', progress: 0.0 };
  }

  const duration = Math.max(1, part.durationMs);
  const elapsed = currentTimeMs - part.startTimeMs;
  const progress = Math.min(1.0, Math.max(0.0, elapsed / duration));

  return { state: 'active', progress };
}

/**
 * Calculates target scroll top to position the active lyric line in the optimal editorial focus zone (approx 38% from top).
 */
export function calculateScrollTop(
  activeElement: HTMLElement,
  containerElement: HTMLElement,
  focusRatio: number = 0.38
): number {
  const containerHeight = containerElement.clientHeight;
  const elementTop = activeElement.offsetTop;
  const elementHeight = activeElement.clientHeight;

  const targetY = elementTop - (containerHeight * focusRatio) + (elementHeight / 2);
  return Math.max(0, targetY);
}
