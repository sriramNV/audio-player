
import React, { useMemo } from 'react';
import { useMusicPlayer } from '../hooks/useMusicPlayer';
import { Song } from '../types';
import { PlayIcon, MusicNoteIcon } from '../constants';

interface PlaylistViewProps {
  playlistId: string;
}

const PlaylistView: React.FC<PlaylistViewProps> = ({ playlistId }) => {
  const { playlists, songs, playSong, removeSongFromPlaylist } = useMusicPlayer();

  const playlist = useMemo(() => playlists.find(p => p.id === playlistId), [playlists, playlistId]);
  const playlistSongs = useMemo(() => {
    if (!playlist) return [];
    return playlist.songIds.map(id => songs.find(s => s.id === id)).filter((s): s is Song => !!s);
  }, [playlist, songs]);

  if (!playlist) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl text-white">Playlist not found</h2>
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end gap-6">
        <div className="w-48 h-48 bg-gray-800 rounded-lg shadow-lg flex items-center justify-center">
            <MusicNoteIcon className="w-24 h-24 text-gray-600"/>
        </div>
        <div>
            <h2 className="text-xs font-bold uppercase text-gray-400">Playlist</h2>
            <h1 className="text-6xl font-extrabold text-white">{playlist.name}</h1>
            <p className="text-gray-400 mt-2">{playlistSongs.length} songs</p>
        </div>
      </div>

      {playlistSongs.length === 0 ? (
        <div className="text-center py-20 bg-gray-800/50 rounded-lg">
          <p className="text-gray-400">This playlist is empty.</p>
          <p className="text-gray-500 text-sm mt-2">Add songs from your library.</p>
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
          {playlistSongs.map((song, index) => (
              <div key={song.id} className="grid grid-cols-[2rem_4fr_3fr_3fr_1fr_4rem] items-center gap-4 px-4 py-2 hover:bg-gray-800 rounded-lg group">
                  <span className="text-gray-400 text-center">{index + 1}</span>
                  <span className="text-white truncate">{song.name}</span>
                  <span className="text-gray-400 truncate">{song.artist || 'Unknown Artist'}</span>
                  <span className="text-gray-400 truncate">{song.album || 'Unknown Album'}</span>
                  <span className="text-gray-400">{formatDuration(song.duration)}</span>
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => playSong(song.id, playlist.id)} className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlayIcon className="w-5 h-5" />
                    </button>
                     <button onClick={() => removeSongFromPlaylist(song.id, playlist.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold">
                      X
                    </button>
                  </div>
              </div>
          ))}
      </div>
      )}
    </div>
  );
};

export default PlaylistView;
