import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Volume2,
  VolumeX,
  Mic2,
  Compass,
  ExternalLink,
  ListMusic,
} from 'lucide-react';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useLibraryStore } from '../../stores/useLibraryStore';
import { getYTHandoffUrl } from '../../providers/handoff/youtubeMusicHandoff';
import { ViewMode } from '../../types';

interface ImmersivePlayerProps {
  onNavigateMode: (mode: ViewMode) => void;
}

export const ImmersivePlayer: React.FC<ImmersivePlayerProps> = ({ onNavigateMode }) => {
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

  const { isLiked, toggleLike } = useLibraryStore();
  const liked = isLiked(currentTrack.id);

  const [isHoveringScrubber, setIsHoveringScrubber] = useState(false);
  const [hoverPosition, setHoverPosition] = useState(0);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = durationSeconds > 0 ? (positionSeconds / durationSeconds) * 100 : 0;
  const bufferedPercent = durationSeconds > 0 ? (bufferedSeconds / durationSeconds) * 100 : 0;

  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    seek(ratio * durationSeconds);
  };

  const handleScrubberMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    setHoverPosition(ratio * durationSeconds);
  };

  return (
    <div className="immersive-player-view">
      {/* Background artwork bloom */}
      <div
        className="immersive-ambient-bloom"
        style={{
          backgroundImage: `url(${currentTrack.artworkUrl})`,
        }}
      />

      {/* Top Bar Navigation inside Player */}
      <div className="immersive-top-actions">
        <div className="immersive-mode-pills">
          <button
            className="mode-pill-btn"
            onClick={() => onNavigateMode('discover')}
            title="Switch to Discover Mode (A)"
          >
            <Compass size={15} />
            <span>Discover</span>
          </button>
          <button className="mode-pill-btn active" title="Currently in Immersive Player Mode (B)">
            <span>Immersive Player</span>
          </button>
          <button
            className="mode-pill-btn lyrics-accent"
            onClick={() => {
              setLyricsStudioOpen(true);
              onNavigateMode('lyrics-studio');
            }}
            title="Switch to Lyrics Focus Mode (C)"
          >
            <Mic2 size={15} />
            <span>Lyrics Focus</span>
          </button>
        </div>

        <div className="immersive-top-right">
          <a
            href={getYTHandoffUrl(currentTrack.videoId)}
            target="_blank"
            rel="noopener noreferrer"
            className="ytm-handoff-pill"
            title="Open track directly in YouTube Music"
          >
            <ExternalLink size={13} />
            <span>YouTube Music</span>
          </a>
          <button
            className="glass-icon-btn"
            onClick={() => setQueueDrawerOpen(true)}
            title="View Queue"
          >
            <ListMusic size={18} />
          </button>
        </div>
      </div>

      {/* Center Cinematic Stage */}
      <div className="immersive-center-stage">
        {/* Artwork Presentation with Vinyl Depth */}
        <div className="immersive-art-container">
          {/* Animated Vinyl Disc */}
          <div
            className={`immersive-vinyl-disc ${isPlaying ? 'spinning' : ''}`}
            aria-hidden="true"
          >
            <div className="vinyl-center-label">
              <img src={currentTrack.artworkUrl} alt="" className="vinyl-label-img" />
            </div>
          </div>

          {/* Main Album Artwork */}
          <div className="immersive-album-cover-card glass-panel">
            <img
              src={currentTrack.artworkUrl}
              alt={currentTrack.title}
              className="immersive-album-cover-img"
            />
            <div className="artwork-glass-reflection" />
          </div>
        </div>

        {/* Track Metadata */}
        <div className="immersive-meta-block">
          <div className="immersive-title-row">
            <h1 className="immersive-track-title">{currentTrack.title}</h1>
            <button
              className={`immersive-like-btn ${liked ? 'liked' : ''}`}
              onClick={() => toggleLike(currentTrack.id)}
              title={liked ? 'Unlike track' : 'Add to liked tracks'}
            >
              <Heart size={24} fill={liked ? '#E05353' : 'none'} />
            </button>
          </div>

          <div className="immersive-artist-name">{currentTrack.artist}</div>

          {currentTrack.album && (
            <div className="immersive-album-name">
              <span>Album:</span> <em>{currentTrack.album}</em>
            </div>
          )}
        </div>

        {/* Scrubber & Timeline */}
        <div className="immersive-scrubber-wrapper">
          <div
            className="immersive-scrubber-bar"
            onClick={handleScrubberClick}
            onMouseMove={handleScrubberMouseMove}
            onMouseEnter={() => setIsHoveringScrubber(true)}
            onMouseLeave={() => setIsHoveringScrubber(false)}
          >
            <div
              className="immersive-buffered-fill"
              style={{ width: `${bufferedPercent}%` }}
            />
            <div
              className="immersive-progress-fill"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="immersive-scrubber-thumb" />
            </div>

            {isHoveringScrubber && (
              <div
                className="scrubber-hover-preview"
                style={{ left: `${(hoverPosition / durationSeconds) * 100}%` }}
              >
                {formatTime(hoverPosition)}
              </div>
            )}
          </div>

          <div className="immersive-timestamps">
            <span>{formatTime(positionSeconds)}</span>
            <span>{formatTime(durationSeconds)}</span>
          </div>
        </div>

        {/* Transport Controls */}
        <div className="immersive-transport-row">
          <button
            className={`immersive-ctrl-btn ${isShuffled ? 'active' : ''}`}
            onClick={toggleShuffle}
            title={isShuffled ? 'Disable Shuffle' : 'Enable Shuffle'}
          >
            <Shuffle size={20} />
          </button>

          <button
            className="immersive-ctrl-btn"
            onClick={previousTrack}
            title="Previous Track"
          >
            <SkipBack size={26} />
          </button>

          <button
            className="immersive-master-play-btn"
            onClick={togglePlay}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={30} fill="currentColor" /> : <Play size={30} fill="currentColor" style={{ marginLeft: 3 }} />}
          </button>

          <button
            className="immersive-ctrl-btn"
            onClick={nextTrack}
            title="Next Track"
          >
            <SkipForward size={26} />
          </button>

          <button
            className={`immersive-ctrl-btn ${repeatMode !== 'off' ? 'active' : ''}`}
            onClick={cycleRepeat}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
          </button>
        </div>

        {/* Bottom Auxiliary Controls: Volume & Lyrics CTA */}
        <div className="immersive-bottom-aux">
          <div className="immersive-volume-box">
            <button className="vol-icon-btn" onClick={toggleMute} title="Toggle Mute">
              {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="immersive-volume-slider"
              title={`Volume: ${isMuted ? 0 : volume}%`}
            />
          </div>

          <button
            className="immersive-lyrics-studio-cta"
            onClick={() => {
              setLyricsStudioOpen(true);
              onNavigateMode('lyrics-studio');
            }}
          >
            <Mic2 size={16} />
            <span>Open Lyrics Focus</span>
          </button>
        </div>
      </div>
    </div>
  );
};
