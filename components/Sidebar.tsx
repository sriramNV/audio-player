
import React, { useState, useEffect } from 'react';
import { useMusicPlayer } from '../hooks/useMusicPlayer';
import { View } from '../types';
import { PlusIcon, MusicNoteIcon, PlaylistIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon, XIcon, PlayIcon, TrashIcon } from '../constants';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const SidebarToggleIcon = ({ isCollapsed, className = "w-5 h-5" }: { isCollapsed: boolean; className?: string; }) => {
    return isCollapsed ? (
        <ChevronDoubleRightIcon className={className} />
    ) : (
        <ChevronDoubleLeftIcon className={className} />
    );
};

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isCollapsed, setIsCollapsed, isMobileOpen, setMobileOpen }) => {
  const { playlists, createPlaylist, playPlaylist, deletePlaylist } = useMusicPlayer();
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (showInput && isCollapsed) {
        setIsCollapsed(false);
    }
  }, [showInput, isCollapsed, setIsCollapsed]);


  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setShowInput(false);
    }
  };
  
  const handleDeletePlaylist = (playlistId: string) => {
    deletePlaylist(playlistId);
    setConfirmDeleteId(null);
  }

  const baseItemClass = "flex items-center gap-4 px-4 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors duration-200";
  const activeItemClass = "bg-gray-800 text-white";
  const inactiveItemClass = "text-gray-500 hover:bg-gray-800 hover:text-white";

  return (
    <>
        {/* Backdrop for mobile */}
        {isMobileOpen && (
            <div 
                className="fixed inset-0 bg-black bg-opacity-60 z-30 md:hidden"
                onClick={() => setMobileOpen(false)}
                aria-hidden="true"
            ></div>
        )}
        
        <aside className={
          `bg-gray-950 p-4 flex flex-col w-64
           fixed inset-y-0 left-0 z-40
           transition-transform transform duration-300 ease-in-out
           md:relative md:translate-x-0 md:transition-all
           ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
           ${isCollapsed ? 'md:w-20' : 'md:w-64'}`
        }>
            <div className="flex justify-between items-center mb-4 md:hidden">
                <span className="text-white font-bold text-lg">Menu</span>
                <button
                    onClick={() => setMobileOpen(false)}
                    className={`${baseItemClass} ${inactiveItemClass} !p-2 -mr-2`}
                    title="Close menu"
                >
                    <XIcon className="w-5 h-5"/>
                </button>
            </div>
            <nav className="space-y-2">
              <div
                onClick={() => setActiveView({ type: 'library' })}
                title="My Library"
                className={`${baseItemClass} ${activeView.type === 'library' ? activeItemClass : inactiveItemClass} ${isCollapsed ? 'justify-center' : ''}`}
              >
                <MusicNoteIcon className="w-5 h-5 flex-shrink-0" />
                <span className={isCollapsed ? 'md:hidden' : ''}>My Library</span>
              </div>
            </nav>
            <hr className="my-4 border-gray-700" />
            <div className="flex-1 overflow-y-auto">
              <h2 className={`px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ${isCollapsed ? 'md:hidden' : 'block'}`}>Playlists</h2>
              <div className="space-y-1">
                {playlists.map(playlist => {
                  if (confirmDeleteId === playlist.id && !isCollapsed) {
                    return (
                        <div key={playlist.id} className="p-2 bg-gray-700 rounded-md text-sm">
                            <p className="text-white mb-2 text-center text-xs">Delete '{playlist.name}'?</p>
                            <div className="flex justify-center gap-2">
                                <button onClick={() => handleDeletePlaylist(playlist.id)} className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1 px-3 rounded">Yes</button>
                                <button onClick={() => setConfirmDeleteId(null)} className="bg-gray-500 hover:bg-gray-600 text-white text-xs font-bold py-1 px-3 rounded">No</button>
                            </div>
                        </div>
                    );
                  }
                  return (
                  <div
                    key={playlist.id}
                    title={playlist.name}
                    className={`group relative ${baseItemClass} ${activeView.type === 'playlist' && activeView.id === playlist.id ? activeItemClass : inactiveItemClass} ${isCollapsed ? 'justify-center' : ''}`}
                  >
                    <div onClick={() => setActiveView({ type: 'playlist', id: playlist.id })} className="flex items-center gap-4 flex-grow min-w-0">
                      <PlaylistIcon className="w-5 h-5 flex-shrink-0"/>
                      <span className={`truncate ${isCollapsed ? 'md:hidden' : ''}`}>{playlist.name}</span>
                    </div>
                    {!isCollapsed && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800/80 rounded-full">
                          <button onClick={() => playPlaylist(playlist.id)} className="text-gray-400 hover:text-white p-1" title="Play Playlist">
                              <PlayIcon className="w-5 h-5"/>
                          </button>
                          <button onClick={() => setConfirmDeleteId(playlist.id)} className="text-gray-400 hover:text-white p-1" title="Delete Playlist">
                              <TrashIcon className="w-5 h-5"/>
                          </button>
                      </div>
                    )}
                  </div>
                )})}
              </div>
            </div>
            {showInput && !isCollapsed ? (
              <form onSubmit={handleCreatePlaylist} className="mt-4 p-2">
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="New Playlist Name"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-accent"
                  autoFocus
                  onBlur={() => setShowInput(false)}
                />
              </form>
            ) : (
            <button 
              onClick={() => setShowInput(true)}
              className={`${baseItemClass} ${inactiveItemClass} mt-4 ${isCollapsed ? 'justify-center' : ''}`}
            >
              <PlusIcon className="w-5 h-5 flex-shrink-0" />
              <span className={isCollapsed ? 'md:hidden' : ''}>Create Playlist</span>
            </button>
            )}
            <div className="mt-auto pt-4 border-t border-gray-700">
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className={`hidden md:flex ${baseItemClass} ${inactiveItemClass} w-full ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    <SidebarToggleIcon isCollapsed={isCollapsed} className="w-5 h-5 flex-shrink-0"/>
                    <span className={isCollapsed ? 'md:hidden' : ''}>Collapse</span>
                </button>
            </div>
        </aside>
    </>
  );
};

export default Sidebar;
