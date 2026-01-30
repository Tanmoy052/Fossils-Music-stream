
export interface Album {
  id: string;
  name: string;
  image: string;
  releaseYear: string;
  description?: string;
}

export interface TimedLyric {
  time: number; // seconds
  text: string;
}

export interface Song {
  id: string;
  name: string;
  albumId: string;
  albumName: string;
  albumImage: string;
  audioUrl: string;
  duration: string;
  durationSeconds: number;
  trackNumber: number;
  artist?: string;
  lyricsTimed?: TimedLyric[];
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  image: string;
  songs: string[]; // Song IDs
}

export interface Lyrics {
  songId: string;
  lines: TimedLyric[];
}

export interface LyricsItem {
  id: string;
  albumName: string;
  songName: string;
  bengaliLyrics: string;
  createdAt: number;
}

export type ViewType = 'home' | 'album' | 'search' | 'playlist' | 'lyrics';

export interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  progress: number;
  volume: number;
  queue: Song[];
  playSong: (song: Song, contextSongs?: Song[]) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrev: () => void;
  seek: (time: number) => void;
  setVolume: (v: number) => void;
  addToQueue: (song: Song) => void;
}
