import React, { useState } from 'react';
import { Heart, Play, Plus, Trash2, Clock } from 'lucide-react';
import { Track } from '../../types';
import { FEATURED_TRACKS } from '../../services/metadata/catalogue';
import { useLibraryStore } from '../../stores/useLibraryStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useQueueStore } from '../../stores/useQueueStore';

export const LibraryView: React.FC = () => {
  const [tab, setTab] = useState<'liked' | 'playlists' | 'history'>('liked');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');

  const {
    likedTrackIds,
    playlists,
    recentTracks,
    toggleLike,
    createPlaylist,
    deletePlaylist,
  } = useLibraryStore();

  const playTrack = usePlayerStore((s) => s.playTrack);
  const { setQueue } = useQueueStore();

  // Find full Track objects for liked IDs
  const likedTracks: Track[] = likedTrackIds
    .map((id) => FEATURED_TRACKS.find((t) => t.id === id))
    .filter((t): t is Track => t !== undefined);

  const handlePlayLikedAll = () => {
    if (likedTracks.length > 0) {
      setQueue(likedTracks, 0);
      playTrack(likedTracks[0]);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      createPlaylist(newTitle.trim(), newDesc.trim());
      setNewTitle('');
      setNewDesc('');
      setShowCreateModal(false);
    }
  };

  return (
    <div className="view-scroll-container">
      {/* Header */}
      <div style={{ margin: '24px 0 16px 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <h1 className="editorial-hero-title">Your Library</h1>
          <p className="editorial-tagline">
            Personal collection, liked songs, custom playlists, and listening history.
          </p>
        </div>

        {tab === 'playlists' && (
          <button
            className="play-pause-master-btn"
            style={{ width: 'auto', height: 38, padding: '0 16px', borderRadius: 19, gap: 6, display: 'inline-flex' }}
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={16} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>New Playlist</span>
          </button>
        )}
      </div>

      {/* Segmented Navigation */}
      <div className="genre-pills-row">
        <button
          className={`genre-pill ${tab === 'liked' ? 'active' : ''}`}
          onClick={() => setTab('liked')}
        >
          Liked Songs ({likedTracks.length})
        </button>
        <button
          className={`genre-pill ${tab === 'playlists' ? 'active' : ''}`}
          onClick={() => setTab('playlists')}
        >
          Playlists ({playlists.length})
        </button>
        <button
          className={`genre-pill ${tab === 'history' ? 'active' : ''}`}
          onClick={() => setTab('history')}
        >
          Recent History ({recentTracks.length})
        </button>
      </div>

      {/* LIKED SONGS VIEW */}
      {tab === 'liked' && (
        <section style={{ marginBottom: 40 }}>
          {likedTracks.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Heart size={44} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                No liked songs yet
              </div>
              <p style={{ fontSize: 13, marginTop: 4 }}>
                Tap the heart on any track to save it to your personal favorites collection.
              </p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '20px 0' }}>
                <button
                  className="play-pause-master-btn"
                  style={{ width: 'auto', height: 42, padding: '0 20px', borderRadius: 21, gap: 8, display: 'inline-flex' }}
                  onClick={handlePlayLikedAll}
                >
                  <Play size={18} fill="currentColor" />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>Play All Liked</span>
                </button>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {likedTracks.length} tracks saved
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {likedTracks.map((track, i) => (
                  <div
                    key={track.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 12,
                      background: 'var(--surface)',
                      border: '1px solid var(--border-subtle)',
                      boxShadow: 'var(--shadow-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 20 }}>
                        {i + 1}
                      </span>
                      <img
                        src={track.artworkUrl}
                        alt={track.title}
                        style={{ width: 42, height: 42, borderRadius: 8, objectFit: 'cover', cursor: 'pointer' }}
                        onClick={() => {
                          setQueue(likedTracks, i);
                          playTrack(track);
                        }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <span
                          style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', cursor: 'pointer' }}
                          onClick={() => {
                            setQueue(likedTracks, i);
                            playTrack(track);
                          }}
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
                        className="like-button liked"
                        onClick={() => toggleLike(track.id)}
                        title="Remove from Liked"
                      >
                        <Heart size={16} fill="currentColor" />
                      </button>
                      <button
                        className="play-pause-master-btn"
                        style={{ width: 32, height: 32 }}
                        onClick={() => {
                          setQueue(likedTracks, i);
                          playTrack(track);
                        }}
                        title="Play"
                      >
                        <Play size={13} fill="currentColor" style={{ marginLeft: 2 }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* PLAYLISTS VIEW */}
      {tab === 'playlists' && (
        <section style={{ marginBottom: 40 }}>
          <div className="bento-grid">
            {playlists.map((playlist) => (
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
                  <img
                    src={playlist.artworkUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80'}
                    alt={playlist.title}
                    className="track-card-artwork"
                  />
                  <div className="track-card-play-overlay">
                    <div className="play-circle-btn">
                      <Play size={18} fill="currentColor" style={{ marginLeft: 2 }} />
                    </div>
                  </div>
                </div>

                <div className="track-card-info">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div className="track-card-title">{playlist.title}</div>
                    {playlist.isCustom && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePlaylist(playlist.id);
                        }}
                        style={{ color: 'var(--text-muted)', padding: 2 }}
                        title="Delete Playlist"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  <div className="track-card-artist">
                    {playlist.trackCount || playlist.tracks.length} tracks
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* HISTORY VIEW */}
      {tab === 'history' && (
        <section style={{ marginBottom: 40 }}>
          {recentTracks.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Clock size={44} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                No play history yet
              </div>
              <p style={{ fontSize: 13, marginTop: 4 }}>
                Songs you play in SONORA will be recorded here for quick replay.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {recentTracks.map((track, i) => (
                <div
                  key={`${track.id}-${i}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: 'var(--surface)',
                    border: '1px solid var(--border-subtle)',
                    boxShadow: 'var(--shadow-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <img
                      src={track.artworkUrl}
                      alt={track.title}
                      style={{ width: 42, height: 42, borderRadius: 8, objectFit: 'cover', cursor: 'pointer' }}
                      onClick={() => playTrack(track)}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span
                        style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', cursor: 'pointer' }}
                        onClick={() => playTrack(track)}
                      >
                        {track.title}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {track.artist}
                      </span>
                    </div>
                  </div>

                  <button
                    className="play-pause-master-btn"
                    style={{ width: 32, height: 32 }}
                    onClick={() => playTrack(track)}
                    title="Play"
                  >
                    <Play size={13} fill="currentColor" style={{ marginLeft: 2 }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* CREATE PLAYLIST MODAL */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(36, 35, 33, 0.45)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 110,
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 20,
              padding: 28,
              width: 400,
              maxWidth: '90vw',
              boxShadow: 'var(--shadow-elevated)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontFamily: 'var(--font-editorial)', fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
              Create New Playlist
            </h2>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Playlist Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Late Night Synthwave"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{
                    width: '100%',
                    height: 40,
                    padding: '0 12px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: 'var(--surface-secondary)',
                    fontSize: 14,
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Description (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Driving under the neon highway lights"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  style={{
                    width: '100%',
                    height: 40,
                    padding: '0 12px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: 'var(--surface-secondary)',
                    fontSize: 14,
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="play-pause-master-btn"
                  style={{ width: 'auto', height: 38, padding: '0 18px', borderRadius: 10, fontSize: 13, fontWeight: 600 }}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
