import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Album, Playlist } from "../types";

interface SidebarProps {
  albums: Album[];
  playlists: Playlist[];
  isCollapsed?: boolean;
  isDrawerOpen?: boolean;
  toggleCollapse?: () => void;
  closeDrawer?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  albums,
  playlists,
  isCollapsed = false,
  isDrawerOpen = false,
  toggleCollapse,
  closeDrawer,
}) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  const handleLinkClick = () => {
    closeDrawer && closeDrawer(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 sm:hidden transition-opacity"
          onClick={() => closeDrawer && closeDrawer(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out
        ${isDrawerOpen ? "translate-x-0" : "-translate-x-full"} 
        sm:translate-x-0 sm:static sm:z-auto 
        ${isCollapsed ? "w-16" : "w-64"} flex flex-col h-full border-r border-zinc-800 shrink-0 bg-zinc-950`}
      >
        <div className="p-6 pb-0 relative">
          <button
            className="hidden md:block absolute top-2 right-2 p-2 bg-zinc-900 rounded-full"
            onClick={() => toggleCollapse && toggleCollapse()}
            aria-label="Toggle sidebar"
          >
            <i
              className={`fa-solid ${
                isCollapsed ? "fa-chevron-right" : "fa-chevron-left"
              } text-white`}
            ></i>
          </button>
          <Link
            to="/"
            className="mb-10 cursor-pointer group block"
            onClick={handleLinkClick}
          >
            <div className="tracking-tighter flex flex-col">
              <span className="font-black text-white text-[clamp(1.75rem,4vw,2.5rem)]">
                {!isCollapsed && "FOSSILS"}
              </span>
              {!isCollapsed && (
                <span className="text-[clamp(0.9rem,2.5vw,1.1rem)] font-bold text-zinc-500 group-hover:text-white transition-colors">
                  ফসিলস
                </span>
              )}
            </div>
            {!isCollapsed && (
              <div className="h-1 w-12 bg-spotify-green mt-2 group-hover:w-full transition-all duration-500"></div>
            )}
          </Link>

          <nav className="space-y-4 mb-8">
            <Link
              to="/"
              onClick={handleLinkClick}
              className={`flex items-center gap-4 w-full text-left font-semibold transition hover:text-white ${isActive("/") ? "text-fossils-red" : "text-zinc-300"}`}
            >
              <i className="fa-solid fa-house text-xl"></i>
              {!isCollapsed && "Home"}
            </Link>
            <Link
              to="/search"
              onClick={handleLinkClick}
              className={`flex items-center gap-4 w-full text-left font-semibold transition hover:text-white ${isActive("/search") ? "text-fossils-red" : "text-zinc-300"}`}
            >
              <i className="fa-solid fa-magnifying-glass text-xl"></i>
              {!isCollapsed && "Search"}
            </Link>
            <Link
              to="/lyrics"
              onClick={handleLinkClick}
              className={`flex items-center gap-4 w-full text-left font-semibold transition hover:text-white ${isActive("/lyrics") ? "text-fossils-red" : "text-zinc-300"}`}
            >
              <i className="fa-solid fa-music text-xl"></i>
              {!isCollapsed && "Lyrics"}
            </Link>
          </nav>
        </div>

        <div className="flex-1 overflow-y-auto px-6 space-y-8 pb-40">
          <div>
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <i className="fa-solid fa-layer-group"></i>
              {!isCollapsed && "Your Playlists"}
            </div>
            <div className="space-y-2">
              {playlists.map((pl) => (
                <Link
                  key={pl.id}
                  to={`/playlist/${pl.id}`}
                  onClick={handleLinkClick}
                  className={`block w-full text-left text-sm font-medium transition-colors hover:text-white truncate py-1 ${currentPath === `/playlist/${pl.id}` ? "text-fossils-red" : "text-zinc-300"}`}
                >
                  {!isCollapsed && pl.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-bold text-zinc-200 uppercase tracking-widest mb-4 flex items-center gap-2">
              <i className="fa-solid fa-record-vinyl"></i>
              {!isCollapsed && "ALL ALBUMS"}
            </div>
            <div className="space-y-2">
              {albums.map((album) => (
                <Link
                  key={album.id}
                  to={`/album/${album.id}`}
                  onClick={handleLinkClick}
                  className={`block w-full text-left text-sm font-medium transition-colors hover:text-white truncate py-1 ${currentPath === `/album/${album.id}` ? "text-fossils-red" : "text-zinc-300"}`}
                >
                  {!isCollapsed && album.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
