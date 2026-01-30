import { ALBUMS, SONGS, PLAYLISTS } from "../constants";
import { getLyricsById } from "../content/lyrics";
import { Album, Song, Playlist, Lyrics, TimedLyric } from "../types";

const albumImageForSong = (song: Song): string => {
  const album = ALBUMS.find(
    (a) => a.id === song.albumId || a.name === song.albumName,
  );
  return album?.image || song.albumImage;
};

const normalize = (value: string) => value.toLowerCase().replace(/\s+/g, "");

const matchesQuery = (target: string, query: string) => {
  const q = normalize(query);
  if (!q) return false;

  const targetNorm = normalize(target);
  if (targetNorm.includes(q) || q.includes(targetNorm)) return true;

  const digitsMatch = targetNorm.match(/\d+/);
  if (digitsMatch) {
    const digits = digitsMatch[0];
    const lettersInTarget = targetNorm.replace(/\d+/g, "");
    const lettersInQuery = q.replace(/\d+/g, "");

    if (q.includes(digits) && (lettersInTarget.includes(lettersInQuery) || lettersInQuery.includes(lettersInTarget))) {
      return true;
    }
  }

  return false;
};

export const api = {
  getAlbums: async (): Promise<Album[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(ALBUMS), 200));
  },

  getAlbumById: async (id: string): Promise<Album | undefined> => {
    return ALBUMS.find((a) => a.id === id);
  },

  getSongsByAlbum: async (albumId: string): Promise<Song[]> => {
    const songs = SONGS.filter((s) => s.albumId === albumId);
    const available = songs.filter((s) => s.audioUrl.startsWith("/audio/"));
    return available.map((s) => ({
      ...s,
      albumImage: albumImageForSong(s),
    }));
  },

  getPlaylists: async (): Promise<Playlist[]> => {
    return new Promise((resolve) => resolve(PLAYLISTS));
  },

  getPlaylistById: async (id: string): Promise<Playlist | undefined> => {
    return PLAYLISTS.find((p) => p.id === id);
  },

  getSongsByIds: async (ids: string[]): Promise<Song[]> => {
    const songs = SONGS.filter((s) => ids.includes(s.id));
    const available = songs.filter((s) => s.audioUrl.startsWith("/audio/"));
    return available.map((s) => ({
      ...s,
      albumImage: albumImageForSong(s),
    }));
  },

  search: async (
    query: string,
  ): Promise<{ albums: Album[]; songs: Song[] }> => {
    const q = query.toLowerCase();

    const filteredAlbums = ALBUMS.filter((a) => {
      return (
        a.name.toLowerCase().includes(q) || 
        matchesQuery(a.name, query) ||
        (a.description && a.description.toLowerCase().includes(q))
      );
    });

    const filteredSongsBase = SONGS.filter((s) => {
      const nameMatch = s.name.toLowerCase().includes(q) || matchesQuery(s.name, query);
      const albumNameMatch = s.albumName.toLowerCase().includes(q) || matchesQuery(s.albumName, query);
      const artistMatch = s.artist && (s.artist.toLowerCase().includes(q) || matchesQuery(s.artist, query));
      
      return nameMatch || albumNameMatch || artistMatch;
    });

    const filteredSongs = filteredSongsBase
      .filter((s) => s.audioUrl.startsWith("/audio/"))
      .map((s) => ({
        ...s,
        albumImage: albumImageForSong(s),
      }));

    return { albums: filteredAlbums, songs: filteredSongs };
  },

  getLyricsBySongId: async (songId: string): Promise<Lyrics> => {
    const rawLines = getLyricsById(songId);
    const lines: TimedLyric[] = rawLines.map((l) => ({
      time: l.time,
      text: l.text,
    }));
    return { songId, lines };
  },
};
