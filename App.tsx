import React, { useState, useEffect, useCallback } from "react";
import { PlayerProvider, usePlayer } from "./components/PlayerContext";
import { Sidebar } from "./components/Sidebar";
import { Player } from "./components/Player";
import { SearchBar } from "./components/SearchBar";
import { AlbumCard } from "./components/AlbumCard";
import { AlbumDetail } from "./components/AlbumDetail";
import { LyricsManager } from "./components/LyricsManager";
import { Hero } from "./components/Hero";
import { FooterLinks } from "./components/FooterLinks";
import { HERO_BG_URL } from "./content/hero";
import { api } from "./services/api";
import { Album, Song, Playlist, ViewType } from "./types";

function AppContent() {
  const { currentSong, playSong } = usePlayer();

  const [albums, setAlbums] = useState<Album[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [activeView, setActiveView] = useState<ViewType>("home");
  const [selectedId, setSelectedId] = useState<string>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [viewData, setViewData] = useState<{
    album?: Album;
    playlist?: Playlist;
    songs: Song[];
  }>({ songs: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState({
    albums: [],
    songs: [],
  });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    api.getAlbums().then(setAlbums);
    api.getPlaylists().then(setPlaylists);
  }, []);

  const handleNavigate = useCallback(async (view: ViewType, id?: string) => {
    setActiveView(view);
    setSelectedId(id);
    setIsLoading(true);

    try {
      if (view === "album" && id) {
        const album = await api.getAlbumById(id);
        const songs = await api.getSongsByAlbum(id);
        setViewData({ album, songs: songs || [] });
      } else if (view === "playlist" && id) {
        const playlist = await api.getPlaylistById(id);
        const songs = await api.getSongsByIds(playlist?.songs || []);
        setViewData({ playlist, songs: songs || [] });
      } else {
        setViewData({ songs: [] });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      api.search(query).then(setSearchResults);
    } else {
      setSearchResults({ albums: [], songs: [] });
    }
  }, []);

  const handleStartListening = useCallback(async () => {
    if (albums.length > 0) {
      const firstAlbum = albums[0];
      const songs = await api.getSongsByAlbum(firstAlbum.id);
      if (songs && songs.length > 0) {
        playSong(songs[0], songs);
      }
    }
  }, [albums, playSong]);

  return (
    <div className="flex flex-col min-h-dvh bg-black text-white antialiased">
      <div className="flex flex-1">
        <button
          className="sm:hidden fixed top-4 left-4 z-50 p-2 bg-zinc-900 rounded-full border border-zinc-800"
          onClick={() => setSidebarOpen((s) => !s)}
        >
          <i className="fa-solid fa-bars"></i>
        </button>

        <Sidebar
          albums={albums}
          playlists={playlists}
          activeView={activeView}
          onNavigate={handleNavigate}
          selectedId={selectedId}
          isCollapsed={isSidebarCollapsed}
          isDrawerOpen={sidebarOpen}
          toggleCollapse={() => setIsSidebarCollapsed((c) => !c)}
          closeDrawer={setSidebarOpen}
        />

        <main className="flex-1 flex flex-col bg-zinc-950">
          <div className="flex-1 overflow-y-auto pb-[calc(80px+env(safe-area-inset-bottom))] scrollbar-hide">
            <div className="max-w-7xl mx-auto w-full">
              {activeView === "home" && (
                <>
                  <Hero onStartListening={handleStartListening} />

                  <div className="p-10">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                      {albums.map((album) => (
                        <AlbumCard
                          key={album.id}
                          album={album}
                          onClick={(id) => handleNavigate("album", id)}
                        />
                      ))}
                    </div>
                  </div>

                  <FooterLinks />
                </>
              )}

              {activeView === "album" && viewData.album && (
                <AlbumDetail
                  album={viewData.album}
                  songs={viewData.songs}
                  onPlaySong={(song) => playSong(song, viewData.songs)}
                />
              )}

              {activeView === "search" && (
                <div className="p-8">
                  <SearchBar onSearch={handleSearch} />
                </div>
              )}

              {activeView === "lyrics" && <LyricsManager />}
            </div>
          </div>
        </main>
      </div>

      <Player />
    </div>
  );
}

export default function App() {
  return (
    <PlayerProvider>
      <AppContent />
    </PlayerProvider>
  );
}
