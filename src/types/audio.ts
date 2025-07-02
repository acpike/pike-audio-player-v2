// Audio State Properties - Clean interface for audio playback state
export interface AudioState {
  currentTrackIndex: number | null;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  isPreview: boolean;
  hasTrackBeenSelected: boolean;
  isActivelyPlaying: boolean;
  retryCount: number;
  maxRetries: number;
  abortController: AbortController | null;
  loadingPromise: Promise<void> | null;
  error: string | null;
}

export interface AudioActions {
  setCurrentTime: (time: number) => void;
  setLoading: (loading: boolean) => void;
  setPlaying: (playing: boolean) => void;
  reset: () => void;
}