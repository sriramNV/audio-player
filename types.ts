export interface Song {
  id: string;
  name: string;
  artist?: string;
  album?: string;
  duration: number;
  url: string;
  albumArtUrl?: string;
}

export interface Playlist {
  id: string;
  name:string;
  songIds: string[];
}

export type View = 
  | { type: 'library' }
  | { type: 'playlist', id: string };
