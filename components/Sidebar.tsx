import React from "react";
import { Album, Playlist, ViewType } from "../types";

interface SidebarProps {
  albums: Album[];
  playlists: Playlist[];
  activeView: ViewType;
  onNavigate: (view: ViewType, id?: string) => void;
  selectedId?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  albums,
  playlists,
  activeView,
  onNavigate,
  selectedId,
}) => {
  return (
    <div className="w-64 bg-black flex flex-col h-full border-r border-zinc-800 shrink-0">
      <div className="p-6 pb-0">
        <div
          className="mb-10 cursor-pointer group"
          onClick={() => onNavigate("home")}
        >
          <div className="text-3xl font-black text-white tracking-tighter flex flex-col">
            <span className="text-spotify-green">FOSSILS</span>
            <span className="text-lg font-bold text-zinc-500 group-hover:text-white transition-colors">
              ফসিলস
            </span>
          </div>
          <div className="h-1 w-12 bg-spotify-green mt-2 group-hover:w-full transition-all duration-500"></div>
        </div>

        <nav className="space-y-4 mb-8">
          <button
            onClick={() => onNavigate("home")}
            className={`flex items-center gap-4 w-full text-left font-semibold transition hover:text-white ${activeView === "home" ? "text-white" : "text-zinc-400"}`}
          >
            <i className="fa-solid fa-house text-xl"></i>
            Home
          </button>
          <button
            onClick={() => onNavigate("search")}
            className={`flex items-center gap-4 w-full text-left font-semibold transition hover:text-white ${activeView === "search" ? "text-white" : "text-zinc-400"}`}
          >
            <i className="fa-solid fa-magnifying-glass text-xl"></i>
            Search
          </button>
          <button
            onClick={() => onNavigate("lyrics")}
            className={`flex items-center gap-4 w-full text-left font-semibold transition hover:text-white ${activeView === "lyrics" ? "text-white" : "text-zinc-400"}`}
          >
            <i className="fa-solid fa-music text-xl"></i>
            Lyrics
          </button>
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-8 pb-40">
        <div>
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <i className="fa-solid fa-layer-group"></i> Your Playlists
          </div>
          <div className="space-y-2">
            {playlists.map((pl) => (
              <button
                key={pl.id}
                onClick={() => onNavigate("playlist", pl.id)}
                className={`block w-full text-left text-sm font-medium transition-colors hover:text-white truncate py-1 ${selectedId === pl.id ? "text-spotify-green" : "text-zinc-400"}`}
              >
                {pl.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <i className="fa-solid fa-record-vinyl"></i> All Albums
          </div>
          <div className="space-y-2">
            {albums.map((album) => (
              <button
                key={album.id}
                onClick={() => onNavigate("album", album.id)}
                className={`block w-full text-left text-sm font-medium transition-colors hover:text-white truncate py-1 ${selectedId === album.id ? "text-spotify-green" : "text-zinc-400"}`}
              >
                {album.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
