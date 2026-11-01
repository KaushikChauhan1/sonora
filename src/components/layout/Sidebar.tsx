import React from 'react';
import { Compass, Search, Library, Mic2, Plus, Music2 } from 'lucide-react';
import { ViewMode } from '../../types';
import { useLibraryStore } from '../../stores/useLibraryStore';
import { usePlayerStore } from '../../stores/usePlayerStore';

interface SidebarProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  onCreatePlaylist: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  onCreatePlaylist,
}) => {
  const playlists = useLibraryStore((s) => s.playlists);
  const setLyricsStudioOpen = usePlayerStore((s) => s.setLyricsStudioOpen);

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="brand-header">
        <div className="brand-logo-mark">
          <Music2 size={18} color="var(--accent)" />
        </div>
        <div className="brand-text">SONORA</div>
        <span className="brand-badge">BETA</span>
      </div>

      {/* Main Navigation */}
      <div className="sidebar-nav-group">
        <span className="sidebar-section-label">Discover</span>
        <button
          className={`nav-link ${currentView === 'discover' ? 'active' : ''}`}
          onClick={() => onSelectView('discover')}
        >
          <Compass size={18} className="nav-icon" />
          <span className="nav-label">Explore</span>
        </button>

        <button
          className={`nav-link ${currentView === 'search' ? 'active' : ''}`}
          onClick={() => onSelectView('search')}
        >
          <Search size={18} className="nav-icon" />
          <span className="nav-label">Search</span>
        </button>

        <button
          className={`nav-link ${currentView === 'lyrics-studio' ? 'active' : ''}`}
          onClick={() => {
            onSelectView('lyrics-studio');
            setLyricsStudioOpen(true);
          }}
        >
          <Mic2 size={18} className="nav-icon" />
          <span className="nav-label">Lyrics Studio</span>
        </button>
      </div>

      {/* Library Section */}
      <div className="sidebar-nav-group">
        <span className="sidebar-section-label">My Collection</span>
        <button
          className={`nav-link ${currentView === 'library' ? 'active' : ''}`}
          onClick={() => onSelectView('library')}
        >
          <Library size={18} className="nav-icon" />
          <span className="nav-label">Library</span>
        </button>
      </div>

      {/* User Playlists */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px 8px 8px' }}>
        <span className="sidebar-section-label" style={{ padding: 0 }}>Playlists</span>
        <button
          onClick={onCreatePlaylist}
          style={{ color: 'var(--accent)', padding: 4, borderRadius: 6 }}
          title="Create Playlist"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="sidebar-playlists-scroll">
        {playlists.map((playlist) => (
          <button
            key={playlist.id}
            className="playlist-nav-item"
            onClick={() => onSelectView('library')}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {playlist.title}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {playlist.trackCount || playlist.tracks.length}
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
};
