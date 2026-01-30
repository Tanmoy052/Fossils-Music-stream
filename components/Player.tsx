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
  } = usePlayer();

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!currentSong)
    return (
      <div className="fixed bottom-0 left-0 z-50 h-[80px] w-full bg-black border-t border-zinc-800 flex items-center justify-center text-zinc-600 italic">
        Select a frequency to begin...
      </div>
    );

  return (
    <div className="fixed bottom-0 left-0 z-50 h-[80px] w-full bg-black border-t border-zinc-800 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4 w-1/4">
        <img
          src={currentSong.albumImage}
          className="w-14 h-14 rounded shadow-2xl"
        />
        <div className="min-w-0">
          <div className="text-sm font-bold truncate hover:underline cursor-pointer">
            {currentSong.name}
          </div>
          <div className="text-xs text-zinc-500 truncate">
            {currentSong.albumName}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 max-w-[700px] w-1/2">
        <div className="flex items-center gap-8">
          <button
            onClick={playPrev}
            className="text-zinc-400 hover:text-white transition"
          >
            <i className="fa-solid fa-backward-step text-xl"></i>
          </button>
          <button
            onClick={togglePlay}
            className="w-10 h-10 bg-white rounded-full text-black flex items-center justify-center hover:scale-105 transition"
          >
            <i
              className={`fa-solid ${isPlaying ? "fa-pause" : "fa-play"} ${!isPlaying && "ml-1"}`}
            ></i>
          </button>
          <button
            onClick={playNext}
            className="text-zinc-400 hover:text-white transition"
          >
            <i className="fa-solid fa-forward-step text-xl"></i>
          </button>
        </div>
        <div className="flex items-center gap-3 w-full group">
          <span className="text-[11px] font-mono text-zinc-500">
            {formatTime(currentTime)}
          </span>
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
            className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-fossils-red"
          />
          <span className="text-[11px] font-mono text-zinc-500">
            {currentSong.duration}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-5 w-1/4">
        <div className="flex items-center gap-3 w-28">
          <i className="fa-solid fa-volume-high text-zinc-500 text-sm"></i>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
          />
        </div>
      </div>
    </div>
  );
};
