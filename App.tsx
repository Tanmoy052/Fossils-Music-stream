import React, { useState, useEffect, useCallback } from "react";
import { PlayerProvider, usePlayer } from "./components/PlayerContext";
import { Sidebar } from "./components/Sidebar";
import { Player } from "./components/Player";
import { SearchBar } from "./components/SearchBar";
import { AlbumCard } from "./components/AlbumCard";
import { AlbumDetail } from "./components/AlbumDetail";
import { LyricsManager } from "./components/LyricsManager";
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
  const [searchResults, setSearchResults] = useState<{
    albums: Album[];
    songs: Song[];
  }>({ albums: [], songs: [] });
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
    } catch (err) {
      console.error("Navigation error:", err);
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

  return (
    <div className="flex flex-col h-screen select-none bg-black text-white antialiased overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        <button
          className="sm:hidden fixed top-4 left-4 z-50 p-2 bg-zinc-900 rounded-full border border-zinc-800"
          onClick={() => setSidebarOpen((s) => !s)}
          aria-label="Open sidebar"
        >
          <i className="fa-solid fa-bars text-white"></i>
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
          closeDrawer={(open) => setSidebarOpen(open)}
        />

        <main className="flex-1 flex flex-col relative bg-zinc-950 overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-fossils-red border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-zinc-300 font-medium">Loading...</p>
              </div>
            </div>
          )}
          <div className="flex-1 overflow-y-auto pb-0 scrollbar-hide">
            <div className="max-w-7xl mx-auto w-full">
            {activeView === "home" && (
              <div className="flex flex-col animate-in fade-in duration-700">
                <div className="relative h-[420px] w-full bg-fossils-gradient flex items-end p-8 border-b border-white/5 shadow-2xl overflow-hidden group">
                  <div
                    className="absolute inset-0 bg-cover bg-center mix-blend-multiply opacity-60 group-hover:scale-105 transition-transform duration-[2s] filter brightness-125 contrast-125 saturate-150"
                    style={{ backgroundImage: `url(${HERO_BG_URL})` }}
                  ></div>
                  <div className="absolute inset-0 hero-gradient"></div>

                  <div className="relative z-20 w-full flex flex-col md:flex-row items-end justify-between gap-8">
                    <div className="animate-in slide-in-from-left duration-700">
                      <span className="text-fossils-red font-bold tracking-[0.5em] text-xs mb-3 block uppercase">
                        The Legend Returns
                      </span>
                      <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter glow-text mb-3 drop-shadow-2xl">
                        FOSSILS
                      </h1>
                      <p className="text-lg md:text-xl font-medium text-zinc-300 max-w-2xl leading-relaxed">
                        The raw energy of Bengali Rock.{" "}
                        <span className="text-fossils-red">29+ Years</span> of
                        revolutionizing the underground scene.
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        albums[0] && handleNavigate("album", albums[0].id)
                      }
                      className="bg-fossils-red text-white px-10 py-5 rounded-full font-bold text-lg hover:scale-110 hover:shadow-[0_0_40px_rgba(139,0,0,0.6)] active:scale-95 transition-all duration-300 shadow-2xl flex items-center gap-4 animate-in slide-in-from-right duration-700 delay-100 group/btn"
                    >
                      <span className="bg-white text-fossils-red rounded-full w-8 h-8 flex items-center justify-center group-hover/btn:rotate-90 transition-transform">
                        <i className="fa-solid fa-play ml-1"></i>
                      </span>{" "}
                      START LISTENING
                    </button>
                  </div>
                </div>

                <div className="p-10 pb-32">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-4xl font-black tracking-tight">
                      Discography
                    </h2>
                    <div className="flex gap-2">
                      <button className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-white hover:text-black transition">
                        <i className="fa-solid fa-chevron-left"></i>
                      </button>
                      <button className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-white hover:text-black transition">
                        <i className="fa-solid fa-chevron-right"></i>
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                    {albums.map((album, idx) => (
                      <div
                        key={album.id}
                        className="animate-in fade-in slide-in-from-bottom-4 duration-700"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <AlbumCard
                          album={album}
                          onClick={(id) => handleNavigate("album", id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <FooterLinks />
              </div>
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                  {searchResults.songs.map((song) => (
                    <div
                      key={song.id}
                      onClick={() => playSong(song, searchResults.songs)}
                      className="bg-zinc-900 p-4 rounded-lg hover:bg-zinc-800 cursor-pointer group"
                    >
                      <img
                        src={song.albumImage}
                        className="w-full aspect-square rounded-md mb-4"
                      />
                      <div className="font-bold group-hover:text-fossils-red">
                        {song.name}
                      </div>
                      <div className="text-xs text-zinc-500 uppercase">
                        {song.albumName}
                      </div>
                    </div>
                  ))}
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
