

import React, { useState } from 'react';
import { useMusicPlayer } from '../hooks/useMusicPlayer';
import { Song } from '../types';

interface AddToPlaylistModalProps {
  song: Song;
  onClose: () => void;
}

const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({ song, onClose }) => {
  const { playlists, addSongToPlaylist, createPlaylist } = useMusicPlayer();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleAddToPlaylist = (playlistId: string) => {
    addSongToPlaylist(song.id, playlistId);
    onClose();
  };

  const handleCreateAndAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      const newPlaylist = await createPlaylist(newPlaylistName.trim());
      await addSongToPlaylist(song.id, newPlaylist.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-2">Add to Playlist</h2>
        <p className="text-gray-400 mb-4">Add "{song.name}" to:</p>
        <div className="max-h-60 overflow-y-auto space-y-2">
          {playlists.length > 0 ? (
            playlists.map(playlist => (
              <button
                key={playlist.id}
                onClick={() => handleAddToPlaylist(playlist.id)}
                className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
              >
                {playlist.name}
              </button>
            ))
          ) : (
            <div>
              {showCreateForm ? (
                <form onSubmit={handleCreateAndAdd} className="flex gap-2">
                  <input
                    type="text"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="New Playlist Name"
                    className="flex-grow bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-accent"
                    autoFocus
                  />
                  <button type="submit" className="bg-green-accent text-white font-bold py-2 px-4 rounded-md hover:bg-green-600 transition-colors">
                    Create
                  </button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-4">No playlists found.</p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-green-accent text-white font-bold py-2 px-4 rounded-full hover:bg-green-600 transition-colors"
                  >
                    Create New Playlist
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="bg-gray-600 text-white font-bold py-2 px-4 rounded-full hover:bg-gray-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToPlaylistModal;