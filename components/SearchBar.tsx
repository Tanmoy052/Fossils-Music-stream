
import React, { useState, useEffect } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, onSearch]);

  return (
    <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md p-4 flex items-center">
      <div className="relative w-full max-w-md group">
        <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-white"></i>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you want to listen to?"
          className="w-full bg-zinc-800 text-white rounded-full py-2.5 pl-12 pr-4 text-sm outline-none border border-transparent focus:border-zinc-600 transition-all placeholder:text-zinc-500"
        />
      </div>
    </div>
  );
};
