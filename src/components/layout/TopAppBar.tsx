import React, { useState, useEffect } from 'react';
import { Search, X, Radio, Compass, Disc3, Mic2 } from 'lucide-react';
import { ViewMode } from '../../types';
import { useLibraryStore } from '../../stores/useLibraryStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { checkBridgeStatus, connectYtmSession } from '../../services/metadata/ytmBridgeService';

interface TopAppBarProps {
  currentView: ViewMode;
  onSearch: (query: string) => void;
  onNavigate: (view: ViewMode) => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({ currentView, onSearch, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [bridgeConnected, setBridgeConnected] = useState<boolean>(false);
  const [showConnectModal, setShowConnectModal] = useState<boolean>(false);
  const [cookieInput, setCookieInput] = useState<string>('');
  const [connecting, setConnecting] = useState<boolean>(false);

  const addSearchTerm = useLibraryStore((s) => s.addSearchTerm);
  const setLyricsStudioOpen = usePlayerStore((s) => s.setLyricsStudioOpen);

  useEffect(() => {
    checkBridgeStatus().then((status) => {
      setBridgeConnected(status.connected);
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      addSearchTerm(searchTerm);
      onSearch(searchTerm);
      onNavigate('search');
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cookieInput.trim()) return;
    setConnecting(true);
    const ok = await connectYtmSession(cookieInput.trim());
    setConnecting(false);
    if (ok) {
      setBridgeConnected(true);
      setShowConnectModal(false);
      window.location.reload();
    } else {
      alert('Could not connect to local bridge. Make sure "npm run bridge" is running.');
    }
  };

  return (
    <header className="top-app-bar">
      {/* Search Input Box */}
      <form onSubmit={handleSubmit} className="search-box-container">
        <Search size={16} className="search-input-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search tracks, artists, or lyrics..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            onSearch(e.target.value);
          }}
          onFocus={() => onNavigate('search')}
        />
        {searchTerm && (
          <button type="button" className="search-clear-btn" onClick={handleClear}>
            <X size={14} />
          </button>
        )}
      </form>

      {/* Mode Switcher Navigation Pills */}
      <div className="top-bar-mode-pills hide-mobile">
        <button
          className={`mode-pill-btn ${currentView === 'discover' ? 'active' : ''}`}
          onClick={() => onNavigate('discover')}
          title="Mode A: Discover & Catalogues"
        >
          <Compass size={14} />
          <span>Discover</span>
        </button>

        <button
          className={`mode-pill-btn ${currentView === 'player' ? 'active' : ''}`}
          onClick={() => onNavigate('player')}
          title="Mode B: Cinematic Immersive Player"
        >
          <Disc3 size={14} />
          <span>Player</span>
        </button>

        <button
          className={`mode-pill-btn lyrics-accent ${currentView === 'lyrics-studio' ? 'active' : ''}`}
          onClick={() => {
            onNavigate('lyrics-studio');
            setLyricsStudioOpen(true);
          }}
          title="Mode C: Synchronized Lyrics Focus"
        >
          <Mic2 size={14} />
          <span>Lyrics Focus</span>
        </button>
      </div>

      {/* Account Connection Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={() => setShowConnectModal(true)}
          className="account-pill-button glass-panel"
          title={`Channel @kaushik.thinks is synced with 257 tracks (${bridgeConnected ? 'Live Bridge Connected' : 'Static Synced'})`}
        >
          <Radio size={13} className="accent-icon" />
          <span>@kaushik.thinks</span>
          <span
            className="live-status-dot"
            style={{ background: bridgeConnected ? '#4ABA72' : 'var(--champagne)' }}
          />
        </button>
      </div>

      {/* CONNECT MODAL */}
      {showConnectModal && (
        <div className="modal-backdrop-overlay" onClick={() => setShowConnectModal(false)}>
          <div
            className="modal-card-box glass-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">YouTube Music Account Sync</h3>
              <button
                className="modal-close-icon"
                onClick={() => setShowConnectModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <p className="modal-desc">
              Your channel <strong>@kaushik.thinks</strong> is actively mapped with <strong>257 tracks</strong> across 4 playlists:
              <br />
              <em>Chatpate 💅🏻, ✨🫠💅, Realise The Beat 👊, and BGM</em>.
            </p>

            <form onSubmit={handleConnect} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ fontSize: 12, color: 'var(--muted-cream)' }}>
                Optional: Paste session cookie if re-syncing private history or recommendations:
              </label>
              <textarea
                value={cookieInput}
                onChange={(e) => setCookieInput(e.target.value)}
                placeholder="HSID=...; SSID=...; SID=...; SAPISID=..."
                className="cookie-textarea"
                rows={4}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                <button
                  type="button"
                  className="secondary-glass-btn"
                  onClick={() => setShowConnectModal(false)}
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="primary-glass-btn"
                  disabled={connecting}
                >
                  {connecting ? 'Connecting...' : 'Save & Refresh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
