
import React, { useState, useEffect } from 'react';
import { MusicPlayerProvider, useMusicPlayer } from './hooks/useMusicPlayer';
import Sidebar from './components/Sidebar';
import LibraryView from './components/LibraryView';
import PlaylistView from './components/PlaylistView';
import Player from './components/Player';
import { View } from './types';
import { MenuIcon } from './constants';

const AppContent: React.FC = () => {
  const { playlists } = useMusicPlayer();
  const [activeView, setActiveView] = useState<View>({ type: 'library' });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // If the currently viewed playlist is deleted, switch back to the library
    if (activeView.type === 'playlist' && !playlists.find(p => p.id === activeView.id)) {
        setActiveView({ type: 'library' });
    }
  }, [playlists, activeView]);

  const renderContent = () => {
    if (activeView.type === 'playlist') {
      return <PlaylistView playlistId={activeView.id} />;
    }
    return <LibraryView />;
  };

  const handleSetActiveView = (view: View) => {
    setActiveView(view);
    setIsMobileMenuOpen(false); // Close mobile menu on navigation
  };

  return (
    <div className="h-screen w-screen flex flex-col font-sans">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeView={activeView}
          setActiveView={handleSetActiveView}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          isMobileOpen={isMobileMenuOpen}
          setMobileOpen={setIsMobileMenuOpen}
        />
        <main className="flex-1 overflow-y-auto bg-gray-900 px-6 pt-6 pb-28">
          <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-gray-400 hover:text-white mb-4 p-1 -ml-1"
              aria-label="Open menu"
          >
              <MenuIcon className="w-6 h-6" />
          </button>
          {renderContent()}
        </main>
      </div>
      <Player />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <MusicPlayerProvider>
      <AppContent />
    </MusicPlayerProvider>
  );
};

export default App;
