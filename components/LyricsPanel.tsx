
import React, { useEffect, useRef } from 'react';
import { usePlayer } from './PlayerContext';

export const LyricsPanel: React.FC = () => {
  const { currentSong, currentTime } = usePlayer();
  const scrollRef = useRef<HTMLDivElement>(null);

  const lines = currentSong?.lyricsTimed || [];
  const currentLineIndex = lines.reduce((acc, line, idx) => {
    return line.time <= currentTime ? idx : acc;
  }, -1);

  useEffect(() => {
    const activeElement = scrollRef.current?.children[currentLineIndex] as HTMLElement;
    if (activeElement && scrollRef.current) {
      scrollRef.current.scrollTo({
        top: activeElement.offsetTop - scrollRef.current.offsetHeight / 2,
        behavior: 'smooth'
      });
    }
  }, [currentLineIndex]);

  if (!currentSong) return null;

  return (
    <div className="w-80 bg-black border-l border-white/5 flex flex-col h-full hidden xl:flex">
      <div className="p-6 border-b border-white/5 font-black uppercase tracking-widest text-zinc-500 text-xs">
        Frequency / Lyrics
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
        {lines.length > 0 ? lines.map((line, i) => (
          <p 
            key={i} 
            className={`text-2xl font-black leading-snug transition-all duration-700 ${
              i === currentLineIndex ? 'text-white scale-105' : 'text-zinc-800 opacity-40'
            }`}
          >
            {line.text}
          </p>
        )) : (
          <div className="text-zinc-800 text-xl font-black italic mt-10">
            Signal processing... No timed lyrics found.
          </div>
        )}
      </div>
    </div>
  );
};
