import React from 'react';

interface AlbumListProps {
  albums: string[];
  selectedAlbum: string | null;
  onSelectAlbum: (album: string | null) => void;
}

export const AlbumList: React.FC<AlbumListProps> = ({
  albums,
  selectedAlbum,
  onSelectAlbum,
}) => {
  if (albums.length === 0) {
    return (
      <div className="p-4 text-zinc-500 text-center text-sm">
        No lyrics added yet
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4">
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-2">
        Albums
      </p>
      {albums.map((album) => (
        <button
          key={album}
          onClick={() => onSelectAlbum(album)}
          className={`w-full text-left px-3 py-2 rounded-lg transition ${
            selectedAlbum === album
              ? 'bg-fossils-red text-white'
              : 'text-zinc-300 hover:bg-zinc-800'
          }`}
        >
          <p className="font-semibold truncate">{album}</p>
        </button>
      ))}
    </div>
  );
};
