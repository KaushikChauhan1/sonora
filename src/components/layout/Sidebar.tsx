import React from 'react';
import {
  Compass,
  Search,
  Library,
  Mic2,
  Disc3,
  Settings,
  Plus,
  Music2,
  Radio,
} from 'lucide-react';
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
          <Music2 size={18} color="var(--champagne)" />
        </div>
        <div className="brand-text">SONORA</div>
        <span className="brand-badge">V3.0</span>
      </div>

      {/* Main Experience Modes */}
      <div className="sidebar-nav-group">
        <span className="sidebar-section-label">Experience</span>
        <button
          className={`nav-link ${currentView === 'discover' ? 'active' : ''}`}
          onClick={() => onSelectView('discover')}
          title="Mode A: Discover & Catalogue"
        >
          <Compass size={18} className="nav-icon" />
          <span className="nav-label">Discover</span>
        </button>

        <button
          className={`nav-link ${currentView === 'player' ? 'active' : ''}`}
          onClick={() => onSelectView('player')}
          title="Mode B: Cinematic Immersive Player"
        >
          <Disc3 size={18} className="nav-icon" />
          <span className="nav-label">Immersive Player</span>
        </button>

        <button
          className={`nav-link ${currentView === 'lyrics-studio' ? 'active' : ''}`}
          onClick={() => {
            onSelectView('lyrics-studio');
            setLyricsStudioOpen(true);
          }}
          title="Mode C: Synchronized Lyrics Focus"
        >
          <Mic2 size={18} className="nav-icon" />
          <span className="nav-label">Lyrics Focus</span>
        </button>
      </div>

      {/* Browse & Search */}
      <div className="sidebar-nav-group">
        <span className="sidebar-section-label">Browse</span>
        <button
          className={`nav-link ${currentView === 'search' ? 'active' : ''}`}
          onClick={() => onSelectView('search')}
        >
          <Search size={18} className="nav-icon" />
          <span className="nav-label">Search</span>
        </button>

        <button
          className={`nav-link ${currentView === 'library' ? 'active' : ''}`}
          onClick={() => onSelectView('library')}
        >
          <Library size={18} className="nav-icon" />
          <span className="nav-label">Library</span>
        </button>

        <button
          className={`nav-link ${currentView === 'settings' ? 'active' : ''}`}
          onClick={() => onSelectView('settings')}
        >
          <Settings size={18} className="nav-icon" />
          <span className="nav-label">Settings</span>
        </button>
      </div>

      {/* User Playlists */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px 8px 8px' }}>
        <span className="sidebar-section-label" style={{ padding: 0 }}>Playlists</span>
        <button
          onClick={onCreatePlaylist}
          style={{ color: 'var(--champagne)', padding: 4, borderRadius: 6 }}
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

      {/* Bound Account Footer Card */}
      <div className="sidebar-account-footer glass-panel">
        <div className="account-footer-left">
          <Radio size={14} className="accent-icon" />
          <div className="account-footer-meta">
            <span className="account-footer-name">@kaushik.thinks</span>
            <span className="account-footer-sub">257 tracks synced</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
