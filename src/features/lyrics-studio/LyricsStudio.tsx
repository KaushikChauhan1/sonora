import React, { useEffect, useRef, useState, useCallback } from 'react';
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

interface GlitterParticle {
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
  rotation: number;
  rotSpeed: number;
  type: 'sparkle' | 'dust';
}

const GOLDEN_PALETTE = [
  '#FFE6A3', // Bright Champagne Gold
  '#D9BC91', // Champagne Gold Core
  '#FFF6E5', // Warm Cream Shimmer
  '#E5C287', // Amber Gold
  'rgba(217, 188, 145, 0.95)',
];

export const LyricsStudio: React.FC<LyricsStudioProps> = ({ onNavigateMode }) => {
  const {
    currentTrack,
    positionSeconds,
    durationSeconds,
    lyrics,
    isPlaying,
    isLyricsStudioOpen,
    setLyricsStudioOpen,
    seek,
    syncOffsetMs,
    adjustSyncOffsetMs,
    setSyncOffsetMs,
  } = usePlayerStore();

  const [fontSize, setFontSize] = useState<number>(36);
  const [showRomanization, setShowRomanization] = useState<boolean>(true);
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const [isUserScrolling, setIsUserScrolling] = useState<boolean>(false);
  const [smoothTimeMs, setSmoothTimeMs] = useState<number>(Math.round(positionSeconds * 1000));

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const lineRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const charSpanRefs = useRef<Map<string, HTMLSpanElement>>(new Map());
  const userScrollTimeoutRef = useRef<number | null>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Playback clock anchoring for 60fps continuous time interpolation
  const lastKnownPosRef = useRef<number>(positionSeconds * 1000);
  const lastAnchorPerfRef = useRef<number>(performance.now());
  const lastFiredCharKeyRef = useRef<string>('');
  const particlesRef = useRef<GlitterParticle[]>([]);

  // Check reduced motion preference
  const isReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  // Global hotkeys for sync offset when lyrics studio is open ([ and ])
  useEffect(() => {
    if (!isLyricsStudioOpen) return;
    const handleSyncKeys = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === '[') {
        e.preventDefault();
        adjustSyncOffsetMs(-250);
      } else if (e.key === ']') {
        e.preventDefault();
        adjustSyncOffsetMs(250);
      } else if (e.key === '0' && (e.metaKey || e.ctrlKey || e.altKey)) {
        e.preventDefault();
        setSyncOffsetMs(0);
      }
    };
    window.addEventListener('keydown', handleSyncKeys);
    return () => window.removeEventListener('keydown', handleSyncKeys);
  }, [isLyricsStudioOpen, adjustSyncOffsetMs, setSyncOffsetMs]);

  // Sync anchor clock when positionSeconds updates from YouTube Embed player
  useEffect(() => {
    const newPosMs = positionSeconds * 1000;
    const diff = Math.abs(newPosMs - lastKnownPosRef.current);

    // If time jumped (seeking), immediately clear particles and reset anchor
    if (diff > 350) {
      particlesRef.current = [];
      lastFiredCharKeyRef.current = '';
    }

    lastKnownPosRef.current = newPosMs;
    lastAnchorPerfRef.current = performance.now();
    setSmoothTimeMs(Math.round(newPosMs));
  }, [positionSeconds]);

  // High-precision 60fps clock interpolation while playing
  useEffect(() => {
    if (!isLyricsStudioOpen) return;

    let rafId: number;
    let lastRenderedTime = 0;

    const tickClock = (now: number) => {
      if (isPlaying) {
        const elapsed = now - lastAnchorPerfRef.current;
        // Uncapped fluid progression driven by high-resolution animation frame
        const interpolated = Math.round(lastKnownPosRef.current + elapsed);
        const maxMs = durationSeconds > 0 ? durationSeconds * 1000 : Infinity;
        const clamped = Math.min(maxMs, interpolated);

        // Update state at ~30-60fps
        if (Math.abs(clamped - lastRenderedTime) >= 16) {
          lastRenderedTime = clamped;
          setSmoothTimeMs(clamped);
        }
      } else {
        setSmoothTimeMs(Math.round(lastKnownPosRef.current));
      }

      rafId = requestAnimationFrame(tickClock);
    };

    rafId = requestAnimationFrame(tickClock);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, isLyricsStudioOpen, durationSeconds]);

  // Calculate effective time including user-adjusted sync offset
  const effectiveTimeMs = Math.max(0, smoothTimeMs + syncOffsetMs);
  const activeLineIndex = getActiveLineIndex(lyrics, effectiveTimeMs);

  // Auto-scroll effect: smoothly track active line to 38% focus zone
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

  // User scroll detection (5-second pause toast)
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

  // Particle emission helper: bursts particles directly around the sung character/word bounds
  const emitScatteredParticles = useCallback((el: HTMLElement, count: number = 3) => {
    if (isReducedMotion || !isPlaying) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.top <= 0 || rect.bottom >= window.innerHeight) return;

    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x: rect.left + rect.width * (0.15 + Math.random() * 0.7),
        y: rect.top + rect.height * (0.35 + Math.random() * 0.35),
        vx: (Math.random() - 0.5) * 1.5,
        vy: -0.6 - Math.random() * 1.3,
        size: 1.0 + Math.random() * 1.6,
        alpha: 0,
        maxAlpha: 0.6 + Math.random() * 0.35,
        life: 0,
        maxLife: 26 + Math.floor(Math.random() * 18), // 400-700ms at 60fps
        color: GOLDEN_PALETTE[Math.floor(Math.random() * GOLDEN_PALETTE.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.12,
        type: Math.random() > 0.4 ? 'sparkle' : 'dust',
      });
    }

    // Keep particle array bounded for GPU efficiency
    if (particlesRef.current.length > 40) {
      particlesRef.current.splice(0, particlesRef.current.length - 40);
    }
  }, [isReducedMotion, isPlaying]);

  // Particle Canvas Render Loop
  useEffect(() => {
    if (!isLyricsStudioOpen) return;
    const canvas = particleCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!isReducedMotion) {
        const list = particlesRef.current;
        for (let i = list.length - 1; i >= 0; i--) {
          const p = list[i];
          p.life++;
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.96; // gentle air resistance
          p.vy = p.vy * 0.97 - 0.015; // upward float
          p.rotation += p.rotSpeed;

          // Natural fade-in and quick fade-out
          if (p.life < p.maxLife * 0.2) {
            p.alpha = (p.life / (p.maxLife * 0.2)) * p.maxAlpha;
          } else {
            p.alpha = Math.max(0, ((p.maxLife - p.life) / (p.maxLife * 0.8)) * p.maxAlpha);
          }

          if (p.life >= p.maxLife || p.alpha <= 0.01) {
            list.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.globalAlpha = p.alpha;

          if (p.type === 'sparkle') {
            // Draw delicate 4-point golden starlet
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.fillStyle = p.color;
            ctx.shadowColor = 'rgba(217, 188, 145, 0.65)';
            ctx.shadowBlur = 4;
            ctx.beginPath();
            const arm = p.size * 1.6;
            ctx.moveTo(0, -arm);
            ctx.quadraticCurveTo(0, 0, arm, 0);
            ctx.quadraticCurveTo(0, 0, 0, arm);
            ctx.quadraticCurveTo(0, 0, -arm, 0);
            ctx.quadraticCurveTo(0, 0, 0, -arm);
            ctx.fill();
          } else {
            // Draw soft golden dust circle
            ctx.fillStyle = p.color;
            ctx.shadowColor = 'rgba(217, 188, 145, 0.5)';
            ctx.shadowBlur = 3;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isLyricsStudioOpen, isReducedMotion]);

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

      {/* Synchronized Golden Glitter Scattering Canvas */}
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
          {/* Sync Offset Controls */}
          <div className="sync-offset-group" title="Adjust lyrics timing offset ([ and ] keys)">
            <button
              className="sync-step-btn"
              onClick={() => adjustSyncOffsetMs(-500)}
              title="Shift lyrics earlier (-0.5s)"
            >
              -0.5s
            </button>
            <button
              className="sync-step-btn"
              onClick={() => adjustSyncOffsetMs(-100)}
              title="Shift lyrics earlier (-0.1s)"
            >
              -0.1s
            </button>
            <button
              className={`sync-badge-btn ${syncOffsetMs !== 0 ? 'offset-active' : ''}`}
              onClick={() => setSyncOffsetMs(0)}
              title="Click to reset timing offset to 0s"
            >
              Sync {syncOffsetMs > 0 ? `+${(syncOffsetMs / 1000).toFixed(1)}s` : syncOffsetMs < 0 ? `${(syncOffsetMs / 1000).toFixed(1)}s` : '±0.0s'}
            </button>
            <button
              className="sync-step-btn"
              onClick={() => adjustSyncOffsetMs(100)}
              title="Shift lyrics later (+0.1s)"
            >
              +0.1s
            </button>
            <button
              className="sync-step-btn"
              onClick={() => adjustSyncOffsetMs(500)}
              title="Shift lyrics later (+0.5s)"
            >
              +0.5s
            </button>
          </div>

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
          lyrics.map((line, lineIndex) => {
            const isActiveLine = lineIndex === activeLineIndex;
            const isPastLine = lineIndex < activeLineIndex;
            const isUpcomingLine = lineIndex > activeLineIndex;

            return (
              <div
                key={lineIndex}
                ref={(el) => {
                  if (el) lineRefs.current.set(lineIndex, el);
                  else lineRefs.current.delete(lineIndex);
                }}
                className={`lyric-line-box ${isActiveLine ? 'active-line' : ''} ${
                  isPastLine ? 'past-line' : ''
                } ${isUpcomingLine ? 'upcoming-line' : ''}`}
                onClick={() => {
                  seek(line.startTimeMs / 1000);
                  particlesRef.current = [];
                  resumeAutoScroll();
                }}
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
                      style={{ fontSize: isActiveLine ? fontSize : Math.max(22, fontSize * 0.72) }}
                    >
                      {/* Word-by-Word Golden Shimmer & Letter Morphing */}
                      {line.parts && line.parts.length > 0 ? (
                        line.parts.map((part, pIdx) => {
                          const progress = computeWordProgress(part, effectiveTimeMs);
                          const isWordActive = progress.state === 'active';
                          const isWordPast = progress.state === 'past';
                          const words = part.words;

                          // Check if word is about to be sung within 280ms
                          const isMorphingIn = !isWordActive && !isWordPast &&
                            effectiveTimeMs >= part.startTimeMs - 280 &&
                            effectiveTimeMs < part.startTimeMs;

                          const wordClass = isWordActive
                            ? 'word-active'
                            : isWordPast
                            ? 'word-past'
                            : isMorphingIn
                            ? 'word-morphing'
                            : 'word-upcoming';

                          if (isWordActive) {
                            // Calculate exact active character progression within word
                            const totalChars = Math.max(1, words.length);
                            const activeRatio = Math.max(0, Math.min(1, progress.progress));
                            const currentSingingCharIdx = Math.min(
                              totalChars - 1,
                              Math.floor(activeRatio * totalChars)
                            );

                            // Trigger particle scattering burst when singing character changes
                            const charKey = `${lineIndex}-${pIdx}-${currentSingingCharIdx}`;
                            if (lastFiredCharKeyRef.current !== charKey) {
                              lastFiredCharKeyRef.current = charKey;
                              const charEl = charSpanRefs.current.get(charKey);
                              if (charEl) {
                                emitScatteredParticles(charEl, 3);
                              }
                            }

                            return (
                              <span
                                key={pIdx}
                                className={`lyric-word-span ${wordClass}`}
                              >
                                {words.split('').map((char, cIdx) => {
                                  const cKey = `${lineIndex}-${pIdx}-${cIdx}`;
                                  const isSinging = cIdx === currentSingingCharIdx;
                                  const isRevealed = cIdx < currentSingingCharIdx;

                                  const charStatusClass = isSinging
                                    ? 'char-singing'
                                    : isRevealed
                                    ? 'char-lit'
                                    : 'char-dim';

                                  return (
                                    <span
                                      key={cIdx}
                                      ref={(el) => {
                                        if (el) charSpanRefs.current.set(cKey, el);
                                        else charSpanRefs.current.delete(cKey);
                                      }}
                                      className={`char-reveal ${charStatusClass}`}
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
                              className={`lyric-word-span ${wordClass}`}
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
