import React from 'react';
import { X, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useQueueStore } from '../../stores/useQueueStore';

export const QueueDrawer: React.FC = () => {
  const {
    currentTrack,
    isQueueDrawerOpen,
    setQueueDrawerOpen,
    playTrack,
    isPlaying,
  } = usePlayerStore();

  const {
    queue,
    currentIndex,
    removeFromQueue,
    reorderQueue,
    clearQueue,
  } = useQueueStore();

  if (!isQueueDrawerOpen) return null;

  const upcomingTracks = queue.slice(currentIndex + 1);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={() => setQueueDrawerOpen(false)}
    >
      <div
        className="glass-panel"
        style={{
          width: 390,
          maxWidth: '85vw',
          height: '100%',
          background: 'rgba(22, 11, 13, 0.95)',
          backdropFilter: 'blur(36px) saturate(140%)',
          borderRadius: 0,
          borderLeft: '1px solid var(--glass-border)',
          boxShadow: 'var(--shadow-elevated)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 95,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            height: 68,
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--glass-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: 'var(--cream-bright)' }}>
              Up Next
            </span>
            <span style={{ fontSize: 12, color: 'var(--champagne)' }}>
              ({upcomingTracks.length})
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {upcomingTracks.length > 0 && (
              <button
                onClick={clearQueue}
                style={{ fontSize: 12, color: 'var(--champagne)', fontWeight: 600, padding: '4px 8px' }}
                title="Clear upcoming songs"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setQueueDrawerOpen(false)}
              className="studio-close-btn"
              style={{ width: 34, height: 34 }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Queue Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px' }}>
          {/* Currently Playing Card */}
          <div style={{ marginBottom: 24 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--champagne)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              NOW PLAYING
            </span>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginTop: 8,
                padding: 12,
                borderRadius: 'var(--radius-small)',
                background: 'rgba(55, 13, 22, 0.75)',
                border: '1px solid rgba(217, 188, 145, 0.25)',
                boxShadow: '0 0 16px var(--champagne-glow)',
              }}
            >
              <img
                src={currentTrack.artworkUrl}
                alt={currentTrack.title}
                style={{ width: 46, height: 46, borderRadius: 8, objectFit: 'cover' }}
              />
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--cream-bright)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentTrack.title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted-cream)' }}>
                  {currentTrack.artist}
                </div>
              </div>
              {isPlaying && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 2, paddingRight: 4 }}>
                  <div className="instrumental-dot" style={{ width: 4, height: 14, borderRadius: 2 }} />
                  <div className="instrumental-dot" style={{ width: 4, height: 20, borderRadius: 2 }} />
                  <div className="instrumental-dot" style={{ width: 4, height: 10, borderRadius: 2 }} />
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Section */}
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              UPCOMING TRACKS
            </span>

            {upcomingTracks.length === 0 ? (
              <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--muted-cream)', fontSize: 13 }}>
                Queue is empty. Select a song or album to queue upcoming music.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                {upcomingTracks.map((track, i) => {
                  const actualIndex = currentIndex + 1 + i;
                  return (
                    <div
                      key={`${track.id}-${i}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-small)',
                        background: 'rgba(33, 16, 20, 0.65)',
                        border: '1px solid var(--glass-border)',
                      }}
                    >
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0, cursor: 'pointer' }}
                        onClick={() => playTrack(track)}
                      >
                        <img
                          src={track.artworkUrl}
                          alt={track.title}
                          style={{ width: 38, height: 38, borderRadius: 6, objectFit: 'cover' }}
                        />
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--cream-bright)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {track.title}
                          </div>
                          <div style={{ fontSize: 11.5, color: 'var(--muted-cream)' }}>
                            {track.artist}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        {/* Move Up */}
                        {i > 0 && (
                          <button
                            onClick={() => reorderQueue(actualIndex, actualIndex - 1)}
                            style={{ padding: 5, color: 'var(--muted-cream)' }}
                            title="Move Up"
                          >
                            <ChevronUp size={15} />
                          </button>
                        )}

                        {/* Move Down */}
                        {i < upcomingTracks.length - 1 && (
                          <button
                            onClick={() => reorderQueue(actualIndex, actualIndex + 1)}
                            style={{ padding: 5, color: 'var(--muted-cream)' }}
                            title="Move Down"
                          >
                            <ChevronDown size={15} />
                          </button>
                        )}

                        {/* Remove */}
                        <button
                          onClick={() => removeFromQueue(actualIndex)}
                          style={{ padding: 5, color: 'var(--text-muted)', marginLeft: 4 }}
                          title="Remove from queue"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
