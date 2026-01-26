import React, { useEffect, useRef, useMemo } from "react";
import { getLyricsById } from "../content/lyrics";

interface SyncedLyricsProps {
  songId?: string;
  currentTime: number;
}

export const SyncedLyrics: React.FC<SyncedLyricsProps> = ({
  songId,
  currentTime,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lines = useMemo(() => getLyricsById(songId), [songId]);

  const currentLineIndex = useMemo(() => {
    if (!lines || lines.length === 0) return -1;
    const idx = lines.findIndex((line, i) => {
      const next = lines[i + 1];
      if (!next) return currentTime >= line.time;
      return currentTime >= line.time && currentTime < next.time;
    });
    return idx === -1 ? lines.findIndex((l) => l.time > currentTime) - 1 : idx;
  }, [lines, currentTime]);

  useEffect(() => {
    const target =
      currentLineIndex >= 0
        ? (scrollRef.current?.children[currentLineIndex] as HTMLElement)
        : undefined;
    if (target && scrollRef.current) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentLineIndex]);

  if (!songId) return null;

  return (
    <div className="w-80 bg-black border-l border-white/5 flex flex-col h-full hidden xl:flex">
      <div className="p-6 border-b border-white/5 font-black uppercase tracking-widest text-zinc-500 text-xs">
        Lyrics
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
        {lines.length > 0 ? (
          lines.map((line, i) => (
            <p
              key={`${line.time}-${i}`}
              className={`text-2xl leading-snug transition-all duration-500 ${
                i === currentLineIndex
                  ? "text-white font-black scale-105"
                  : "text-zinc-700 opacity-50"
              }`}
            >
              {line.text}
            </p>
          ))
        ) : (
          <div className="text-zinc-800 text-xl font-black italic mt-10">
            No timed lyrics found.
          </div>
        )}
      </div>
    </div>
  );
};
