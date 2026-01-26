import React from "react";
import { usePlayer } from "./PlayerContext";

export const Player: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    progress,
    currentTime,
    volume,
    togglePlay,
    playNext,
    playPrev,
    seek,
    setVolume,
    playbackError,
    clearPlaybackError,
  } = usePlayer();

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-black/90 backdrop-blur-xl border-t border-white/10 px-5 flex items-center justify-between z-50 animate-in slide-in-from-bottom duration-500 shadow-2xl">
      <div className="flex items-center gap-4 w-1/4">
        <div className="relative group">
          <img
            src={currentSong.albumImage}
            className="w-12 h-12 rounded-md shadow-lg group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/20 rounded-md group-hover:bg-transparent transition-colors"></div>
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold truncate hover:text-fossils-red cursor-pointer transition-colors">
            {currentSong.name}
          </div>
          <div className="text-xs text-zinc-400 truncate hover:underline cursor-pointer">
            {currentSong.albumName}
          </div>
          {playbackError && (
            <div className="mt-1 text-[11px] text-red-500 flex items-center gap-2">
              <span>{playbackError}</span>
              <button
                onClick={clearPlaybackError}
                className="text-[10px] underline"
              >
                dismiss
              </button>
            </div>
          )}
        </div>
        <button className="ml-4 text-zinc-400 hover:text-fossils-red transition">
          <i className="fa-regular fa-heart"></i>
        </button>
      </div>

      <div className="flex flex-col items-center gap-1.5 max-w-[600px] w-1/2">
        <div className="flex items-center gap-5">
          <button
            className="text-zinc-400 hover:text-white transition"
            title="Shuffle"
          >
            <i className="fa-solid fa-shuffle text-sm"></i>
          </button>
          <button
            onClick={playPrev}
            className="text-zinc-300 hover:text-white transition hover:scale-110 active:scale-95"
          >
            <i className="fa-solid fa-backward-step text-xl"></i>
          </button>
          <button
            onClick={togglePlay}
            className="w-10 h-10 bg-white rounded-full text-black flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-lg hover:shadow-white/20"
          >
            <i
              className={`fa-solid ${isPlaying ? "fa-pause" : "fa-play"} ${!isPlaying && "ml-1"}`}
            ></i>
          </button>
          <button
            onClick={playNext}
            className="text-zinc-300 hover:text-white transition hover:scale-110 active:scale-95"
          >
            <i className="fa-solid fa-forward-step text-xl"></i>
          </button>
          <button
            className="text-zinc-400 hover:text-white transition"
            title="Repeat"
          >
            <i className="fa-solid fa-repeat text-sm"></i>
          </button>
        </div>
        <div className="flex items-center gap-3 w-full group">
          <span className="text-[11px] font-mono text-zinc-400 min-w-[35px] text-right">
            {formatTime(currentTime)}
          </span>
          <div className="relative flex-1 h-1 bg-zinc-800 rounded-full group cursor-pointer group/slider">
            <div
              className="absolute top-0 left-0 h-full bg-fossils-red rounded-full group-hover/slider:bg-red-500 transition-colors"
              style={{ width: `${progress}%` }}
            ></div>
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={progress}
              onChange={(e) =>
                seek(
                  (parseFloat(e.target.value) / 100) *
                    currentSong.durationSeconds,
                )
              }
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <span className="text-[11px] font-mono text-zinc-400 min-w-[35px]">
            {currentSong.duration}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-5 w-1/4">
        <button className="text-zinc-400 hover:text-white transition">
          <i className="fa-solid fa-microphone-lines"></i>
        </button>
        <button className="text-zinc-400 hover:text-white transition">
          <i className="fa-solid fa-list"></i>
        </button>
        <button className="text-zinc-400 hover:text-white transition">
          <i className="fa-solid fa-computer"></i>
        </button>
        <div className="flex items-center gap-2 w-28 group">
          <i className="fa-solid fa-volume-high text-zinc-400 text-sm group-hover:text-white transition-colors"></i>
          <div className="relative flex-1 h-1 bg-zinc-800 rounded-full">
            <div
              className="absolute top-0 left-0 h-full bg-white rounded-full group-hover:bg-fossils-red transition-colors"
              style={{ width: `${volume * 100}%` }}
            ></div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
