import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { ViewMode } from '../../types';
import { useLibraryStore } from '../../stores/useLibraryStore';

interface TopAppBarProps {
  onSearch: (query: string) => void;
  onNavigate: (view: ViewMode) => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({ onSearch, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const addSearchTerm = useLibraryStore((s) => s.addSearchTerm);

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
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
          Music deserves a better interface.
        </span>
      </div>
    </header>
  );
};
