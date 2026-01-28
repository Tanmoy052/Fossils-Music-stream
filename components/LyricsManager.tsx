import React, { useEffect, useMemo, useState } from "react";
import { LyricsItem } from "../types";
import { lyricsApi } from "../services/lyricsApi";
import { AlbumList } from "./AlbumList";
import { SongList } from "./SongList";
import { LyricsForm } from "./LyricsForm";
import { SONGS, ALBUMS } from "../constants";

export const LyricsManager: React.FC = () => {
  const [allLyrics, setAllLyrics] = useState<LyricsItem[]>([]);
  const [albums, setAlbums] = useState<string[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingLyrics, setEditingLyrics] = useState<LyricsItem | null>(null);
  // Avoid using Player context to prevent HMR boundary errors; rely on localStorage

  useEffect(() => {
    loadLyrics();
  }, []);

  const loadLyrics = () => {
    const items = lyricsApi.getAllLyrics();
    setAllLyrics(items);
    setAlbums(lyricsApi.getUniqueAlbums());
  };

  const filteredAlbums = useMemo(() => {
    if (!searchQuery.trim()) return albums;
    return albums.filter((a) =>
      a.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [albums, searchQuery]);

  const albumLyricsMap = useMemo(() => {
    const map = new Map<string, LyricsItem[]>();
    const list = searchQuery.trim()
      ? lyricsApi.searchLyrics(searchQuery)
      : allLyrics;
    list.forEach((item) => {
      const key = item.albumName;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    });
    return map;
  }, [allLyrics, searchQuery]);

  const displayAlbums = useMemo(() => {
    if (searchQuery.trim()) {
      return Array.from(albumLyricsMap.keys());
    }
    return filteredAlbums;
  }, [filteredAlbums, searchQuery, albumLyricsMap]);

  const handleSave = (
    albumName: string,
    songName: string,
    bengaliLyrics: string,
  ) => {
    if (editingLyrics) {
      lyricsApi.updateLyrics(
        editingLyrics.id,
        albumName,
        songName,
        bengaliLyrics,
      );
    } else {
      lyricsApi.addLyrics(albumName, songName, bengaliLyrics);
    }
    setShowForm(false);
    setEditingLyrics(null);
    loadLyrics();
    setSelectedAlbum(albumName);
  };

  const handleEdit = (lyrics: LyricsItem) => {
    setEditingLyrics(lyrics);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    lyricsApi.deleteLyrics(id);
    loadLyrics();
  };

  const lastPlayed = useMemo(() => {
    try {
      const lastId = localStorage.getItem("fossils:lastPlayedSong");
      if (!lastId) return null;
      const s = SONGS.find((x) => x.id === lastId);
      return s || null;
    } catch {
      return null;
    }
  }, []);

  const lastPlayedAlbum = useMemo(() => {
    if (!lastPlayed) return null;
    return (
      ALBUMS.find(
        (a) => a.id === lastPlayed.albumId || a.name === lastPlayed.albumName,
      ) || null
    );
  }, [lastPlayed]);

  const lastPlayedHasLyrics = useMemo(() => {
    if (!lastPlayed) return false;
    const items = lyricsApi.getAllLyrics();
    return items.some(
      (l) =>
        l.albumName.toLowerCase() === lastPlayed.albumName.toLowerCase() &&
        l.songName.toLowerCase() === lastPlayed.name.toLowerCase(),
    );
  }, [lastPlayed, allLyrics]);

  return (
    <div className="flex flex-col md:flex-row bg-black text-white w-full min-h-[400px] overflow-hidden">
      <div className="w-full md:w-64 bg-zinc-950 md:border-r border-zinc-800 flex flex-col border-b md:border-b-0">
        <div className="p-4 border-b border-zinc-800">
          <h2 className="text-[clamp(1rem,2.5vw,1.25rem)] font-bold flex items-center gap-2">
            <i className="fa-solid fa-magnifying-glass"></i>
            Lyrics
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <AlbumList
            albums={filteredAlbums}
            selectedAlbum={selectedAlbum}
            onSelectAlbum={(album) =>
              setSelectedAlbum((prev) => (prev === album ? null : album))
            }
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-w-0">
        <div className="border-b border-zinc-800 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-[clamp(1.25rem,3vw,2rem)] font-black">
              Lyrics Library
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Browse albums and song-wise lyrics. Use search to filter.
            </p>
          </div>
          <button
            onClick={() => {
              setEditingLyrics(null);
              setShowForm(true);
            }}
            className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition font-semibold text-sm"
          >
            Add Lyrics
          </button>
        </div>
        {lastPlayed && lastPlayedAlbum && (
          <div className="p-6 border-b border-zinc-800 bg-zinc-900/30">
            <div className="flex items-center gap-4">
              <img
                src={lastPlayedAlbum.image}
                className="w-16 h-16 rounded-md shadow"
              />
              <div className="flex-1">
                <p className="text-xs text-zinc-400 uppercase tracking-wider">
                  Last Played
                </p>
                <p className="text-[clamp(0.95rem,2.5vw,1.125rem)] font-bold">
                  {lastPlayed.name}
                </p>
                <p className="text-xs text-zinc-500">{lastPlayed.albumName}</p>
              </div>
              <div className="flex gap-2">
                {lastPlayedHasLyrics ? (
                  <button
                    onClick={() => {
                      setSelectedAlbum(lastPlayed.albumName);
                    }}
                    className="px-3 py-2 bg-fossils-red text-white rounded-lg text-sm hover:bg-red-700 transition"
                  >
                    View Lyrics
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditingLyrics(null);
                      setShowForm(true);
                    }}
                    className="px-3 py-2 bg-zinc-800 text-white rounded-lg text-sm hover:bg-zinc-700 transition"
                  >
                    Add Lyrics
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        {!selectedAlbum ? (
          <div className="p-6 space-y-10">
            {displayAlbums.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-500 p-8">
                <div className="text-center">
                  <i className="fa-solid fa-music text-4xl mb-4 block"></i>
                  <p>No matching albums. Try another search.</p>
                </div>
              </div>
            ) : (
              displayAlbums.map((album) => {
                const items = albumLyricsMap.get(album) || [];
                if (items.length === 0) return null;
                return (
                  <div key={album} className="space-y-4">
                    <div className="px-2">
                      <h3 className="text-[clamp(1.25rem,3vw,2rem)] font-black">
                        {album}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1">
                        {items.length}{" "}
                        {items.length === 1 ? "entry" : "entries"}
                      </p>
                    </div>
                    <SongList
                      albumName={album}
                      lyrics={items}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <SongList
            albumName={selectedAlbum}
            lyrics={albumLyricsMap.get(selectedAlbum) || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
            initialSelectedSong={lastPlayed?.name || null}
          />
        )}
      </div>

      {showForm && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] p-4"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-zinc-800 p-4 flex items-center justify-between">
              <h3 className="font-bold">Add Lyrics</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-zinc-400 hover:text-white transition text-xl w-8 h-8 flex items-center justify-center hover:bg-zinc-800 rounded-lg"
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <LyricsForm
              editingLyrics={editingLyrics}
              onSave={handleSave}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
