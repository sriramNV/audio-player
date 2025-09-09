import { Song, Playlist } from '../types';

const DB_NAME = 'react-music-player';
const DB_VERSION = 1;
const SONGS_STORE = 'songs';
const SONG_FILES_STORE = 'song_files';
const PLAYLISTS_STORE = 'playlists';

let db: IDBDatabase;

interface SongMetadata extends Omit<Song, 'url' | 'albumArtUrl'> {
    albumArt?: Blob;
}

export const initDB = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Error opening DB', request.error);
      reject(false);
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(true);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(SONGS_STORE)) {
        db.createObjectStore(SONGS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(SONG_FILES_STORE)) {
          db.createObjectStore(SONG_FILES_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(PLAYLISTS_STORE)) {
        db.createObjectStore(PLAYLISTS_STORE, { keyPath: 'id' });
      }
    };
  });
};

export const addSongs = (songs: {metadata: SongMetadata, file: File}[]): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!db) reject('DB not initialized');
        const transaction = db.transaction([SONGS_STORE, SONG_FILES_STORE], 'readwrite');
        const songsStore = transaction.objectStore(SONGS_STORE);
        const songFilesStore = transaction.objectStore(SONG_FILES_STORE);
        
        songs.forEach(song => {
            songsStore.put(song.metadata);
            songFilesStore.put({ id: song.metadata.id, file: song.file });
        });

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};

export const getAllSongs = (): Promise<Song[]> => {
    return new Promise((resolve, reject) => {
        if (!db) reject('DB not initialized');
        const transaction = db.transaction([SONGS_STORE, SONG_FILES_STORE], 'readonly');
        const songsStore = transaction.objectStore(SONGS_STORE);
        const songFilesStore = transaction.objectStore(SONG_FILES_STORE);

        const songsRequest = songsStore.getAll();

        songsRequest.onsuccess = () => {
            const songMetadata: SongMetadata[] = songsRequest.result;
            const songsWithUrls: Song[] = [];
            let processedCount = 0;
            
            if(songMetadata.length === 0) {
                resolve([]);
                return;
            }

            songMetadata.forEach(meta => {
                const fileRequest = songFilesStore.get(meta.id);
                fileRequest.onsuccess = () => {
                    const fileRecord = fileRequest.result;
                    if(fileRecord && fileRecord.file) {
                        const url = URL.createObjectURL(fileRecord.file);
                        const albumArtUrl = meta.albumArt ? URL.createObjectURL(meta.albumArt) : undefined;
                        const { albumArt, ...restOfMeta } = meta;
                        songsWithUrls.push({ ...restOfMeta, url, albumArtUrl });
                    }
                    processedCount++;
                    if (processedCount === songMetadata.length) {
                        resolve(songsWithUrls);
                    }
                };
                fileRequest.onerror = () => {
                    processedCount++;
                    if (processedCount === songMetadata.length) {
                        resolve(songsWithUrls);
                    }
                }
            });
        };
        songsRequest.onerror = () => reject(songsRequest.error);
    });
};


export const savePlaylist = (playlist: Playlist): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!db) reject('DB not initialized');
        const transaction = db.transaction([PLAYLISTS_STORE], 'readwrite');
        const store = transaction.objectStore(PLAYLISTS_STORE);
        store.put(playlist);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};

export const getAllPlaylists = (): Promise<Playlist[]> => {
    return new Promise((resolve, reject) => {
        if (!db) reject('DB not initialized');
        const transaction = db.transaction([PLAYLISTS_STORE], 'readonly');
        const store = transaction.objectStore(PLAYLISTS_STORE);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
};

export const deletePlaylist = (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!db) reject('DB not initialized');
        const transaction = db.transaction([PLAYLISTS_STORE], 'readwrite');
        const store = transaction.objectStore(PLAYLISTS_STORE);
        store.delete(id);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};
