import React from 'react';
import { useMusicPlayer } from '../hooks/useMusicPlayer';
import { PlayIcon, PauseIcon, NextIcon, PrevIcon, MusicNoteIcon } from '../constants';

const Player: React.FC = () => {
  const { 
    currentSong, 
    isPlaying, 
    togglePlayPause, 
    playNext, 
    playPrev,
    progress,
    duration,
    seek 
  } = useMusicPlayer();

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const onScrub = (value: string) => {
    seek(Number(value));
  };
  
  if (!currentSong) {
    return (
      <footer className="h-24 bg-gray-800 border-t border-gray-700 flex items-center justify-center p-4">
        <p className="text-gray-500">No song selected</p>
      </footer>
    );
  }

  return (
    <footer className="h-24 bg-gray-800 border-t border-gray-700 flex items-center justify-between p-4">
      <div className="flex items-center gap-4 w-1/4">
        <div className="w-14 h-14 bg-gray-700 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
            {currentSong.albumArtUrl ? (
                <img src={currentSong.albumArtUrl} alt={currentSong.name} className="w-full h-full object-cover" />
            ) : (
                <MusicNoteIcon className="w-8 h-8 text-gray-500"/>
            )}
        </div>
        <div>
          <h3 className="font-bold text-white truncate">{currentSong.name}</h3>
          <p className="text-sm text-gray-400 truncate">{currentSong.artist || 'Unknown Artist'}</p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 w-1/2">
        <div className="flex items-center gap-4">
          <button onClick={playPrev} className="text-gray-400 hover:text-white transition-colors">
            <PrevIcon className="w-5 h-5" />
          </button>
          <button
            onClick={togglePlayPause}
            className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5 pl-0.5" />}
          </button>
          <button onClick={playNext} className="text-gray-400 hover:text-white transition-colors">
            <NextIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="w-full flex items-center gap-2 text-xs">
          <span className="text-gray-400">{formatTime(progress)}</span>
          <input
            type="range"
            value={progress}
            step="1"
            min="0"
            max={duration ? duration : 0}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-accent"
            onChange={(e) => onScrub(e.target.value)}
          />
          <span className="text-gray-400">{formatTime(duration)}</span>
        </div>
      </div>
      
      <div className="w-1/4">
        {/* Volume controls could go here */}
      </div>
    </footer>
  );
};

export default Player;
