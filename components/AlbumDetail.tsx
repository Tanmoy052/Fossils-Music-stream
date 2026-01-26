import React from "react";
import { Album, Song } from "../types";
import { usePlayer } from "./PlayerContext";
import { AVATAR_URL } from "../content/media";

interface AlbumDetailProps {
  album: Album;
  songs: Song[];
  onPlaySong: (song: Song) => void;
}

export const AlbumDetail: React.FC<AlbumDetailProps> = ({
  album,
  songs,
  onPlaySong,
}) => {
  const { isPlaying, currentSong, showLyrics } = usePlayer();
  if (!album) return null;

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-zinc-800/50 to-transparent p-8 overflow-y-auto animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col md:flex-row gap-8 items-end mb-8">
        <img
          src={album.image}
          alt={album.name}
          className="w-64 h-64 rounded-md shadow-2xl"
        />
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider">
            Album
          </span>
          <h1 className="text-5xl md:text-8xl font-black">{album.name}</h1>
          <div className="flex items-center gap-2 mt-4">
            <img
              src={AVATAR_URL}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="font-bold">Rupam Islam & Fossils</span>
            {album.releaseYear && (
              <span className="text-zinc-400">• {album.releaseYear}</span>
            )}
            <span className="text-zinc-400">• {songs.length} songs</span>
          </div>
        </div>
      </div>

      <div className="mb-8 flex items-center gap-6">
        {songs.length > 0 ? (
          <button
            onClick={() => songs[0] && onPlaySong(songs[0])}
            className="w-14 h-14 bg-fossils-red rounded-full flex items-center justify-center hover:scale-105 transition shadow-lg"
          >
            <i
              className={`fa-solid ${isPlaying && currentSong?.albumId === album.id ? "fa-pause" : "fa-play"} text-white text-2xl ${!isPlaying && "ml-1"}`}
            ></i>
          </button>
        ) : (
          <div className="px-6 py-3 bg-zinc-800 rounded-full text-zinc-400 font-bold">
            Coming Soon
          </div>
        )}
        <button className="text-3xl text-zinc-400 hover:text-white transition">
          <i className="fa-regular fa-heart"></i>
        </button>
        <button className="text-3xl text-zinc-400 hover:text-white transition">
          <i className="fa-solid fa-ellipsis"></i>
        </button>
      </div>

      <div className="flex flex-col">
        {songs.length > 0 ? (
          <>
            <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-2 border-b border-zinc-800 text-zinc-400 text-sm font-semibold uppercase tracking-wider mb-2">
              <div className="w-8 text-right">#</div>
              <div>Title</div>
              <div className="w-12 text-center">
                <i className="fa-regular fa-clock"></i>
              </div>
              <div className="w-16 text-center">Lyrics</div>
            </div>
            {songs.map((song, index) => {
              const isCurrent = currentSong?.id === song.id;
              return (
                <div
                  key={song.id}
                  className={`grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-3 rounded-md group transition-colors duration-200 ${isCurrent ? "bg-white/10" : "hover:bg-white/10"}`}
                >
                  <div
                    className={`w-8 text-right flex items-center justify-end font-medium ${isCurrent ? "text-fossils-red" : "text-zinc-400 group-hover:text-white"}`}
                  >
                    {isCurrent && isPlaying ? (
                      <i className="fa-solid fa-chart-simple animate-pulse"></i>
                    ) : (
                      <span className="group-hover:hidden">{index + 1}</span>
                    )}
                    <i
                      className={`fa-solid fa-play text-sm ${isCurrent && isPlaying ? "hidden" : "hidden group-hover:block"}`}
                    ></i>
                  </div>
                  <div
                    className="flex flex-col cursor-pointer"
                    onClick={() => onPlaySong(song)}
                  >
                    <span
                      className={`font-medium ${isCurrent ? "text-fossils-red" : "text-white group-hover:text-fossils-red transition-colors"}`}
                    >
                      {song.name}
                    </span>
                    <span className="text-sm text-zinc-400">
                      Rupam Islam & Fossils
                    </span>
                  </div>
                  <div className="w-12 text-center text-zinc-400 text-sm flex items-center justify-center">
                    {song.duration}
                  </div>
                  <div className="w-16 flex items-center justify-center">
                    <button
                      onClick={() => showLyrics(song)}
                      className="px-3 py-1 rounded-full text-xs bg-zinc-800 hover:bg-zinc-700 text-white transition"
                    >
                      Lyrics
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <i className="fa-solid fa-compact-disc text-6xl mb-4 opacity-20"></i>
            <h3 className="text-xl font-bold">Stay Tuned</h3>
            <p>The tracks for {album.name} will be available upon release.</p>
          </div>
        )}
      </div>
    </div>
  );
};
