import React, { useState } from 'react';
import { useMusicPlayer } from '../hooks/useMusicPlayer';
import { Song } from '../types';
import { PlayIcon, PlusIcon } from '../constants';
import AddToPlaylistModal from './AddToPlaylistModal';

const AddSongButton: React.FC = () => {
    const { addFilesToLibrary } = useMusicPlayer();
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            try {
                await addFilesToLibrary(event.target.files);
            } catch (e) {
                console.error("Error adding files to library", e);
                // In a real app, you might want to show a user-facing error message here.
            }
            // Reset the input value to allow selecting the same file(s) again.
            event.target.value = '';
        }
    };
    
    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div>
            <input
                type="file"
                multiple
                accept="audio/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />
            <button onClick={handleClick} className="bg-green-accent text-white font-bold py-2 px-4 rounded-full hover:bg-green-600 transition-colors flex items-center gap-2">
                <PlusIcon className="w-5 h-5" />
                Add Songs
            </button>
        </div>
    );
};

const LibraryView: React.FC = () => {
  const { songs, playSong } = useMusicPlayer();
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  const formatDuration = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-white">My Library</h1>
        <AddSongButton />
      </div>
      {songs.length === 0 ? (
        <div className="text-center py-20 bg-gray-800 rounded-lg">
          <p className="text-gray-400">Your library is empty.</p>
          <p className="text-gray-500 text-sm mt-2">Click "Add Songs" to get started.</p>
        </div>
      ) : (
      <div className="text-left">
          <div className="grid grid-cols-[2rem_4fr_3fr_3fr_1fr_4rem] gap-4 px-4 py-2 text-gray-400 text-sm font-semibold border-b border-gray-700">
              <span className="text-center">#</span>
              <span>Title</span>
              <span>Artist</span>
              <span>Album</span>
              <span>Duration</span>
              <span />
          </div>
          {songs.map((song, index) => (
              <div key={song.id} className="grid grid-cols-[2rem_4fr_3fr_3fr_1fr_4rem] items-center gap-4 px-4 py-2 hover:bg-gray-800 rounded-lg group">
                  <span className="text-gray-400 text-center">{index + 1}</span>
                  <span className="text-white truncate">{song.name}</span>
                  <span className="text-gray-400 truncate">{song.artist || 'Unknown Artist'}</span>
                  <span className="text-gray-400 truncate">{song.album || 'Unknown Album'}</span>
                  <span className="text-gray-400">{formatDuration(song.duration)}</span>
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => playSong(song.id)} className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlayIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => setSelectedSong(song)} className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlusIcon className="w-5 h-5" />
                    </button>
                  </div>
              </div>
          ))}
      </div>
      )}
      {selectedSong && (
        <AddToPlaylistModal song={selectedSong} onClose={() => setSelectedSong(null)} />
      )}
    </div>
  );
};

export default LibraryView;
