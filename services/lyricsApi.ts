import { LyricsItem } from "../types";
import { ALBUMS } from "../constants";

const LYRICS_STORAGE_KEY = "fossils:lyrics";

export const lyricsApi = {
  getAllLyrics: (): LyricsItem[] => {
    try {
      const data = localStorage.getItem(LYRICS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addLyrics: (
    albumName: string,
    songName: string,
    bengaliLyrics: string,
  ): LyricsItem => {
    const allLyrics = lyricsApi.getAllLyrics();
    const newLyrics: LyricsItem = {
      id: `lyrics_${Date.now()}`,
      albumName,
      songName,
      bengaliLyrics,
      createdAt: Date.now(),
    };
    allLyrics.push(newLyrics);
    localStorage.setItem(LYRICS_STORAGE_KEY, JSON.stringify(allLyrics));
    return newLyrics;
  },

  updateLyrics: (
    id: string,
    albumName: string,
    songName: string,
    bengaliLyrics: string,
  ): LyricsItem | null => {
    const allLyrics = lyricsApi.getAllLyrics();
    const index = allLyrics.findIndex((l) => l.id === id);
    if (index === -1) return null;

    allLyrics[index] = {
      ...allLyrics[index],
      albumName,
      songName,
      bengaliLyrics,
    };
    localStorage.setItem(LYRICS_STORAGE_KEY, JSON.stringify(allLyrics));
    return allLyrics[index];
  },

  deleteLyrics: (id: string): boolean => {
    const allLyrics = lyricsApi.getAllLyrics();
    const filtered = allLyrics.filter((l) => l.id !== id);
    localStorage.setItem(LYRICS_STORAGE_KEY, JSON.stringify(filtered));
    return filtered.length < allLyrics.length;
  },

  getLyricsByAlbum: (albumName: string): LyricsItem[] => {
    return lyricsApi
      .getAllLyrics()
      .filter((l) => l.albumName.toLowerCase() === albumName.toLowerCase());
  },

  getUniqueAlbums: (): string[] => {
    const allLyrics = lyricsApi.getAllLyrics();
    const fromLyrics = new Set(allLyrics.map((l) => l.albumName));
    const fromConstants = new Set(ALBUMS.map((a) => a.name));
    const merged = new Set<string>([...fromLyrics, ...fromConstants]);
    return Array.from(merged).sort();
  },

  searchLyrics: (query: string): LyricsItem[] => {
    const lowerQuery = query.toLowerCase();
    return lyricsApi
      .getAllLyrics()
      .filter(
        (l) =>
          fuzzyMatch(l.albumName, query) ||
          fuzzyMatch(l.songName, query) ||
          l.bengaliLyrics.toLowerCase().includes(lowerQuery),
      );
  },

  downloadPDF: (albumName: string, songName: string, bengaliLyrics: string) => {
    // Create a more robust PDF with better Bengali text support
    const doc = document.createElement("iframe");
    doc.style.display = "none";
    document.body.appendChild(doc);

    const docWindow = doc.contentWindow;
    if (!docWindow) return;

    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          h1 { font-size: 24px; margin-bottom: 10px; }
          h2 { font-size: 18px; margin-bottom: 5px; color: #666; }
          .date { font-size: 12px; color: #999; margin-bottom: 20px; }
          .lyrics { white-space: pre-wrap; word-wrap: break-word; font-size: 14px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <h1>${albumName}</h1>
        <h2>${songName}</h2>
        <div class="date">${new Date().toLocaleDateString()}</div>
        <div class="lyrics">${bengaliLyrics}</div>
      </body>
      </html>
    `;

    docWindow.document.write(content);
    docWindow.document.close();

    setTimeout(() => {
      docWindow.print();
      document.body.removeChild(doc);
    }, 250);
  },
};
