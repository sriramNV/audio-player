
import React from 'react';
import { useMusicPlayer } from '../hooks/useMusicPlayer';
import { Song } from '../types';

interface AddToPlaylistModalProps {
  song: Song;
  onClose: () => void;
}

const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({ song, onClose }) => {
  const { playlists, addSongToPlaylist } = useMusicPlayer();

  const handleAddToPlaylist = (playlistId: string) => {
    addSongToPlaylist(song.id, playlistId);
    onClose();
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
            <p className="text-gray-500 text-center py-4">No playlists found. Create one first!</p>
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
