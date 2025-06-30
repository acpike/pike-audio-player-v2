import { useCallback, useRef, useEffect } from 'react';
import { useAudioStore } from '../stores/audioStore';
import { trackData } from '../types/tracks';

/** Core audio player hook with V7 patterns */
export const useAudioPlayer = () => {
  const {
    currentTrackIndex,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    hasTrackBeenSelected,
    isPreview
  } = useAudioStore();

  const audioRef = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.preload = 'metadata';
    const store = useAudioStore.setState;
    const listeners = {
      timeupdate: () => store({ currentTime: audio.currentTime, duration: audio.duration || 0 }),
      loadstart: () => store({ isLoading: true }),
      canplay: () => store({ isLoading: false }),
      play: () => store({ isPlaying: true }),
      pause: () => store({ isPlaying: false }),
      ended: () => store({ isPlaying: false, currentTime: 0 }),
      error: () => store({ isPlaying: false, isLoading: false })
    };
    Object.entries(listeners).forEach(([e, h]) => audio.addEventListener(e, h));
    return () => Object.entries(listeners).forEach(([e, h]) => audio.removeEventListener(e, h));
  }, []);

  const playTrack = useCallback(async (index: number, source?: string, autoPlay = true): Promise<void> => {
    const track = trackData[index];
    const audio = audioRef.current;
    if (!track || !audio) return;
    audio.pause();
    audio.currentTime = 0;
    audio.src = '';
    audio.load();
    useAudioStore.setState({
      currentTrackIndex: index,
      hasTrackBeenSelected: true,
      isLoading: true,
      isPreview: source ? (source === track.short15 || source === track.short30) : false
    });
    audio.src = source || track.full;
    if (autoPlay) {
      try {
        await audio.play();
      } catch {
        useAudioStore.setState({ isPlaying: false, isLoading: false });
      }
    }
  }, []);

  const togglePlayPause = useCallback(async (): Promise<void> => {
    const audio = audioRef.current;
    if (isLoading || !audio || currentTrackIndex === null) return;
    if (audio.paused) {
      if (audio.readyState < 1) {
        const track = trackData[currentTrackIndex];
        audio.src = isPreview ? track.short15 : track.full;
        audio.load();
      }
      try {
        await audio.play();
      } catch {
        useAudioStore.setState({ isPlaying: false, isLoading: false });
      }
    } else {
      audio.pause();
    }
  }, [playTrack, isLoading, currentTrackIndex, isPreview]);

  return {
    audioRef,
    playTrack,
    togglePlayPause,
    currentTrack: currentTrackIndex !== null ? trackData[currentTrackIndex] : null,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    hasTrackBeenSelected
  };
};