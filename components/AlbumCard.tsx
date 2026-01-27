
import React from 'react';
import { Album } from '../types';

interface AlbumCardProps {
  album: Album;
  onClick: (id: string) => void;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({ album, onClick }) => {
  return (
    <div 
      onClick={() => onClick(album.id)}
      className="bg-card hover:bg-card-hover p-4 rounded-lg transition-all duration-300 group cursor-pointer"
    >
      <div className="relative mb-4 aspect-square shadow-xl">
        <img 
          src={album.image} 
          alt={album.name} 
          className="w-full h-full object-cover rounded-md" 
        />
        <button className="absolute bottom-2 right-2 w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:scale-105 active:scale-95">
          <i className="fa-solid fa-play text-black text-xl ml-1"></i>
        </button>
      </div>
      <h3 className="text-white font-bold truncate mb-1">{album.name}</h3>
      <p className="text-zinc-400 text-sm">{album.releaseYear} • Album</p>
    </div>
  );
};
