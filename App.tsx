
import React, { useState } from 'react';
import { MusicPlayerProvider } from './hooks/useMusicPlayer';
import Sidebar from './components/Sidebar';
import LibraryView from './components/LibraryView';
import PlaylistView from './components/PlaylistView';
import Player from './components/Player';
import { View } from './types';
import { MenuIcon } from './constants';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>({ type: 'library' });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <MusicPlayerProvider>
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
          <main className="flex-1 overflow-y-auto bg-gray-900 p-6">
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
    </MusicPlayerProvider>
  );
};

export default App;
