import React, { useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Mic2,
  ListMusic,
  Heart,
  ExternalLink,
} from 'lucide-react';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useQueueStore } from '../../stores/useQueueStore';
import { useLibraryStore } from '../../stores/useLibraryStore';
import { handoffToYouTubeMusic } from '../../providers/handoff/youtubeMusicHandoff';

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const DockedPlayerBar: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    positionSeconds,
    durationSeconds,
    bufferedSeconds,
    volume,
    isMuted,
    repeatMode,
    isShuffled,
    isLyricsStudioOpen,
    isQueueDrawerOpen,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    nextTrack,
    previousTrack,
    setLyricsStudioOpen,
    setQueueDrawerOpen,
  } = usePlayerStore();

  const queue = useQueueStore((s) => s.queue);
  const currentIndex = useQueueStore((s) => s.currentIndex);
  const { isLiked, toggleLike } = useLibraryStore();

  const scrubberRef = useRef<HTMLDivElement | null>(null);

  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrubberRef.current || durationSeconds <= 0) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    seek(ratio * durationSeconds);
  };

  const progressPercent = durationSeconds > 0 ? (positionSeconds / durationSeconds) * 100 : 0;
  const bufferedPercent = durationSeconds > 0 ? (bufferedSeconds / durationSeconds) * 100 : 0;
  const liked = isLiked(currentTrack.id);
  const upcomingCount = Math.max(0, queue.length - currentIndex - 1);

  return (
    <footer className="docked-player-bar">
      {/* Left Section: Track Info */}
      <div className="player-left-section">
        <div
          className="player-artwork-box"
          onClick={() => setLyricsStudioOpen(true)}
          title="Open Lyrics Studio"
        >
          <img
            src={currentTrack.artworkUrl}
            alt={currentTrack.title}
            className="player-artwork"
          />
        </div>

        <div className="player-track-meta">
          <div
            className="player-track-title"
            onClick={() => setLyricsStudioOpen(true)}
            title={currentTrack.title}
          >
            {currentTrack.title}
          </div>
          <div className="player-track-artist">{currentTrack.artist}</div>
        </div>

        <button
          className={`like-button ${liked ? 'liked' : ''}`}
          onClick={() => toggleLike(currentTrack.id)}
          title={liked ? 'Remove from Liked' : 'Save to Liked'}
        >
          <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Center Section: Controls & Scrubber */}
      <div className="player-center-section">
        <div className="player-transport-controls">
          <button
            className={`transport-btn shuffle ${isShuffled ? 'active' : ''}`}
            onClick={toggleShuffle}
            title={isShuffled ? 'Disable Shuffle' : 'Enable Shuffle'}
          >
            <Shuffle size={16} />
          </button>

          <button
            className="transport-btn prev"
            onClick={previousTrack}
            title="Previous Track"
          >
            <SkipBack size={18} />
          </button>

          <button
            className="play-pause-master-btn"
            onClick={togglePlay}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause size={20} fill="currentColor" />
            ) : (
              <Play size={20} fill="currentColor" style={{ marginLeft: 2 }} />
            )}
          </button>

          <button
            className="transport-btn next"
            onClick={nextTrack}
            title="Next Track"
          >
            <SkipForward size={18} />
          </button>

          <button
            className={`transport-btn repeat ${repeatMode !== 'off' ? 'active' : ''}`}
            onClick={cycleRepeat}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
          </button>
        </div>

        {/* Scrubber Progress Bar */}
        <div className="player-timeline-box">
          <span className="timeline-timestamp">{formatTime(positionSeconds)}</span>
          <div
            ref={scrubberRef}
            className="scrubber-track-container"
            onClick={handleScrubberClick}
          >
            <div className="scrubber-track-bar">
              <div
                className="scrubber-buffered-fill"
                style={{ width: `${Math.min(100, bufferedPercent)}%` }}
              />
              <div
                className="scrubber-progress-fill"
                style={{ width: `${Math.min(100, progressPercent)}%` }}
              />
            </div>
          </div>
          <span className="timeline-timestamp">{formatTime(durationSeconds)}</span>
        </div>
      </div>

      {/* Right Section: Volume & Utilities */}
      <div className="player-right-section">
        {/* YouTube Music Handoff */}
        <button
          className="ytm-handoff-btn"
          onClick={() => handoffToYouTubeMusic(currentTrack)}
          title="Open in YouTube Music"
        >
          <span>Open in YTM</span>
          <ExternalLink size={12} />
        </button>

        {/* Volume Slider */}
        <div className="volume-control-box">
          <button className="utility-btn" onClick={toggleMute} title={isMuted ? 'Unmute' : 'Mute'}>
            {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="volume-slider"
            title={`Volume: ${isMuted ? 0 : volume}%`}
          />
        </div>

        {/* Lyrics Studio Drawer Trigger */}
        <button
          className={`utility-btn ${isLyricsStudioOpen ? 'active' : ''}`}
          onClick={() => setLyricsStudioOpen(!isLyricsStudioOpen)}
          title="Lyrics Studio"
        >
          <Mic2 size={18} />
        </button>

        {/* Queue Drawer Trigger */}
        <button
          className={`utility-btn ${isQueueDrawerOpen ? 'active' : ''}`}
          onClick={() => setQueueDrawerOpen(!isQueueDrawerOpen)}
          title="Up Next Queue"
        >
          <ListMusic size={18} />
          {upcomingCount > 0 && <span className="badge-count">{upcomingCount}</span>}
        </button>
      </div>
    </footer>
  );
};
