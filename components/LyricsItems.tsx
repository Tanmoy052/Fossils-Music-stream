import React, { useState, useRef, useEffect } from "react";
import { LyricsItem } from "../types";
import { lyricsApi } from "../services/lyricsApi";

interface LyricsItemsProps {
  lyrics: LyricsItem[];
  onEdit: (lyrics: LyricsItem) => void;
  onDelete: (id: string) => void;
}

interface ContextMenuState {
  lyricsId: string;
  x: number;
  y: number;
}

export const LyricsItems: React.FC<LyricsItemsProps> = ({
  lyrics,
  onEdit,
  onDelete,
}) => {
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameType, setRenameType] = useState<"album" | "song" | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [selectedLyricsForView, setSelectedLyricsForView] =
    useState<LyricsItem | null>(null);
  const [fontSize, setFontSize] = useState(28);
  const [lineHeight, setLineHeight] = useState(2.0);
  const [padding, setPadding] = useState(50);
  const lyricsContentRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(e.target as Node)
      ) {
        setContextMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!selectedLyricsForView) return;
    const charCount = selectedLyricsForView.bengaliLyrics.length;
    let baseFont = 32;
    let baseLine = 2.0;
    let basePad = 52;
    if (charCount < 500) {
      baseFont = 36;
      baseLine = 2.1;
      basePad = 58;
    } else if (charCount < 1500) {
      baseFont = 32;
      baseLine = 2.0;
      basePad = 52;
    } else if (charCount < 3000) {
      baseFont = 28;
      baseLine = 1.8;
      basePad = 46;
    } else {
      baseFont = 24;
      baseLine = 1.6;
      basePad = 38;
    }
    const isSmallScreen = window.innerWidth < 640;
    if (isSmallScreen) {
      baseFont = Math.max(18, Math.round(baseFont * 0.9));
      baseLine = Math.max(1.45, baseLine * 0.95);
      basePad = Math.max(28, Math.round(basePad * 0.9));
    }
    setFontSize(baseFont);
    setLineHeight(baseLine);
    setPadding(basePad);
  }, [selectedLyricsForView]);

  const handleContextMenu = (e: React.MouseEvent, lyricsId: string) => {
    e.preventDefault();
    setContextMenu({ lyricsId, x: e.clientX, y: e.clientY });
  };

  const handleRenameAlbum = (lyricsId: string) => {
    const item = lyrics.find((l) => l.id === lyricsId);
    if (item) {
      setRenamingId(lyricsId);
      setRenameType("album");
      setRenameValue(item.albumName);
      setContextMenu(null);
    }
  };

  const handleRenameSong = (lyricsId: string) => {
    const item = lyrics.find((l) => l.id === lyricsId);
    if (item) {
      setRenamingId(lyricsId);
      setRenameType("song");
      setRenameValue(item.songName);
      setContextMenu(null);
    }
  };

  const handleConfirmRename = (lyricsId: string) => {
    const item = lyrics.find((l) => l.id === lyricsId);
    if (item && renameType) {
      if (renameType === "album") {
        lyricsApi.updateLyrics(
          lyricsId,
          renameValue,
          item.songName,
          item.bengaliLyrics,
        );
      } else {
        lyricsApi.updateLyrics(
          lyricsId,
          item.albumName,
          renameValue,
          item.bengaliLyrics,
        );
      }
      setRenamingId(null);
      setRenameType(null);
    }
  };

  const handleDownloadPDF = (item: LyricsItem) => {
    lyricsApi.downloadPDF(item.albumName, item.songName, item.bengaliLyrics);
    setContextMenu(null);
  };

  if (lyrics.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-zinc-500">
          <i className="fa-solid fa-music text-4xl mb-4 block"></i>
          <p>No lyrics found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {lyrics.map((item) => (
        <div key={item.id} className="group relative">
          <div
            onClick={() => setSelectedLyricsForView(item)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-fossils-red/50 transition cursor-pointer h-full flex flex-col hover:shadow-lg hover:shadow-fossils-red/10"
            onContextMenu={(e) => handleContextMenu(e, item.id)}
          >
            {/* Three Dots Menu Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setContextMenu({
                  lyricsId: item.id,
                  x: e.currentTarget.getBoundingClientRect().right - 200,
                  y: e.currentTarget.getBoundingClientRect().bottom,
                });
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white hover:font-bold active:text-white transition"
            >
              <i className="fa-solid fa-ellipsis-vertical text-lg font-semibold"></i>
            </button>

            {/* Album and Song Info */}
            <div className="mb-4 pr-8">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
                {item.albumName}
              </p>
              <p className="font-semibold text-white mt-1 text-sm">
                {item.songName}
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Lyrics Preview */}
            <div className="flex-1">
              <p className="text-xs text-zinc-300 line-clamp-4 leading-relaxed cursor-pointer hover:text-white transition">
                {item.bengaliLyrics}
              </p>
            </div>

            {/* Click to view full lyrics hint */}
            <p className="text-xs text-fossils-red/60 mt-3 font-semibold">
              Click to view full lyrics →
            </p>
          </div>

          {/* Context Menu */}
          {contextMenu?.lyricsId === item.id && (
            <div
              ref={contextMenuRef}
              style={{
                position: "fixed",
                left: `${contextMenu.x}px`,
                top: `${contextMenu.y}px`,
                zIndex: 1000,
              }}
              className="bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg py-1 min-w-48"
            >
              <button
                onClick={() => {
                  onEdit(item);
                  setContextMenu(null);
                }}
                className="w-full text-left px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 transition"
              >
                <i className="fa-solid fa-pen-to-square mr-2 text-fossils-red"></i>
                Edit Lyrics
              </button>
              <button
                onClick={() => handleRenameAlbum(item.id)}
                className="w-full text-left px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 transition"
              >
                <i className="fa-solid fa-tag mr-2 text-blue-400"></i>
                Rename Album
              </button>
              <button
                onClick={() => handleRenameSong(item.id)}
                className="w-full text-left px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 transition"
              >
                <i className="fa-solid fa-tag mr-2 text-green-400"></i>
                Rename Song
              </button>
              <div className="border-t border-zinc-700 my-1"></div>
              <button
                onClick={() => handleDownloadPDF(item)}
                className="w-full text-left px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 transition"
              >
                <i className="fa-solid fa-download mr-2 text-amber-400"></i>
                Download PDF
              </button>
              <div className="border-t border-zinc-700 my-1"></div>
              <button
                onClick={() => {
                  onDelete(item.id);
                  setContextMenu(null);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-zinc-700 transition"
              >
                <i className="fa-solid fa-trash mr-2"></i>
                Delete
              </button>
            </div>
          )}

          {/* Rename Input Dialog */}
          {renamingId === item.id && renameType && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1001">
              <div className="bg-zinc-800 rounded-lg p-6 w-80">
                <p className="text-sm text-zinc-300 mb-3">
                  Rename {renameType === "album" ? "Album" : "Song"}:
                </p>
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  autoFocus
                  className="w-full bg-zinc-700 text-white px-3 py-2 rounded-lg mb-4 outline-none focus:ring-2 focus:ring-fossils-red"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setRenamingId(null);
                      setRenameType(null);
                    }}
                    className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleConfirmRename(item.id)}
                    className="flex-1 px-4 py-2 bg-fossils-red hover:bg-red-700 rounded-lg transition text-sm font-semibold"
                  >
                    Rename
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Full Lyrics Modal */}
      {selectedLyricsForView && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[1001] p-4 animate-in fade-in duration-300"
          onClick={() => setSelectedLyricsForView(null)}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300"
            style={{ height: "calc(100vh - 32px)", maxHeight: "95vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-fossils-red/20 to-zinc-800 border-b border-zinc-800 p-6 flex justify-between items-start">
              <div className="flex-1">
                <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold mb-2">
                  {selectedLyricsForView.albumName}
                </p>
                <h2 className="text-3xl font-black text-white mb-2">
                  {selectedLyricsForView.songName}
                </h2>
                <p className="text-sm text-zinc-400">
                  {new Date(selectedLyricsForView.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </p>
              </div>
              <button
                onClick={() => setSelectedLyricsForView(null)}
                className="text-zinc-400 hover:text-white transition text-2xl w-10 h-10 flex items-center justify-center hover:bg-zinc-800 rounded-lg"
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            {/* Lyrics Content - Large size with proper scrolling */}
            <div
              ref={lyricsContentRef}
              className="flex-1 overflow-y-auto p-0 flex justify-center custom-scrollbar"
              style={{
                padding: `${padding}px`,
              }}
            >
              <p
                className="text-zinc-100 whitespace-pre-wrap font-bengali w-full text-center"
                style={{
                  fontSize: `${fontSize}px`,
                  lineHeight: `${lineHeight}`,
                  margin: 0,
                  wordBreak: "break-word",
                }}
              >
                {selectedLyricsForView.bengaliLyrics}
              </p>
            </div>

            {/* Footer with Actions */}
            <div className="border-t border-zinc-800 bg-zinc-900/50 p-6 flex gap-3">
              <button
                onClick={() => {
                  setSelectedLyricsForView(null);
                }}
                className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition font-semibold"
              >
                <i className="fa-solid fa-times mr-2"></i>
                Close
              </button>
              <button
                onClick={() => {
                  lyricsApi.downloadPDF(
                    selectedLyricsForView.albumName,
                    selectedLyricsForView.songName,
                    selectedLyricsForView.bengaliLyrics,
                  );
                }}
                className="flex-1 px-4 py-3 bg-fossils-red hover:bg-red-700 text-white rounded-lg transition font-semibold"
              >
                <i className="fa-solid fa-download mr-2"></i>
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
