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
                <div className="flex flex-col min-h-full">
                  <SearchBar onSearch={handleSearch} />

                  <div className="p-8">
                    {searchQuery ? (
                      <div className="space-y-12">
                        {/* Albums Results */}
                        {searchResults.albums.length > 0 && (
                          <section>
                            <h2 className="text-2xl font-bold mb-6">Albums</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                              {searchResults.albums.map((album: Album) => (
                                <AlbumCard
                                  key={album.id}
                                  album={album}
                                  onClick={(id) => handleNavigate("album", id)}
                                />
                              ))}
                            </div>
                          </section>
                        )}

                        {/* Songs Results */}
                        {searchResults.songs.length > 0 && (
                          <section>
                            <h2 className="text-2xl font-bold mb-6">Songs</h2>
                            <div className="flex flex-col">
                              <div className="grid grid-cols-[auto_1fr_auto] gap-4 px-4 py-2 border-b border-zinc-800 text-zinc-400 text-sm font-semibold uppercase tracking-wider mb-2">
                                <div className="w-8 text-right">#</div>
                                <div>Title</div>
                                <div className="w-12 text-center">
                                  <i className="fa-regular fa-clock"></i>
                                </div>
                              </div>
                              {searchResults.songs.map(
                                (song: Song, index: number) => {
                                  const isCurrent = currentSong?.id === song.id;
                                  return (
                                    <div
                                      key={song.id}
                                      onClick={() =>
                                        playSong(song, searchResults.songs)
                                      }
                                      className={`grid grid-cols-[auto_1fr_auto] gap-4 px-4 py-3 rounded-md group cursor-pointer transition-colors duration-200 ${isCurrent ? "bg-white/10" : "hover:bg-white/10"}`}
                                    >
                                      <div
                                        className={`w-8 text-right flex items-center justify-end font-medium ${isCurrent ? "text-fossils-red" : "text-zinc-400 group-hover:text-white"}`}
                                      >
                                        {index + 1}
                                      </div>
                                      <div className="flex items-center gap-4">
                                        <img
                                          src={song.albumImage}
                                          className="w-10 h-10 rounded"
                                          alt=""
                                        />
                                        <div className="flex flex-col min-w-0">
                                          <span
                                            className={`font-medium truncate ${isCurrent ? "text-fossils-red" : "text-white"}`}
                                          >
                                            {song.name}
                                          </span>
                                          <span className="text-sm text-zinc-400 truncate group-hover:text-zinc-300">
                                            {song.artist ||
                                              "Rupam Islam & Fossils"}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="w-12 flex items-center justify-center text-zinc-400 text-sm">
                                        {song.duration}
                                      </div>
                                    </div>
                                  );
                                },
                              )}
                            </div>
                          </section>
                        )}

                        {searchResults.albums.length === 0 &&
                          searchResults.songs.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                              <i className="fa-solid fa-magnifying-glass text-5xl mb-4 opacity-20"></i>
                              <h3 className="text-xl font-medium">
                                No results found for "{searchQuery}"
                              </h3>
                              <p>
                                Check the spelling or try searching for
                                something else.
                              </p>
                            </div>
                          )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                        <i className="fa-solid fa-music text-5xl mb-4 opacity-20"></i>
                        <h3 className="text-xl font-medium">
                          Search for your favorite songs
                        </h3>
                        <p>Find albums and tracks from Fossils.</p>
                      </div>
                    )}
                  </div>
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
