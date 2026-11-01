import React, { useState } from 'react';
import {
  Check,
  Radio,
  Sliders,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Shield,
  Zap,
} from 'lucide-react';
import kaushikData from '../../services/metadata/kaushik_channel_data.json';

export const SettingsView: React.FC = () => {
  const [audioQuality, setAudioQuality] = useState<'high' | 'auto' | 'data-saver'>('high');
  const [particleDensity, setParticleDensity] = useState<'high' | 'subtle' | 'off'>('subtle');
  const [fluidAnimations, setFluidAnimations] = useState<boolean>(true);
  const [showRomanizationDefault, setShowRomanizationDefault] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);

  const totalTracksCount = kaushikData.playlists.reduce((acc, p) => acc + p.tracks.length, 0);

  const handleSyncAccount = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    }, 1200);
  };

  return (
    <div className="view-scroll-container">
      <div className="settings-page-wrapper">
        <header className="settings-header">
          <div className="text-micro">PREFERENCES & CONFIGURATION</div>
          <h1 className="editorial-hero-title">Studio Settings</h1>
          <p className="editorial-tagline">
            Tailor audio playback, synchronized lyrics fidelity, visual effects, and account integrations.
          </p>
        </header>

        {/* Bound Account Section */}
        <section className="settings-card glass-panel">
          <div className="settings-card-header">
            <div className="settings-icon-bubble">
              <Radio size={22} className="accent-icon" />
            </div>
            <div>
              <h2 className="settings-section-title">Connected YouTube Music Profile</h2>
              <p className="settings-section-desc">
                Bound to personal channel & playlists: <code className="champagne-code">@kaushik.thinks</code>
              </p>
            </div>
          </div>

          <div className="settings-account-details">
            <div className="account-meta-row">
              <span className="account-label">Channel Identifier:</span>
              <span className="account-val">UCuCWg7snsL_X7f8GRUFx-tg</span>
            </div>
            <div className="account-meta-row">
              <span className="account-label">Total Synced Tracks:</span>
              <span className="account-val">{totalTracksCount} songs across {kaushikData.playlists.length} playlists</span>
            </div>
            <div className="account-meta-row">
              <span className="account-label">Playlists Mapped:</span>
              <div className="account-pills-list">
                {kaushikData.playlists.map((pl) => (
                  <span key={pl.id} className="playlist-chip">
                    {pl.title} ({pl.tracks.length})
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="settings-card-actions">
            <button
              className={`primary-glass-btn ${isSyncing ? 'loading' : ''}`}
              onClick={handleSyncAccount}
              disabled={isSyncing}
            >
              <RefreshCw size={15} className={isSyncing ? 'spin-icon' : ''} />
              <span>{isSyncing ? 'Syncing...' : syncSuccess ? 'Sync Complete!' : 'Re-sync Channel Data'}</span>
            </button>
            <a
              href="https://music.youtube.com/@kaushik.thinks?si=y0pBuKmF3K5bWpt2"
              target="_blank"
              rel="noopener noreferrer"
              className="secondary-glass-btn"
            >
              <ExternalLink size={15} />
              <span>Open on YouTube Music</span>
            </a>
          </div>
        </section>

        {/* Lyrics Studio Visuals */}
        <section className="settings-card glass-panel">
          <div className="settings-card-header">
            <div className="settings-icon-bubble">
              <Sparkles size={22} className="accent-icon" />
            </div>
            <div>
              <h2 className="settings-section-title">Lyrics Studio & Particle Effects</h2>
              <p className="settings-section-desc">
                Configure ambient shimmer, word highlight glow, and progressive letter reveal.
              </p>
            </div>
          </div>

          <div className="settings-options-group">
            <label className="settings-option-row">
              <div>
                <div className="option-title">Champagne Particle Shimmer</div>
                <div className="option-subtitle">
                  Renders subtle gold and cream glitter particles around the active synchronized word.
                </div>
              </div>
              <div className="segmented-toggle">
                {(['high', 'subtle', 'off'] as const).map((density) => (
                  <button
                    key={density}
                    className={`segmented-pill ${particleDensity === density ? 'active' : ''}`}
                    onClick={() => setParticleDensity(density)}
                  >
                    {density.charAt(0).toUpperCase() + density.slice(1)}
                  </button>
                ))}
              </div>
            </label>

            <label className="settings-option-row">
              <div>
                <div className="option-title">Cinematic Glass Blur & Motion</div>
                <div className="option-subtitle">
                  Enables 60fps GPU-accelerated backdrop blur and physics-based easing.
                </div>
              </div>
              <input
                type="checkbox"
                checked={fluidAnimations}
                onChange={(e) => setFluidAnimations(e.target.checked)}
                className="custom-toggle-switch"
              />
            </label>

            <label className="settings-option-row">
              <div>
                <div className="option-title">Default Romaji / Romanization</div>
                <div className="option-subtitle">
                  Automatically show romanized pronunciation subtitles for non-Latin songs.
                </div>
              </div>
              <input
                type="checkbox"
                checked={showRomanizationDefault}
                onChange={(e) => setShowRomanizationDefault(e.target.checked)}
                className="custom-toggle-switch"
              />
            </label>
          </div>
        </section>

        {/* Audio Engine Standards */}
        <section className="settings-card glass-panel">
          <div className="settings-card-header">
            <div className="settings-icon-bubble">
              <Sliders size={22} className="accent-icon" />
            </div>
            <div>
              <h2 className="settings-section-title">Audio Streaming Pipeline</h2>
              <p className="settings-section-desc">
                Playback fidelity driven through YouTube IFrame Player engine.
              </p>
            </div>
          </div>

          <div className="settings-options-group">
            <div className="quality-selector-grid">
              <div
                className={`quality-card ${audioQuality === 'high' ? 'active' : ''}`}
                onClick={() => setAudioQuality('high')}
              >
                <div className="quality-header">
                  <Zap size={18} />
                  <span>High Fidelity</span>
                </div>
                <div className="quality-desc">256 kbps AAC streaming with dynamic volume normalization.</div>
                {audioQuality === 'high' && <Check size={16} className="selected-check" />}
              </div>

              <div
                className={`quality-card ${audioQuality === 'auto' ? 'active' : ''}`}
                onClick={() => setAudioQuality('auto')}
              >
                <div className="quality-header">
                  <Shield size={18} />
                  <span>Adaptive Quality</span>
                </div>
                <div className="quality-desc">Automatically adjusts bitrate based on active connection.</div>
                {audioQuality === 'auto' && <Check size={16} className="selected-check" />}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
