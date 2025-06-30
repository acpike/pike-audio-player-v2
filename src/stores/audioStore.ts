import { create } from 'zustand';
import { AudioState, AudioActions } from '../types/audio';

/**
 * Combined interface for audio store state and actions
 */
interface AudioStore extends AudioState, AudioActions {}

/**
 * Audio Store - Global state management for audio playback
 * 
 * Manages all audio-related state including current track, playback status,
 * loading states, time tracking, and preview mode. Provides actions for
 * controlling playback state and updating audio metadata.
 * 
 * @returns Zustand store hook for audio state management
 */
export const useAudioStore = create<AudioStore>((set) => ({
  // Audio State Properties - Clean playback state management
  currentTrackIndex: null,
  isPlaying: false,
  isLoading: false,
  currentTime: 0,
  duration: 0,
  isPreview: false,
  hasTrackBeenSelected: false,
  isActivelyPlaying: false,
  retryCount: 0,
  maxRetries: 3,
  abortController: null,
  loadingPromise: null,

  // Actions - Actual implementations provided by useAudioPlayer hook composition

  setCurrentTime: (time: number) => {
    set({ currentTime: time });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setPlaying: (playing: boolean) => {
    set({ isPlaying: playing });
  },

  reset: () => {
    set({
      currentTrackIndex: null,
      isPlaying: false,
      isLoading: false,
      currentTime: 0,
      duration: 0,
      isPreview: false,
      hasTrackBeenSelected: false,
      isActivelyPlaying: false,
      retryCount: 0,
      abortController: null,
      loadingPromise: null
    });
  }
}));