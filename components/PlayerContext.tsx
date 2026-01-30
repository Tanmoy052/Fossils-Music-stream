import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { Song, PlayerContextType } from "../types";
import { ALBUMS, SONGS } from "../constants";

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

  const audioRef = useRef<HTMLAudioElement>(new Audio());

  const togglePlay = useCallback(() => {
    if (!currentSong) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            if (error.name !== "AbortError") {
              console.error("Playback error:", error);
            }
          });
      }
    }
  }, [isPlaying, currentSong]);

  const playSong = useCallback(
    (song: Song, songs: Song[] = []) => {
      if (currentSong?.id === song.id) {
        togglePlay();
        return;
      }

      // Pause current audio before switching source
      audioRef.current.pause();

      setCurrentSong(song);
      setContextSongs(songs);
      setIsPlaying(true);
      audioRef.current.src = song.audioUrl;
      audioRef.current.load(); // Explicitly load the new source

      try {
        localStorage.setItem("fossils:lastPlayedSong", song.id);
      } catch {}

      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          if (error.name !== "AbortError") {
            console.error("Playback error:", error);
          }
        });
      }
    },
    [currentSong, togglePlay],
  );

  const playNext = useCallback(() => {
    const list = contextSongs.length > 0 ? contextSongs : queue;
    if (list.length === 0 || !currentSong) return;
    const idx = list.findIndex((s) => s.id === currentSong.id);
    if (idx !== -1) {
      if (idx < list.length - 1) {
        playSong(list[idx + 1], list);
      } else {
        // End of current list
        // Check if we are in an album context (all songs in context belong to same album)
        const isAlbumContext =
          list.length > 0 &&
          list.every((s) => s.albumId === currentSong.albumId);

        if (isAlbumContext) {
          const currentAlbumIdx = ALBUMS.findIndex(
            (a) => a.id === currentSong.albumId,
          );
          if (currentAlbumIdx !== -1) {
            let nextAlbumIdx = currentAlbumIdx + 1;
            // Circular queue of albums
            if (nextAlbumIdx >= ALBUMS.length) {
              nextAlbumIdx = 0;
            }
            const nextAlbum = ALBUMS[nextAlbumIdx];
            const nextAlbumSongs = SONGS.filter(
              (s) => s.albumId === nextAlbum.id,
            );
            const availableNextSongs = nextAlbumSongs
              .filter((s) => s.audioUrl.startsWith("/audio/"))
              .map((s) => ({
                ...s,
                albumImage: nextAlbum.image,
              }));

            if (availableNextSongs.length > 0) {
              playSong(availableNextSongs[0], availableNextSongs);
              return;
            }
          }
        }

        // Default circular queue behavior (same list)
        playSong(list[0], list);
      }
    }
  }, [currentSong, contextSongs, queue, playSong]);

  const playPrev = useCallback(() => {
    const list = contextSongs.length > 0 ? contextSongs : queue;
    if (list.length === 0 || !currentSong) return;
    const idx = list.findIndex((s) => s.id === currentSong.id);
    if (idx !== -1) {
      if (idx > 0) {
        playSong(list[idx - 1], list);
      } else {
        // Circular queue: wrap to end
        playSong(list[list.length - 1], list);
      }
    }
  }, [currentSong, contextSongs, queue, playSong]);

  const seek = useCallback((time: number) => {
    audioRef.current.currentTime = time;
  }, []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    audioRef.current.volume = v;
  }, []);

  const addToQueue = useCallback((song: Song) => {
    setQueue((prev) => [...prev, song]);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
    };
    const handleEnded = () => playNext();

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [playNext]);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        currentTime,
        progress,
        volume,
        queue,
        playSong,
        togglePlay,
        playNext,
        playPrev,
        seek,
        setVolume,
        addToQueue,
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
