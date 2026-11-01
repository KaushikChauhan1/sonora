import React, { useEffect, useRef, useState } from 'react';
import { X, Mic2, Sparkles } from 'lucide-react';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { getActiveLineIndex, computeWordProgress, calculateScrollTop } from '../../services/lyrics/synchronizer';

export const LyricsStudio: React.FC = () => {
  const {
    currentTrack,
    positionSeconds,
    lyrics,
    isLyricsStudioOpen,
    setLyricsStudioOpen,
    seek,
  } = usePlayerStore();

  const [fontSize, setFontSize] = useState<number>(32);
  const [showRomanization, setShowRomanization] = useState<boolean>(true);
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const [isUserScrolling, setIsUserScrolling] = useState<boolean>(false);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const lineRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const userScrollTimeoutRef = useRef<number | null>(null);

  const currentTimeMs = Math.round(positionSeconds * 1000);
  const activeLineIndex = getActiveLineIndex(lyrics, currentTimeMs);

  // Auto-scroll effect
  useEffect(() => {
    if (!isLyricsStudioOpen || isUserScrolling || activeLineIndex < 0) return;

    const viewport = viewportRef.current;
    const activeEl = lineRefs.current.get(activeLineIndex);

    if (viewport && activeEl) {
      const targetTop = calculateScrollTop(activeEl, viewport, 0.38);
      viewport.scrollTo({
        top: targetTop,
        behavior: 'smooth',
      });
    }
  }, [activeLineIndex, isLyricsStudioOpen, isUserScrolling]);

  // User scroll detection
  const handleUserScroll = () => {
    setIsUserScrolling(true);
    if (userScrollTimeoutRef.current) clearTimeout(userScrollTimeoutRef.current);
    userScrollTimeoutRef.current = window.setTimeout(() => {
      setIsUserScrolling(false);
    }, 5000);
  };

  const resumeAutoScroll = () => {
    setIsUserScrolling(false);
    if (userScrollTimeoutRef.current) clearTimeout(userScrollTimeoutRef.current);
  };

  if (!isLyricsStudioOpen) return null;

  return (
    <div className="lyrics-studio-overlay">
      {/* Ambient Artwork Glow */}
      <div className="lyrics-studio-ambient-glow" />

      {/* Header Bar */}
      <header className="lyrics-studio-header">
        <div className="lyrics-header-track-info">
          <img
            src={currentTrack.artworkUrl}
            alt={currentTrack.title}
            className="lyrics-header-artwork"
          />
          <div className="lyrics-header-titles">
            <div className="lyrics-header-title">{currentTrack.title}</div>
            <div className="lyrics-header-artist">{currentTrack.artist}</div>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="lyrics-controls-toolbar">
          {/* Font Size Adjusters */}
          <button
            className="studio-toggle-btn"
            onClick={() => setFontSize((s) => Math.max(22, s - 4))}
            title="Smaller Font"
          >
            A-
          </button>
          <button
            className="studio-toggle-btn"
            onClick={() => setFontSize((s) => Math.min(46, s + 4))}
            title="Larger Font"
          >
            A+
          </button>

          {/* Romanization Toggle */}
          <button
            className={`studio-toggle-btn ${showRomanization ? 'active' : ''}`}
            onClick={() => setShowRomanization(!showRomanization)}
            title="Toggle Romanization"
          >
            Romaji
          </button>

          {/* Translation Toggle */}
          <button
            className={`studio-toggle-btn ${showTranslation ? 'active' : ''}`}
            onClick={() => setShowTranslation(!showTranslation)}
            title="Toggle Translation"
          >
            Translation
          </button>

          {/* Close Studio */}
          <button
            className="studio-close-btn"
            onClick={() => setLyricsStudioOpen(false)}
            title="Close Lyrics Studio (Esc)"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* Main Lyrics Stage */}
      <main
        ref={viewportRef}
        className="lyrics-stage-viewport"
        onWheel={handleUserScroll}
        onTouchMove={handleUserScroll}
      >
        {lyrics.length === 0 ? (
          <div className="lyrics-empty-state">
            <Mic2 className="lyrics-empty-icon" />
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
              Looking for lyrics...
            </div>
            <p style={{ fontSize: 13, maxWidth: 360 }}>
              Searching LRCLIB and local database for synchronized word-by-word timing for {currentTrack.title}.
            </p>
          </div>
        ) : (
          lyrics.map((line, index) => {
            const isActive = index === activeLineIndex;
            const isPast = index < activeLineIndex;
            const isUpcoming = index > activeLineIndex;

            return (
              <div
                key={index}
                ref={(el) => {
                  if (el) lineRefs.current.set(index, el);
                  else lineRefs.current.delete(index);
                }}
                className={`lyric-line-box ${isActive ? 'active-line' : ''} ${
                  isPast ? 'past-line' : ''
                } ${isUpcoming ? 'upcoming-line' : ''}`}
                onClick={() => seek(line.startTimeMs / 1000)}
                title="Click to jump playback here"
              >
                {line.isInstrumental ? (
                  <div className="instrumental-break-box">
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', marginRight: 6 }}>
                      Instrumental
                    </span>
                    <div className="instrumental-dot" />
                    <div className="instrumental-dot" />
                    <div className="instrumental-dot" />
                  </div>
                ) : (
                  <>
                    <div className="lyric-line-text" style={{ fontSize }}>
                      {/* Word-by-Word Highlighting where timing exists */}
                      {line.parts && line.parts.length > 0 ? (
                        line.parts.map((part, pIdx) => {
                          const progress = computeWordProgress(part, currentTimeMs);
                          return (
                            <span
                              key={pIdx}
                              className={`lyric-word-span word-${progress.state}`}
                            >
                              {part.words}
                            </span>
                          );
                        })
                      ) : (
                        <span>{line.words}</span>
                      )}
                    </div>

                    {/* Romanization Subtext */}
                    {showRomanization && line.romanization && (
                      <div className="lyric-romanization">{line.romanization}</div>
                    )}

                    {/* Translation Subtext */}
                    {showTranslation && line.translations && (
                      <div className="lyric-translation">
                        {Object.values(line.translations)[0]}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })
        )}
      </main>

      {/* User Scroll Pause Toast Indicator */}
      {isUserScrolling && (
        <div className="lyrics-autoscroll-badge" onClick={resumeAutoScroll}>
          <Sparkles size={14} color="var(--accent)" />
          <span>Auto-scroll paused • Tap to resume</span>
        </div>
      )}
    </div>
  );
};
