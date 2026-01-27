import React, { useState } from 'react';
import { LyricsItem } from '../types';
import { LyricsItems } from './LyricsItems';

interface SongListProps {
  albumName: string;
  lyrics: LyricsItem[];
  onEdit: (lyrics: LyricsItem) => void;
  onDelete: (id: string) => void;
}

export const SongList: React.FC<SongListProps> = ({
  albumName,
  lyrics,
  onEdit,
  onDelete,
}) => {
  const [selectedSong, setSelectedSong] = useState<string | null>(null);

  const songs = Array.from(
    new Map(lyrics.map((item) => [item.songName, item])).keys()
  );

  const songLyrics = selectedSong
    ? lyrics.filter((item) => item.songName === selectedSong)
    : [];

  return (
    <div className="grid grid-cols-12 h-full gap-0">
      {/* Songs List */}
      <div className="col-span-4 border-r border-zinc-800 overflow-y-auto scrollbar-hide">
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-4">
          <h3 className="font-semibold text-white">{albumName}</h3>
          <p className="text-xs text-zinc-400 mt-1">{songs.length} songs</p>
        </div>

        {songs.length === 0 ? (
          <div className="p-4 text-zinc-500 text-center text-sm">
            No songs in this album
          </div>
        ) : (
          <div className="space-y-1 p-4">
            {songs.map((song) => {
              const songCount = lyrics.filter(
                (item) => item.songName === song
              ).length;
              return (
                <button
                  key={song}
                  onClick={() => setSelectedSong(song)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition ${
                    selectedSong === song
                      ? 'bg-fossils-red text-white'
                      : 'text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <p className="font-semibold truncate text-sm">{song}</p>
                  <p className="text-xs text-zinc-400">
                    {songCount} {songCount === 1 ? 'entry' : 'entries'}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Lyrics Items */}
      <div className="col-span-8 overflow-y-auto">
        {selectedSong ? (
          <LyricsItems
            lyrics={songLyrics}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ) : (
          <LyricsItems lyrics={lyrics} onEdit={onEdit} onDelete={onDelete} />
        )}
      </div>
    </div>
  );
};
