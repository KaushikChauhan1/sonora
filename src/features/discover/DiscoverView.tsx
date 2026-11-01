import React, { useState } from 'react';
import { Play, Sparkles, Disc3 } from 'lucide-react';
import { Track } from '../../types';
import {
  FEATURED_TRACKS,
  FEATURED_ALBUMS,
  EDITORIAL_PLAYLISTS,
} from '../../services/metadata/catalogue';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useQueueStore } from '../../stores/useQueueStore';
import { useLibraryStore } from '../../stores/useLibraryStore';

export const DiscoverView: React.FC = () => {
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const playTrack = usePlayerStore((s) => s.playTrack);
  const setQueue = useQueueStore((s) => s.setQueue);
  const recentTracks = useLibraryStore((s) => s.recentTracks);

  const heroTrack = FEATURED_TRACKS[0]; // Blinding Lights

  const genres = ['All', 'Synthwave', 'Indie Pop', 'Dream Pop', 'Disco / Funk', 'Nu-Disco', 'Chillwave'];

  const filteredTracks = selectedGenre === 'All'
    ? FEATURED_TRACKS
    : FEATURED_TRACKS.filter((t) => t.genre?.toLowerCase().includes(selectedGenre.toLowerCase()));

  const handlePlayTrack = (track: Track, index: number) => {
    setQueue(filteredTracks, index);
    playTrack(track);
  };

  return (
    <div className="view-scroll-container">
      {/* Editorial Hero Banner */}
      <div className="editorial-hero-banner">
        <div className="hero-banner-content">
          <div className="hero-banner-badge">
            <Sparkles size={13} />
            <span>EDITORIAL SPOTLIGHT</span>
          </div>
          <h1 className="editorial-hero-title">Music deserves a better interface.</h1>
          <p className="editorial-tagline" style={{ marginBottom: 20 }}>
            Experience YouTube Music through independent light-glass design, millisecond word-by-word
            lyrics synchronization, and cinematic album art immersion.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              className="play-pause-master-btn"
              style={{ width: 'auto', height: 44, padding: '0 20px', borderRadius: 22, gap: 8, display: 'inline-flex' }}
              onClick={() => handlePlayTrack(heroTrack, 0)}
            >
              <Play size={18} fill="currentColor" />
              <span style={{ fontWeight: 600, fontSize: 13 }}>Play Spotlight</span>
            </button>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                {heroTrack.title}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {heroTrack.artist} • {heroTrack.album}
              </span>
            </div>
          </div>
        </div>

        <img
          src={heroTrack.artworkUrl}
          alt={heroTrack.title}
          className="hero-banner-artwork"
        />
      </div>

      {/* Mood & Genre Filters */}
      <div className="genre-pills-row">
        {genres.map((g) => (
          <button
            key={g}
            className={`genre-pill ${selectedGenre === g ? 'active' : ''}`}
            onClick={() => setSelectedGenre(g)}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Recently Played Shelf */}
      {recentTracks.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <div className="section-header">
            <div>
              <h2 className="section-title">Jump Back In</h2>
              <span className="section-subtitle">Recently enjoyed in your Sonora session</span>
            </div>
          </div>

          <div className="horizontal-shelf">
            {recentTracks.slice(0, 8).map((track, idx) => (
              <div
                key={`${track.id}-${idx}`}
                className="shelf-item track-card"
                onClick={() => playTrack(track)}
              >
                <div className="track-card-artwork-box">
                  <img src={track.artworkUrl} alt={track.title} className="track-card-artwork" />
                  <div className="track-card-play-overlay">
                    <div className="play-circle-btn">
                      <Play size={18} fill="currentColor" style={{ marginLeft: 2 }} />
                    </div>
                  </div>
                </div>
                <div className="track-card-info">
                  <div className="track-card-title">{track.title}</div>
                  <div className="track-card-artist">{track.artist}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Trending Tracks Bento Grid */}
      <section style={{ marginBottom: 40 }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">Trending Releases</h2>
            <span className="section-subtitle">Popular tracks with full lyrics synchronization</span>
          </div>
        </div>

        <div className="bento-grid">
          {filteredTracks.map((track, idx) => (
            <div
              key={track.id}
              className="track-card"
              onClick={() => handlePlayTrack(track, idx)}
            >
              <div className="track-card-artwork-box">
                <img src={track.artworkUrl} alt={track.title} className="track-card-artwork" />
                <div className="track-card-play-overlay">
                  <div className="play-circle-btn">
                    <Play size={18} fill="currentColor" style={{ marginLeft: 2 }} />
                  </div>
                </div>
              </div>

              <div className="track-card-info">
                <div className="track-card-title">{track.title}</div>
                <div className="track-card-artist">{track.artist}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>
                    {track.genre}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {Math.floor(track.durationSeconds / 60)}:{Math.floor(track.durationSeconds % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Albums Bento Grid */}
      <section style={{ marginBottom: 40 }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">Essential Albums</h2>
            <span className="section-subtitle">Full-length projects with master quality artwork</span>
          </div>
        </div>

        <div className="bento-grid">
          {FEATURED_ALBUMS.map((album) => (
            <div
              key={album.id}
              className="track-card"
              onClick={() => {
                if (album.tracks.length > 0) {
                  setQueue(album.tracks, 0);
                  playTrack(album.tracks[0]);
                }
              }}
            >
              <div className="track-card-artwork-box">
                <img src={album.artworkUrl} alt={album.title} className="track-card-artwork" />
                <div className="track-card-play-overlay">
                  <div className="play-circle-btn">
                    <Disc3 size={18} />
                  </div>
                </div>
              </div>
              <div className="track-card-info">
                <div className="track-card-title">{album.title}</div>
                <div className="track-card-artist">{album.artist} • {album.year}</div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {album.trackCount} tracks
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Curated Playlists */}
      <section style={{ marginBottom: 48 }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">Editorial Collections</h2>
            <span className="section-subtitle">Curated soundscapes for uninterrupted listening</span>
          </div>
        </div>

        <div className="bento-grid">
          {EDITORIAL_PLAYLISTS.map((playlist) => (
            <div
              key={playlist.id}
              className="track-card"
              onClick={() => {
                if (playlist.tracks.length > 0) {
                  setQueue(playlist.tracks, 0);
                  playTrack(playlist.tracks[0]);
                }
              }}
            >
              <div className="track-card-artwork-box">
                <img src={playlist.artworkUrl} alt={playlist.title} className="track-card-artwork" />
                <div className="track-card-play-overlay">
                  <div className="play-circle-btn">
                    <Play size={18} fill="currentColor" style={{ marginLeft: 2 }} />
                  </div>
                </div>
              </div>
              <div className="track-card-info">
                <div className="track-card-title">{playlist.title}</div>
                <div className="track-card-artist" style={{ whiteSpace: 'normal', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {playlist.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
