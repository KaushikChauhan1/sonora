import React, { useState, useEffect } from 'react';
import { Search, X, Radio } from 'lucide-react';
import { ViewMode } from '../../types';
import { useLibraryStore } from '../../stores/useLibraryStore';
import { checkBridgeStatus, connectYtmSession } from '../../services/metadata/ytmBridgeService';

interface TopAppBarProps {
  onSearch: (query: string) => void;
  onNavigate: (view: ViewMode) => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({ onSearch, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [bridgeConnected, setBridgeConnected] = useState<boolean>(false);
  const [showConnectModal, setShowConnectModal] = useState<boolean>(false);
  const [cookieInput, setCookieInput] = useState<string>('');
  const [connecting, setConnecting] = useState<boolean>(false);

  const addSearchTerm = useLibraryStore((s) => s.addSearchTerm);

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
      <form onSubmit={handleSubmit} className="search-box-container">
        <Search size={16} className="search-input-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search tracks, artists, or albums..."
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

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => setShowConnectModal(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 999,
            background: bridgeConnected ? 'rgba(74, 186, 114, 0.16)' : 'rgba(74, 186, 114, 0.12)',
            color: '#2D8A4E',
            fontSize: 12,
            fontWeight: 600,
            border: `1px solid ${bridgeConnected ? '#2D8A4E' : 'rgba(45, 138, 78, 0.3)'}`,
          }}
          title="Channel @kaushik.thinks is synced with 257 tracks across 4 playlists"
        >
          <Radio size={13} />
          <span>@kaushik.thinks {bridgeConnected ? '(Live)' : '(Synced)'}</span>
        </button>
      </div>

      {/* CONNECT MODAL */}
      {showConnectModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(36, 35, 33, 0.45)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 120,
          }}
          onClick={() => setShowConnectModal(false)}
        >
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 20,
              padding: 28,
              width: 480,
              maxWidth: '92vw',
              boxShadow: 'var(--shadow-elevated)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontFamily: 'var(--font-editorial)', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
              Sync Your YouTube Music Account
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>
              Get your exact YouTube Music <b>Recommendations</b>, <b>Liked Songs</b>, <b>Listening History</b>, and <b>Playlists</b> streamed through SONORA with mandatory word-by-word synchronized lyrics.
            </p>

            <form onSubmit={handleConnect} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  YouTube Music Cookie or cURL
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Paste your Cookie header or cURL from music.youtube.com DevTools..."
                  value={cookieInput}
                  onChange={(e) => setCookieInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: 'var(--surface-secondary)',
                    fontSize: 12,
                    fontFamily: 'monospace',
                  }}
                />
              </div>

              <div style={{ background: 'var(--surface-secondary)', padding: 12, borderRadius: 10, fontSize: 11, color: 'var(--text-secondary)' }}>
                <b>How to get your session in 20 seconds:</b>
                <ol style={{ paddingLeft: 16, marginTop: 4 }}>
                  <li>Open <a href="https://music.youtube.com" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>music.youtube.com</a> and log in.</li>
                  <li>Press <code>F12</code> → Network tab → filter by <code>browse</code>.</li>
                  <li>Right-click any browse request → <b>Copy as cURL</b>. Paste it above!</li>
                </ol>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={connecting}
                  className="play-pause-master-btn"
                  style={{ width: 'auto', height: 38, padding: '0 20px', borderRadius: 10, fontSize: 13, fontWeight: 600 }}
                >
                  {connecting ? 'Connecting...' : 'Connect & Sync'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
