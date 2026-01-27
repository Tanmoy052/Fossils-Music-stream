export interface RawLyric {
  time: number;
  text: string;
}

export const getLyricsById = (songId: string): RawLyric[] => {
  // Return dummy lyrics for now
  return [
    { time: 0, text: "Lyrics not available" },
    { time: 5, text: "Instrumental" }
  ];
};
