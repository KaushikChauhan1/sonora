import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Mic2,
  Sparkles,
  Compass,
  Disc3,
  ExternalLink,
} from 'lucide-react';
import { usePlayerStore } from '../../stores/usePlayerStore';
import {
  getActiveLineIndex,
  computeWordProgress,
  calculateScrollTop,
} from '../../services/lyrics/synchronizer';
import { getYTHandoffUrl } from '../../providers/handoff/youtubeMusicHandoff';
import { ViewMode } from '../../types';

interface LyricsStudioProps {
  onNavigateMode?: (mode: ViewMode) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxAlpha: number;
  life: number;
  maxLife: number;
  color: string;
}

export const LyricsStudio: React.FC<LyricsStudioProps> = ({ onNavigateMode }) => {
  const {
    currentTrack,
    positionSeconds,
    lyrics,
    isLyricsStudioOpen,
    setLyricsStudioOpen,
    seek,
  } = usePlayerStore();

  const [fontSize, setFontSize] = useState<number>(36);
  const [showRomanization, setShowRomanization] = useState<boolean>(true);
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const [isUserScrolling, setIsUserScrolling] = useState<boolean>(false);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const lineRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const userScrollTimeoutRef = useRef<number | null>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement | null>(null);

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

  // Particle Canvas Animation
  useEffect(() => {
    if (!isLyricsStudioOpen) return;
    const canvas = particleCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Particle colors: Champagne Gold (#D9BC91) and Soft Warm Cream (#E8DCC5)
    const colors = ['#D9BC91', '#E8DCC5', '#F6EBDD', 'rgba(217, 188, 145, 0.8)'];

    const spawnParticle = (targetY: number) => {
      const x = window.innerWidth * (0.15 + Math.random() * 0.7);
      const y = targetY + (Math.random() * 60 - 30);
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.3 - Math.random() * 0.5,
        size: 1 + Math.random() * 2.2,
        alpha: 0,
        maxAlpha: 0.25 + Math.random() * 0.45,
        life: 0,
        maxLife: 90 + Math.random() * 110,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Find active line viewport Y position
      let activeY = canvas.height * 0.45;
      const activeEl = lineRefs.current.get(activeLineIndex);
      if (activeEl) {
        const rect = activeEl.getBoundingClientRect();
        if (rect.top > 0 && rect.bottom < canvas.height) {
          activeY = rect.top + rect.height * 0.5;
        }
      }

      // Maintain ~35 active particles around active line
      if (particles.length < 35 && Math.random() < 0.4) {
        spawnParticle(activeY);
      }

      // Update and render particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;

        // Fade in then fade out
        if (p.life < p.maxLife * 0.2) {
          p.alpha = (p.life / (p.maxLife * 0.2)) * p.maxAlpha;
        } else if (p.life > p.maxLife * 0.7) {
          p.alpha = ((p.maxLife - p.life) / (p.maxLife * 0.3)) * p.maxAlpha;
        }

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isLyricsStudioOpen, activeLineIndex]);

  if (!isLyricsStudioOpen) return null;

  return (
    <div className="lyrics-studio-overlay">
      {/* Background Ambient Dark Mesh Bloom */}
      <div
        className="lyrics-studio-ambient-glow"
        style={{
          backgroundImage: `url(${currentTrack.artworkUrl})`,
        }}
      />

      {/* Restrained Champagne Glitter Particle Layer Canvas */}
      <canvas ref={particleCanvasRef} className="lyrics-particle-canvas" />

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

        {/* Center Mode Switching Pills */}
        <div className="lyrics-mode-switcher-pills">
          <button
            className="mode-pill-btn"
            onClick={() => {
              setLyricsStudioOpen(false);
              if (onNavigateMode) onNavigateMode('discover');
            }}
            title="Switch to Discover Mode (A)"
          >
            <Compass size={14} />
            <span>Discover</span>
          </button>
          <button
            className="mode-pill-btn"
            onClick={() => {
              setLyricsStudioOpen(false);
              if (onNavigateMode) onNavigateMode('player');
            }}
            title="Switch to Immersive Player (B)"
          >
            <Disc3 size={14} />
            <span>Player</span>
          </button>
          <button className="mode-pill-btn active lyrics-accent" title="Currently in Lyrics Focus Mode (C)">
            <Mic2 size={14} />
            <span>Lyrics Focus</span>
          </button>
        </div>

        {/* Toolbar Controls */}
        <div className="lyrics-controls-toolbar">
          {/* External YouTube Music Link */}
          <a
            href={getYTHandoffUrl(currentTrack.videoId)}
            target="_blank"
            rel="noopener noreferrer"
            className="ytm-handoff-pill hide-mobile"
            title="Open track on YouTube Music"
          >
            <ExternalLink size={12} />
            <span>YouTube Music</span>
          </a>

          {/* Font Size Adjusters */}
          <button
            className="studio-toggle-btn"
            onClick={() => setFontSize((s) => Math.max(24, s - 4))}
            title="Smaller Font"
          >
            A-
          </button>
          <button
            className="studio-toggle-btn"
            onClick={() => setFontSize((s) => Math.min(52, s + 4))}
            title="Larger Font"
          >
            A+
          </button>

          {/* Romanization Toggle */}
          <button
            className={`studio-toggle-btn ${showRomanization ? 'active' : ''}`}
            onClick={() => setShowRomanization(!showRomanization)}
            title="Toggle Romanization (Romaji)"
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
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--cream-bright)' }}>
              Looking for lyrics...
            </div>
            <p style={{ fontSize: 14, maxWidth: 380, color: 'var(--muted-cream)' }}>
              Searching LRCLIB and local database for synchronized word-by-word timing for <strong>{currentTrack.title}</strong>.
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
                    <span className="instrumental-label">
                      Instrumental
                    </span>
                    <div className="instrumental-dot" />
                    <div className="instrumental-dot" />
                    <div className="instrumental-dot" />
                  </div>
                ) : (
                  <>
                    <div
                      className="lyric-line-text font-lyrics"
                      style={{ fontSize: isActive ? fontSize : Math.max(22, fontSize * 0.72) }}
                    >
                      {/* Word-by-Word Highlighting with Letter-by-Letter Reveal */}
                      {line.parts && line.parts.length > 0 ? (
                        line.parts.map((part, pIdx) => {
                          const progress = computeWordProgress(part, currentTimeMs);
                          const isWordActive = progress.state === 'active';
                          const words = part.words;

                          if (isWordActive) {
                            // Calculate progressive character reveal within word duration
                            const totalChars = words.length;
                            const activeRatio = Math.max(0, Math.min(1, progress.progress));
                            const revealedCharsCount = Math.floor(activeRatio * totalChars);

                            return (
                              <span
                                key={pIdx}
                                className="lyric-word-span word-active"
                              >
                                {words.split('').map((char, cIdx) => {
                                  const isRevealed = cIdx <= revealedCharsCount;
                                  return (
                                    <span
                                      key={cIdx}
                                      className={`char-reveal ${isRevealed ? 'char-lit' : 'char-dim'}`}
                                    >
                                      {char}
                                    </span>
                                  );
                                })}
                              </span>
                            );
                          }

                          return (
                            <span
                              key={pIdx}
                              className={`lyric-word-span word-${progress.state}`}
                            >
                              {words}
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
        <div className="lyrics-autoscroll-badge glass-panel" onClick={resumeAutoScroll}>
          <Sparkles size={14} color="var(--champagne)" />
          <span>Auto-scroll paused • Tap to resume</span>
        </div>
      )}
    </div>
  );
};
