import React, { useEffect, useState } from 'react';
import { Compass, Search, Library, Mic2 } from 'lucide-react';
import { ViewMode } from '../types';
import { Sidebar } from '../components/layout/Sidebar';
import { TopAppBar } from '../components/layout/TopAppBar';
import { DockedPlayerBar } from '../components/player/DockedPlayerBar';
import { AmbientBackdrop } from '../components/player/AmbientBackdrop';
import { DiscoverView } from '../features/discover/DiscoverView';
import { SearchView } from '../features/search/SearchView';
import { LibraryView } from '../features/library/LibraryView';
import { LyricsStudio } from '../features/lyrics-studio/LyricsStudio';
import { QueueDrawer } from '../features/queue/QueueDrawer';
import { usePlayerStore } from '../stores/usePlayerStore';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('discover');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const {
    initEmbedPlayer,
    togglePlay,
    seek,
    positionSeconds,
    toggleMute,
    isLyricsStudioOpen,
    setLyricsStudioOpen,
    isQueueDrawerOpen,
    setQueueDrawerOpen,
  } = usePlayerStore();

  // Initialize YouTube IFrame API Embed Player
  useEffect(() => {
    initEmbedPlayer('sonora-yt-player-container');
  }, [initEmbedPlayer]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          seek(positionSeconds + 5);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seek(Math.max(0, positionSeconds - 5));
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'KeyL':
          e.preventDefault();
          setLyricsStudioOpen(!isLyricsStudioOpen);
          break;
        case 'Escape':
          if (isLyricsStudioOpen) setLyricsStudioOpen(false);
          if (isQueueDrawerOpen) setQueueDrawerOpen(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    togglePlay,
    seek,
    positionSeconds,
    toggleMute,
    isLyricsStudioOpen,
    setLyricsStudioOpen,
    isQueueDrawerOpen,
    setQueueDrawerOpen,
  ]);

  return (
    <div className="app-container">
      {/* Background Ambient Canvas */}
      <AmbientBackdrop />

      {/* Hidden YouTube IFrame Embed Player Container */}
      <div
        id="sonora-yt-player-container"
        style={{
          position: 'fixed',
          top: -9999,
          left: -9999,
          width: 320,
          height: 180,
          pointerEvents: 'none',
          opacity: 0,
          zIndex: -1,
        }}
      />

      {/* Desktop Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onSelectView={(v) => setCurrentView(v)}
        onCreatePlaylist={() => setCurrentView('library')}
      />

      {/* Main Viewport */}
      <div className="main-viewport">
        <TopAppBar
          onSearch={(q) => {
            setSearchQuery(q);
            setCurrentView('search');
          }}
          onNavigate={(v) => setCurrentView(v)}
        />

        {currentView === 'discover' && <DiscoverView />}
        {currentView === 'search' && <SearchView initialQuery={searchQuery} />}
        {currentView === 'library' && <LibraryView />}
        {currentView === 'lyrics-studio' && <DiscoverView />}
      </div>

      {/* Persistent Docked Player Bar */}
      <DockedPlayerBar />

      {/* Hero Overlays: Lyrics Studio & Queue Drawer */}
      <LyricsStudio />
      <QueueDrawer />

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-nav-bar">
        <button
          className={`mobile-nav-item ${currentView === 'discover' ? 'active' : ''}`}
          onClick={() => setCurrentView('discover')}
        >
          <Compass size={20} />
          <span>Explore</span>
        </button>
        <button
          className={`mobile-nav-item ${currentView === 'search' ? 'active' : ''}`}
          onClick={() => setCurrentView('search')}
        >
          <Search size={20} />
          <span>Search</span>
        </button>
        <button
          className={`mobile-nav-item ${currentView === 'library' ? 'active' : ''}`}
          onClick={() => setCurrentView('library')}
        >
          <Library size={20} />
          <span>Library</span>
        </button>
        <button
          className="mobile-nav-item"
          onClick={() => setLyricsStudioOpen(true)}
        >
          <Mic2 size={20} />
          <span>Lyrics</span>
        </button>
      </nav>
    </div>
  );
};
