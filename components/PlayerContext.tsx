import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { Song, PlayerContextType } from "../types";

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [queue, setQueue] = useState<Song[]>([]);
  const [contextSongs, setContextSongs] = useState<Song[]>([]);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const LAST_SONG_KEY = "player:lastSong";
  const LAST_POS_KEY = "player:lastPosition";
  const VOLUME_KEY = "player:volume";

  const playSong = useCallback(
    (song: Song, songs: Song[] = []) => {
      if (currentSong?.id === song.id) {
        togglePlay();
        return;
      }
      setCurrentSong(song);
      setContextSongs(songs);
      setIsPlaying(true);
      setPlaybackError(null);
      audioRef.current.src = song.audioUrl;
      audioRef.current.play().catch((err) => {
        setIsPlaying(false);
        setPlaybackError(
          typeof err?.message === "string" ? err.message : "Playback failed",
        );
      });
      try {
        localStorage.setItem(LAST_SONG_KEY, JSON.stringify(song));
        localStorage.removeItem(LAST_POS_KEY);
      } catch {}
    },
    [currentSong],
  );

  const togglePlay = useCallback(() => {
    if (!currentSong) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        setIsPlaying(false);
        setPlaybackError(
          typeof err?.message === "string" ? err.message : "Playback failed",
        );
      });
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, currentSong]);

  const playNext = useCallback(() => {
    const list = contextSongs.length > 0 ? contextSongs : queue;
    if (list.length === 0 || !currentSong) return;
    const idx = list.findIndex((s) => s.id === currentSong.id);
    if (idx !== -1 && idx < list.length - 1) {
      playSong(list[idx + 1], list);
    }
  }, [currentSong, contextSongs, queue, playSong]);

  const playPrev = useCallback(() => {
    const list = contextSongs.length > 0 ? contextSongs : queue;
    if (list.length === 0 || !currentSong) return;
    const idx = list.findIndex((s) => s.id === currentSong.id);
    if (idx > 0) {
      playSong(list[idx - 1], list);
    }
  }, [currentSong, contextSongs, queue, playSong]);

  const showLyrics = useCallback((song: Song) => {
    setCurrentSong(song);
    setIsPlaying(false);
    setPlaybackError(null);
    audioRef.current.src = song.audioUrl;
  }, []);

  const seek = useCallback((time: number) => {
    audioRef.current.currentTime = time;
  }, []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    audioRef.current.volume = v;
    try {
      localStorage.setItem(VOLUME_KEY, String(v));
    } catch {}
  }, []);

  const addToQueue = useCallback((song: Song) => {
    setQueue((prev) => [...prev, song]);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
      try {
        if (currentSong) {
          localStorage.setItem(
            LAST_POS_KEY,
            JSON.stringify({ id: currentSong.id, time: audio.currentTime }),
          );
        }
      } catch {}
    };
    const handleEnded = () => playNext();
    const handleError = () => {
      setIsPlaying(false);
      setPlaybackError("Audio source error");
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [playNext]);

  useEffect(() => {
    try {
      const vol = localStorage.getItem(VOLUME_KEY);
      if (vol) {
        const v = parseFloat(vol);
        setVolumeState(v);
        audioRef.current.volume = v;
      }
      const saved = localStorage.getItem(LAST_SONG_KEY);
      if (saved) {
        const song: Song = JSON.parse(saved);
        setCurrentSong(song);
        setContextSongs([]);
        setIsPlaying(false);
        audioRef.current.src = song.audioUrl;
        const posRaw = localStorage.getItem(LAST_POS_KEY);
        if (posRaw) {
          const pos = JSON.parse(posRaw);
          if (pos && pos.id === song.id) {
            const setPos = () => {
              audioRef.current.currentTime = pos.time || 0;
              audioRef.current.removeEventListener("loadedmetadata", setPos);
            };
            audioRef.current.addEventListener("loadedmetadata", setPos);
          }
        }
      }
    } catch {}
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        currentTime,
        progress,
        volume,
        queue,
        playbackError,
        playSong,
        showLyrics,
        togglePlay,
        playNext,
        playPrev,
        seek,
        setVolume,
        addToQueue,
        clearPlaybackError: () => setPlaybackError(null),
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer must be used within PlayerProvider");
  return context;
};
