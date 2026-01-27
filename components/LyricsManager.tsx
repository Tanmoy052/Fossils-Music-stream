import React, { useEffect, useMemo, useState } from "react";
import { LyricsItem } from "../types";
import { lyricsApi } from "../services/lyricsApi";
import { AlbumList } from "./AlbumList";
import { SongList } from "./SongList";
import { LyricsForm } from "./LyricsForm";

export const LyricsManager: React.FC = () => {
  const [allLyrics, setAllLyrics] = useState<LyricsItem[]>([]);
  const [albums, setAlbums] = useState<string[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingLyrics, setEditingLyrics] = useState<LyricsItem | null>(null);

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
    const q = searchQuery.toLowerCase();
    return albums.filter((a) => a.toLowerCase().includes(q));
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

  return (
    <div className="flex h-full bg-black text-white">
      <div className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col">
        <div className="p-4 border-b border-zinc-800">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <i className="fa-solid fa-magnifying-glass"></i>
            Lyrics
          </h2>
        </div>
        <div className="p-3 border-b border-zinc-800">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search album, song or text"
            className="w-full bg-zinc-800 text-white px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-fossils-red text-sm"
          />
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
        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={() => {
              setEditingLyrics(null);
              setShowForm(true);
            }}
            className="w-full bg-fossils-red text-white py-2 rounded-lg hover:bg-red-700 transition font-semibold text-sm"
          >
            <i className="fa-solid fa-plus mr-2"></i>
            Add Lyrics
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!selectedAlbum ? (
          <div className="p-6 space-y-10">
            {filteredAlbums.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-500 p-8">
                <div className="text-center">
                  <i className="fa-solid fa-music text-4xl mb-4 block"></i>
                  <p>No matching albums. Try another search.</p>
                </div>
              </div>
            ) : (
              filteredAlbums.map((album) => {
                const items = albumLyricsMap.get(album) || [];
                if (items.length === 0) return null;
                return (
                  <div key={album} className="space-y-4">
                    <div className="px-2">
                      <h3 className="text-2xl font-black">{album}</h3>
                      <p className="text-xs text-zinc-400 mt-1">
                        {items.length}{" "}
                        {items.length === 1 ? "entry" : "entries"}
                      </p>
                    </div>
                    <LyricsItems
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
