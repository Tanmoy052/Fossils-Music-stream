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

const matchesAlbumQuery = (albumName: string, query: string) => {
  const q = normalize(query);
  if (!q) return false;

  const nameNorm = normalize(albumName);
  if (nameNorm.includes(q) || q.includes(nameNorm)) return true;

  const digitsMatch = nameNorm.match(/\d+/);
  if (digitsMatch) {
    const digits = digitsMatch[0];
    const lettersInName = nameNorm.replace(/\d+/g, "");
    const lettersInQuery = q.replace(/\d+/g, "");

    if (q.includes(digits) && lettersInName.startsWith(lettersInQuery)) {
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
    return SONGS.filter((s) => s.albumId === albumId).map((s) => ({
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
    return SONGS.filter((s) => ids.includes(s.id)).map((s) => ({
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
        a.name.toLowerCase().includes(q) || matchesAlbumQuery(a.name, query)
      );
    });

    const filteredSongsBase = SONGS.filter((s) => {
      const nameMatch = s.name.toLowerCase().includes(q);
      const albumNameMatch = s.albumName.toLowerCase().includes(q);
      const albumAliasMatch = matchesAlbumQuery(s.albumName, query);
      return nameMatch || albumNameMatch || albumAliasMatch;
    });

    const filteredSongs = filteredSongsBase.map((s) => ({
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
