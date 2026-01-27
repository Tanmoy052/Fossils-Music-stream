import React, { useState, useEffect } from 'react';
import { LyricsItem } from '../types';
import { lyricsApi } from '../services/lyricsApi';
import { LyricsForm } from './LyricsForm';
import { AlbumList } from './AlbumList';
import { SongList } from './SongList';
import { LyricsItems } from './LyricsItems';

export const LyricsManager: React.FC = () => {
  const [allLyrics, setAllLyrics] = useState<LyricsItem[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingLyrics, setEditingLyrics] = useState<LyricsItem | null>(null);

  useEffect(() => {
    loadLyrics();
  }, []);

  const loadLyrics = () => {
    setAllLyrics(lyricsApi.getAllLyrics());
  };

  const filteredLyrics = searchQuery
    ? lyricsApi.searchLyrics(searchQuery)
    : selectedAlbum
      ? lyricsApi.getLyricsByAlbum(selectedAlbum)
      : allLyrics;

  const albums = lyricsApi.getUniqueAlbums();

  const handleAddLyrics = (
    albumName: string,
    songName: string,
    bengaliLyrics: string
  ) => {
    if (editingLyrics) {
      lyricsApi.updateLyrics(
        editingLyrics.id,
        albumName,
        songName,
        bengaliLyrics
      );
    } else {
      lyricsApi.addLyrics(albumName, songName, bengaliLyrics);
    }
    loadLyrics();
    setShowForm(false);
    setEditingLyrics(null);
  };

  const handleDeleteLyrics = (id: string) => {
    if (confirm('Are you sure you want to delete this lyrics entry?')) {
      lyricsApi.deleteLyrics(id);
      loadLyrics();
    }
  };

  const handleEditLyrics = (lyrics: LyricsItem) => {
    setEditingLyrics(lyrics);
    setShowForm(true);
  };

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col overflow-hidden">
        {/* Section 1: Lyrics Header */}
        <div className="p-4 border-b-2 border-zinc-800 flex-shrink-0">
          <h2 className="text-xl font-bold text-fossils-red flex items-center gap-2">
            <i className="fa-solid fa-music"></i>
            Lyrics
          </h2>
        </div>

        {/* Section 2: Albums List */}
        <div className="flex-1 flex flex-col overflow-hidden border-b-2 border-zinc-800">
          <div className="p-4 pb-2 flex-shrink-0">
            <p className="text-xs text-zinc-400 uppercase tracking-widest font-semibold">
              ALBUMS
            </p>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-4">
            <AlbumList
              albums={albums}
              selectedAlbum={selectedAlbum}
              onSelectAlbum={setSelectedAlbum}
            />
          </div>
        </div>

        {/* Section 3: Add Lyrics Button */}
        <div className="p-4 flex-shrink-0">
          <button
            onClick={() => {
              setShowForm(true);
              setEditingLyrics(null);
            }}
            className="w-full bg-fossils-red text-white py-2 rounded-lg hover:bg-red-700 transition font-semibold text-sm"
          >
            <i className="fa-solid fa-plus mr-2"></i>
            Add Lyrics
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex-shrink-0">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search lyrics by album, song, or text..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedAlbum(null);
                }}
                className="w-full bg-zinc-800 text-white px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-fossils-red text-sm"
              />
              <i className="fa-solid fa-search absolute right-3 top-2.5 text-zinc-400 text-sm"></i>
            </div>
            <button
              onClick={() => setSelectedAlbum(null)}
              className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition text-sm whitespace-nowrap"
            >
              Clear Filter
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {showForm ? (
            <LyricsForm
              editingLyrics={editingLyrics}
              onSave={handleAddLyrics}
              onCancel={() => {
                setShowForm(false);
                setEditingLyrics(null);
              }}
            />
          ) : selectedAlbum && !searchQuery ? (
            <SongList
              albumName={selectedAlbum}
              lyrics={lyricsApi.getLyricsByAlbum(selectedAlbum)}
              onEdit={handleEditLyrics}
              onDelete={handleDeleteLyrics}
            />
          ) : (
            <LyricsItems
              lyrics={filteredLyrics}
              onEdit={handleEditLyrics}
              onDelete={handleDeleteLyrics}
            />
          )}
        </div>
      </div>
    </div>
  );
};
