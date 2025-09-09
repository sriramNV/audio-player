

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { Song, Playlist } from '../types';
import * as db from '../services/db';

// Add a declaration for the jsmediatags library on the window object
declare global {
    interface Window {
        jsmediatags: any;
    }
}

interface MusicPlayerContextType {
  songs: Song[];
  playlists: Playlist[];
  currentSong: Song | null;
  isPlaying: boolean;
  playSong: (songId: string, playlistId?: string) => void;
  playPlaylist: (playlistId: string) => void;
  playShuffled: (playlistId: string) => void;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrev: () => void;
  addFilesToLibrary: (files: FileList) => Promise<void>;
  createPlaylist: (name: string) => Promise<Playlist>;
  addSongToPlaylist: (songId: string, playlistId: string) => Promise<void>;
  removeSongFromPlaylist: (songId: string, playlistId: string) => Promise<void>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  deleteSongFromLibrary: (songId: string) => Promise<void>;
  audioRef: React.RefObject<HTMLAudioElement>;
  progress: number;
  duration: number;
  seek: (time: number) => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const MusicPlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeQueue, setActiveQueue] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);

  const loadData = useCallback(async () => {
    await db.initDB();
    const [loadedSongs, loadedPlaylists] = await Promise.all([
      db.getAllSongs(),
      db.getAllPlaylists(),
    ]);
    setSongs(loadedSongs);
    setPlaylists(loadedPlaylists);
    setActiveQueue(loadedSongs.map(s => s.id));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);
  
  const currentSong = activeQueue[currentSongIndex] ? songs.find(s => s.id === activeQueue[currentSongIndex]) ?? null : null;
  
  useEffect(() => {
    if (audioRef.current && currentSong) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Error playing audio:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);
  
  const playSong = (songId: string, playlistId?: string) => {
    let queue: string[];
    if (playlistId) {
        const playlist = playlists.find(p => p.id === playlistId);
        queue = playlist ? playlist.songIds : songs.map(s => s.id);
    } else {
        queue = songs.map(s => s.id);
    }
    const songIndex = queue.findIndex(id => id === songId);
    if(songIndex !== -1) {
        setActiveQueue(queue);
        setCurrentSongIndex(songIndex);
        setIsPlaying(true);
        if(audioRef.current) {
            const song = songs.find(s => s.id === songId);
            if(song) {
                audioRef.current.src = song.url;
                audioRef.current.play().catch(e => console.error("Error playing audio:", e));
            }
        }
    }
  };

  const playPlaylist = (playlistId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (playlist && playlist.songIds.length > 0) {
        playSong(playlist.songIds[0], playlistId);
    }
  };

  const playShuffled = (playlistId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (playlist && playlist.songIds.length > 0) {
        const shuffledIds = [...playlist.songIds];
        // Fisher-Yates shuffle
        for (let i = shuffledIds.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledIds[i], shuffledIds[j]] = [shuffledIds[j], shuffledIds[i]];
        }
        
        const firstSongId = shuffledIds[0];
        setActiveQueue(shuffledIds);
        setCurrentSongIndex(0);
        setIsPlaying(true);
        if (audioRef.current) {
            const song = songs.find(s => s.id === firstSongId);
            if (song) {
                audioRef.current.src = song.url;
                audioRef.current.play().catch(e => console.error("Error playing audio:", e));
            }
        }
    }
  };

  const togglePlayPause = () => {
    if (currentSong) {
      setIsPlaying(!isPlaying);
    }
  };

  const playNext = useCallback(() => {
    if (activeQueue.length > 0) {
      const nextIndex = (currentSongIndex + 1) % activeQueue.length;
      const nextSongId = activeQueue[nextIndex];
      
      setCurrentSongIndex(nextIndex);
      setIsPlaying(true);
      if(audioRef.current) {
          const song = songs.find(s => s.id === nextSongId);
          if(song) {
              audioRef.current.src = song.url;
              audioRef.current.play().catch(e => console.error("Error playing audio:", e));
          }
      }
    }
  }, [currentSongIndex, activeQueue, songs]);

  const playPrev = () => {
    if (activeQueue.length > 0) {
      const prevIndex = (currentSongIndex - 1 + activeQueue.length) % activeQueue.length;
      const prevSongId = activeQueue[prevIndex];

      setCurrentSongIndex(prevIndex);
      setIsPlaying(true);
      if(audioRef.current) {
          const song = songs.find(s => s.id === prevSongId);
          if(song) {
              audioRef.current.src = song.url;
              audioRef.current.play().catch(e => console.error("Error playing audio:", e));
          }
      }
    }
  };
  
  const addFilesToLibrary = async (files: FileList) => {
    const songPromises = Array.from(files)
      .filter(file => file.type.startsWith('audio/'))
      .map(file => new Promise<{ metadata: Omit<Song, 'url' | 'albumArtUrl'> & { albumArt?: Blob }, file: File }>((resolve) => {
        
        const processFile = (tags: any = {}) => {
            const audio = document.createElement('audio');
            const objectUrl = URL.createObjectURL(file);

            const cleanupAndResolve = (duration: number) => {
                URL.revokeObjectURL(objectUrl);
                let albumArtBlob: Blob | undefined = undefined;
                if (tags.picture) {
                    const { data, format } = tags.picture;
                    albumArtBlob = new Blob([new Uint8Array(data)], { type: format });
                }
                resolve({
                    metadata: {
                        id: `${file.name}-${file.lastModified}`,
                        name: tags.title || file.name.replace(/\.[^/.]+$/, ""),
                        artist: tags.artist,
                        album: tags.album,
                        duration: duration,
                        albumArt: albumArtBlob,
                    },
                    file: file,
                });
            };
            
            audio.addEventListener('loadedmetadata', () => cleanupAndResolve(audio.duration));
            audio.addEventListener('error', () => cleanupAndResolve(0));
            audio.src = objectUrl;
        };

        if (window.jsmediatags) {
            window.jsmediatags.read(file, {
              onSuccess: (tag: any) => {
                processFile(tag.tags);
              },
              onError: (error: any) => {
                console.warn(`Could not read metadata for ${file.name}:`, error);
                processFile();
              }
            });
        } else {
            console.warn("jsmediatags library not loaded. Proceeding without metadata.");
            processFile();
        }
      }));

    const newSongs = await Promise.all(songPromises);
    if (newSongs.length > 0) {
      await db.addSongs(newSongs);
      await loadData();
    }
  };
  
  const createPlaylist = async (name: string): Promise<Playlist> => {
    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      name,
      songIds: [],
    };
    await db.savePlaylist(newPlaylist);
    setPlaylists(prev => [...prev, newPlaylist]);
    return newPlaylist;
  };

  const addSongToPlaylist = async (songId: string, playlistId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (playlist && !playlist.songIds.includes(songId)) {
      const updatedPlaylist = { ...playlist, songIds: [...playlist.songIds, songId] };
      await db.savePlaylist(updatedPlaylist);
      setPlaylists(prev => prev.map(p => (p.id === playlistId ? updatedPlaylist : p)));
    }
  };

  const removeSongFromPlaylist = async (songId: string, playlistId: string) => {
      const playlist = playlists.find(p => p.id === playlistId);
      if(playlist) {
          const updatedPlaylist = {...playlist, songIds: playlist.songIds.filter(id => id !== songId)};
          await db.savePlaylist(updatedPlaylist);
          setPlaylists(prev => prev.map(p => (p.id === playlistId ? updatedPlaylist : p)));
      }
  };

  const deletePlaylist = async (playlistId: string) => {
    try {
      await db.deletePlaylist(playlistId);
      setPlaylists(prev => prev.filter(p => p.id !== playlistId));
    } catch (error) {
        console.error("Failed to delete playlist:", error);
        alert("Error: Could not delete the playlist.");
    }
  }
  
  const deleteSongFromLibrary = async (songId: string) => {
    const deletedSongQueueIndex = activeQueue.findIndex(id => id === songId);
    let newCurrentSongIndex = currentSongIndex;

    if (currentSong?.id === songId) {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
        }
        setIsPlaying(false);
        setProgress(0);
        setDuration(0);
        newCurrentSongIndex = -1;
    } else if (deletedSongQueueIndex !== -1 && deletedSongQueueIndex < currentSongIndex) {
        newCurrentSongIndex = currentSongIndex - 1;
    }
    
    const playlistUpdatePromises: Promise<void>[] = [];
    const updatedPlaylists = playlists.map(p => {
        if (p.songIds.includes(songId)) {
            const newSongIds = p.songIds.filter(id => id !== songId);
            const updatedPlaylist = { ...p, songIds: newSongIds };
            playlistUpdatePromises.push(db.savePlaylist(updatedPlaylist));
            return updatedPlaylist;
        }
        return p;
    });
    
    try {
        await db.deleteSong(songId);
        await Promise.all(playlistUpdatePromises);
        
        setPlaylists(updatedPlaylists);
        setSongs(prevSongs => prevSongs.filter(s => s.id !== songId));
        setActiveQueue(prevQueue => prevQueue.filter(id => id !== songId));
        setCurrentSongIndex(newCurrentSongIndex);
    } catch (error) {
        console.error("Failed to delete song from library:", error);
        alert("Error: Could not delete the song.");
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
        audioRef.current.currentTime = time;
    }
  };

  const onTimeUpdate = () => {
    if(audioRef.current){
        setProgress(audioRef.current.currentTime);
        setDuration(audioRef.current.duration || 0);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('timeupdate', onTimeUpdate);
      audio.addEventListener('ended', playNext);
      return () => {
        audio.removeEventListener('timeupdate', onTimeUpdate);
        audio.removeEventListener('ended', playNext);
      };
    }
  }, [audioRef, playNext]);


  return (
    <MusicPlayerContext.Provider value={{ 
        songs, playlists, currentSong, isPlaying, playSong, playPlaylist, playShuffled, togglePlayPause, playNext, playPrev, 
        addFilesToLibrary, createPlaylist, addSongToPlaylist, removeSongFromPlaylist, deletePlaylist, deleteSongFromLibrary,
        audioRef, progress, duration, seek
    }}>
      {children}
      <audio ref={audioRef} />
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};