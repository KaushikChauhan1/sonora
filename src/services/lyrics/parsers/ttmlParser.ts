import { Lyric, LyricPart } from '../../../types';

/**
 * Parses XML/TTML timed text format into structured Lyric[] objects.
 */
export function parseTTML(ttmlText: string): Lyric[] {
  if (!ttmlText) return [];

  const lyrics: Lyric[] = [];
  const parser = new DOMParser();
  
  try {
    const doc = parser.parseFromString(ttmlText, 'application/xml');
    const pElements = doc.querySelectorAll('p');

    pElements.forEach((p) => {
      const beginAttr = p.getAttribute('begin');
      const endAttr = p.getAttribute('end');

      if (!beginAttr) return;

      const startTimeMs = parseTimestampToMs(beginAttr);
      const endTimeMs = endAttr ? parseTimestampToMs(endAttr) : startTimeMs + 3500;
      const durationMs = Math.max(500, endTimeMs - startTimeMs);

      const spanElements = p.querySelectorAll('span');
      let parts: LyricPart[] | undefined = undefined;

      if (spanElements.length > 0) {
        parts = [];
        spanElements.forEach((span) => {
          const sBegin = span.getAttribute('begin') || beginAttr;
          const sEnd = span.getAttribute('end');
          const spanStartMs = parseTimestampToMs(sBegin);
          const spanEndMs = sEnd ? parseTimestampToMs(sEnd) : spanStartMs + 300;

          parts?.push({
            startTimeMs: spanStartMs,
            durationMs: Math.max(100, spanEndMs - spanStartMs),
            words: span.textContent || ''
          });
        });
      }

      lyrics.push({
        startTimeMs,
        durationMs,
        words: p.textContent || '',
        parts,
        isInstrumental: false
      });
    });
  } catch (err) {
    console.error('Failed to parse TTML:', err);
  }

  return lyrics;
}

function parseTimestampToMs(timestamp: string): number {
  if (!timestamp) return 0;
  
  // Format: "00:01:23.456" or "01:23.456" or "123.45s" or "12345ms"
  if (timestamp.endsWith('ms')) {
    return parseInt(timestamp.replace('ms', ''), 10);
  }
  if (timestamp.endsWith('s')) {
    return Math.round(parseFloat(timestamp.replace('s', '')) * 1000);
  }

  const parts = timestamp.split(':');
  if (parts.length === 2) {
    return Math.round(parseInt(parts[0], 10) * 60000 + parseFloat(parts[1]) * 1000);
  }
  if (parts.length === 3) {
    return Math.round(parseInt(parts[0], 10) * 3600000 + parseInt(parts[1], 10) * 60000 + parseFloat(parts[2]) * 1000);
  }

  return 0;
}
