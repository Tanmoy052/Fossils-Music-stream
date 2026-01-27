import React, { useState } from "react";
import { Album, Song } from "../types";
import { usePlayer } from "./PlayerContext";

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
  const { currentSong, isPlaying, togglePlay } = usePlayer();
  const [isLiked, setIsLiked] = useState(false);

  if (!album) return null;

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-zinc-800/50 to-black p-8 overflow-y-auto animate-in fade-in zoom-in-95 duration-500">
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
              src="data:image/jpeg;base64,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"
              className="w-6 h-6 rounded-full"
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
            onClick={() => {
              if (currentSong?.albumId === album.id) {
                togglePlay();
              } else {
                onPlaySong(songs[0]);
              }
            }}
            className="w-14 h-14 bg-fossils-red rounded-full flex items-center justify-center hover:scale-105 transition shadow-lg"
          >
            <i
              className={`fa-solid ${isPlaying && currentSong?.albumId === album.id ? "fa-pause" : "fa-play"} text-white text-2xl ${!(isPlaying && currentSong?.albumId === album.id) && "ml-1"}`}
            ></i>
          </button>
        ) : (
          <div className="px-6 py-3 bg-zinc-800 rounded-full text-zinc-400 font-bold">
            Coming Soon
          </div>
        )}
        <button
          className={`text-3xl transition ${isLiked ? "text-fossils-red" : "text-zinc-400 hover:text-white"}`}
          onClick={() => setIsLiked(!isLiked)}
        >
          <i className={`${isLiked ? "fa-solid" : "fa-regular"} fa-heart`}></i>
        </button>
        <button className="text-3xl text-zinc-400 hover:text-white transition">
          <i className="fa-solid fa-ellipsis"></i>
        </button>
      </div>

      <div className="flex flex-col">
        {songs.length > 0 ? (
          <>
            <div className="grid grid-cols-[auto_1fr_auto] gap-4 px-4 py-2 border-b border-zinc-800 text-zinc-400 text-sm font-semibold uppercase tracking-wider mb-2">
              <div className="w-8 text-right">#</div>
              <div>Title</div>
              <div className="w-12 text-center">
                <i className="fa-regular fa-clock"></i>
              </div>
            </div>
            {songs.map((song, index) => {
              const isCurrent = currentSong?.id === song.id;
              return (
                <div
                  key={song.id}
                  onClick={() => onPlaySong(song)}
                  className={`grid grid-cols-[auto_1fr_auto] gap-4 px-4 py-3 rounded-md group cursor-pointer transition-colors duration-200 ${isCurrent ? "bg-white/10" : "hover:bg-white/10"}`}
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
                  <div className="flex flex-col">
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
