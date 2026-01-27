import React, { useState, useEffect } from 'react';
import { LyricsItem } from '../types';

interface LyricsFormProps {
  editingLyrics: LyricsItem | null;
  onSave: (albumName: string, songName: string, bengaliLyrics: string) => void;
  onCancel: () => void;
}

export const LyricsForm: React.FC<LyricsFormProps> = ({
  editingLyrics,
  onSave,
  onCancel,
}) => {
  const [albumName, setAlbumName] = useState('');
  const [songName, setSongName] = useState('');
  const [bengaliLyrics, setBengaliLyrics] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (editingLyrics) {
      setAlbumName(editingLyrics.albumName);
      setSongName(editingLyrics.songName);
      setBengaliLyrics(editingLyrics.bengaliLyrics);
    }
  }, [editingLyrics]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!albumName.trim()) newErrors.albumName = 'Album name is required';
    if (!songName.trim()) newErrors.songName = 'Song name is required';
    if (!bengaliLyrics.trim())
      newErrors.bengaliLyrics = 'Lyrics text is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(albumName, songName, bengaliLyrics);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 max-w-3xl mx-auto h-full flex flex-col"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">
          {editingLyrics ? 'Edit Lyrics' : 'Add New Lyrics'}
        </h2>
        <p className="text-zinc-400">
          {editingLyrics
            ? 'Update the lyrics information'
            : 'Add Bengali lyrics to the collection'}
        </p>
      </div>

      {/* Album Name */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-white mb-2">
          Album Name
        </label>
        <input
          type="text"
          value={albumName}
          onChange={(e) => {
            setAlbumName(e.target.value);
            if (errors.albumName) setErrors({ ...errors, albumName: '' });
          }}
          placeholder="e.g., Single Album, Nikhoj, Golokdhnadha"
          className={`w-full bg-zinc-800 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-fossils-red ${
            errors.albumName ? 'ring-2 ring-red-500' : ''
          }`}
        />
        {errors.albumName && (
          <p className="text-red-400 text-xs mt-1">{errors.albumName}</p>
        )}
      </div>

      {/* Song Name */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-white mb-2">
          Song Name
        </label>
        <input
          type="text"
          value={songName}
          onChange={(e) => {
            setSongName(e.target.value);
            if (errors.songName) setErrors({ ...errors, songName: '' });
          }}
          placeholder="e.g., Bedroom E, Amara Sei Boyese"
          className={`w-full bg-zinc-800 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-fossils-red ${
            errors.songName ? 'ring-2 ring-red-500' : ''
          }`}
        />
        {errors.songName && (
          <p className="text-red-400 text-xs mt-1">{errors.songName}</p>
        )}
      </div>

      {/* Bengali Lyrics */}
      <div className="mb-6 flex-1 flex flex-col">
        <label className="block text-sm font-semibold text-white mb-2">
          Bengali Lyrics
        </label>
        <textarea
          value={bengaliLyrics}
          onChange={(e) => {
            setBengaliLyrics(e.target.value);
            if (errors.bengaliLyrics)
              setErrors({ ...errors, bengaliLyrics: '' });
          }}
          placeholder="Paste or type the Bengali lyrics here..."
          className={`flex-1 bg-zinc-800 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-fossils-red resize-none ${
            errors.bengaliLyrics ? 'ring-2 ring-red-500' : ''
          }`}
        />
        {errors.bengaliLyrics && (
          <p className="text-red-400 text-xs mt-1">{errors.bengaliLyrics}</p>
        )}
        <p className="text-xs text-zinc-400 mt-2">
          Character count: {bengaliLyrics.length}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition font-semibold"
        >
          <i className="fa-solid fa-times mr-2"></i>
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-fossils-red hover:bg-red-700 text-white rounded-lg transition font-semibold"
        >
          <i
            className={`fa-solid ${editingLyrics ? 'fa-save' : 'fa-plus'} mr-2`}
          ></i>
          {editingLyrics ? 'Save Changes' : 'Add Lyrics'}
        </button>
      </div>
    </form>
  );
};
