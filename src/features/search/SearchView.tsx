import React, { useState } from 'react';
import { Play, Plus, Heart, Search as SearchIcon, Disc3 } from 'lucide-react';
import { FEATURED_TRACKS, FEATURED_ALBUMS } from '../../services/metadata/catalogue';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useQueueStore } from '../../stores/useQueueStore';
import { useLibraryStore } from '../../stores/useLibraryStore';

interface SearchViewProps {
  initialQuery?: string;
}

export const SearchView: React.FC<SearchViewProps> = ({ initialQuery = '' }) => {
  const [filterType, setFilterType] = useState<'all' | 'tracks' | 'albums'>('all');
  const [query, setQuery] = useState(initialQuery);

  const playTrack = usePlayerStore((s) => s.playTrack);
  const addToQueue = useQueueStore((s) => s.addToQueue);
  const { searchHistory, addSearchTerm, clearSearchHistory, isLiked, toggleLike } = useLibraryStore();

  const handleSearchClick = (term: string) => {
    setQuery(term);
    addSearchTerm(term);
  };

  const cleanQ = query.trim().toLowerCase();

  const matchingTracks = cleanQ
    ? FEATURED_TRACKS.filter(
        (t) =>
          t.title.toLowerCase().includes(cleanQ) ||
          t.artist.toLowerCase().includes(cleanQ) ||
          t.genre?.toLowerCase().includes(cleanQ) ||
          t.album?.toLowerCase().includes(cleanQ)
      )
    : FEATURED_TRACKS;

  const matchingAlbums = cleanQ
    ? FEATURED_ALBUMS.filter(
        (a) => a.title.toLowerCase().includes(cleanQ) || a.artist.toLowerCase().includes(cleanQ)
      )
    : FEATURED_ALBUMS;

  return (
    <div className="view-scroll-container">
      {/* Header */}
      <div style={{ margin: '24px 0 16px 0' }}>
        <h1 className="editorial-hero-title">Search</h1>
        <p className="editorial-tagline">
          Find songs, albums, and artists across YouTube Music catalogue.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="genre-pills-row">
        {(['all', 'tracks', 'albums'] as const).map((t) => (
          <button
            key={t}
            className={`genre-pill ${filterType === t ? 'active' : ''}`}
            onClick={() => setFilterType(t)}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Recent Searches */}
      {searchHistory.length > 0 && !cleanQ && (
        <div style={{ marginBottom: 28, background: 'var(--surface)', padding: 16, borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>RECENT SEARCHES</span>
            <button onClick={clearSearchHistory} style={{ fontSize: 12, color: 'var(--accent)' }}>
              Clear
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {searchHistory.map((term, i) => (
              <button
                key={i}
                className="genre-pill"
                onClick={() => handleSearchClick(term)}
              >
                <SearchIcon size={12} style={{ marginRight: 6 }} />
                <span>{term}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Track Results */}
      {(filterType === 'all' || filterType === 'tracks') && (
        <section style={{ marginBottom: 40 }}>
          <div className="section-header">
            <h2 className="section-title">
              {cleanQ ? `Tracks matching "${query}"` : 'Recommended Tracks'}
            </h2>
            <span className="section-subtitle">{matchingTracks.length} found</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {matchingTracks.map((track) => {
              const liked = isLiked(track.id);
              return (
                <div
                  key={track.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 12,
                    background: 'var(--surface)',
                    border: '1px solid var(--border-subtle)',
                    boxShadow: 'var(--shadow-subtle)',
                    transition: 'all 150ms var(--ease-spring)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 8,
                        overflow: 'hidden',
                        position: 'relative',
                        flexShrink: 0,
                        cursor: 'pointer',
                      }}
                      onClick={() => playTrack(track)}
                    >
                      <img src={track.artworkUrl} alt={track.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <span
                        style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', cursor: 'pointer' }}
                        onClick={() => playTrack(track)}
                      >
                        {track.title}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {track.artist} {track.album && `• ${track.album}`}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {Math.floor(track.durationSeconds / 60)}:{Math.floor(track.durationSeconds % 60).toString().padStart(2, '0')}
                    </span>

                    <button
                      className={`like-button ${liked ? 'liked' : ''}`}
                      onClick={() => toggleLike(track.id)}
                      title={liked ? 'Unlike' : 'Like'}
                    >
                      <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                    </button>

                    <button
                      className="utility-btn"
                      onClick={() => addToQueue(track)}
                      title="Add to Up Next Queue"
                    >
                      <Plus size={16} />
                    </button>

                    <button
                      className="play-pause-master-btn"
                      style={{ width: 34, height: 34 }}
                      onClick={() => playTrack(track)}
                      title="Play"
                    >
                      <Play size={14} fill="currentColor" style={{ marginLeft: 2 }} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Album Results */}
      {(filterType === 'all' || filterType === 'albums') && matchingAlbums.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <div className="section-header">
            <h2 className="section-title">Albums</h2>
            <span className="section-subtitle">{matchingAlbums.length} albums</span>
          </div>

          <div className="bento-grid">
            {matchingAlbums.map((album) => (
              <div
                key={album.id}
                className="track-card"
                onClick={() => {
                  if (album.tracks.length > 0) {
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
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
