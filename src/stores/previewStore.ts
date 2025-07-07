import { create } from 'zustand';

interface PreviewState {
  isPreviewPlaying: boolean;
  previewTrackIndex: number | null;
  previewProgress: number; // 0-100
  previewCurrentTime: number;
  previewSource: string | null;
  previewAudio: HTMLAudioElement | null;
  previewDuration: number;
  previewPausedManually: boolean; // Track manual vs automatic pause
  previewEnding: boolean; // Track when preview is ending to prevent timer reappearance
}

interface PreviewActions {
  setPreviewPlaying: (playing: boolean) => void;
  setPreviewTrack: (trackIndex: number | null, source?: string) => void;
  setPreviewProgress: (progress: number) => void;
  setPreviewCurrentTime: (time: number) => void;
  resetPreview: () => void;
  initializePreviewAudio: () => void;
  playPreview: (source: string) => Promise<void>;
  pausePreview: () => void;
  resumePreview: () => Promise<void>;
  stopPreview: () => void;
}

interface PreviewStore extends PreviewState, PreviewActions {}

export const usePreviewStore = create<PreviewStore>((set, get) => ({
  // State
  isPreviewPlaying: false,
  previewTrackIndex: null,
  previewProgress: 0,
  previewCurrentTime: 0,
  previewSource: null,
  previewAudio: null,
  previewDuration: 0,
  previewPausedManually: false,
  previewEnding: false,

  // Actions
  setPreviewPlaying: (playing) => 
    set({ isPreviewPlaying: playing }),
  
  setPreviewTrack: (trackIndex, source) => 
    set({ previewTrackIndex: trackIndex, previewSource: source || null }),
  
  setPreviewProgress: (progress) => 
    set({ previewProgress: progress }),
  
  setPreviewCurrentTime: (time) => 
    set({ previewCurrentTime: time }),
  
  initializePreviewAudio: () => {
    const audio = new Audio();
    audio.preload = 'metadata';
    
    // Set up event listeners
    audio.addEventListener('loadedmetadata', () => {
      set({ previewDuration: audio.duration });
    });
    
    audio.addEventListener('timeupdate', () => {
      const { previewDuration } = get();
      const progress = previewDuration > 0 ? (audio.currentTime / previewDuration) * 100 : 0;
      set({ 
        previewCurrentTime: audio.currentTime,
        previewProgress: progress 
      });
    });
    
    audio.addEventListener('ended', () => {
      // Natural completion - not manual pause
      set({ previewPausedManually: false, previewEnding: true });
      // Delay stop to allow for natural fade-out in audio
      setTimeout(() => {
        get().stopPreview();
      }, 500); // 500ms delay to preserve fade-out
    });
    
    audio.addEventListener('pause', () => {
      set({ isPreviewPlaying: false });
    });
    
    audio.addEventListener('play', () => {
      set({ isPreviewPlaying: true });
    });
    
    set({ previewAudio: audio });
  },
  
  playPreview: async (source: string) => {
    const { previewAudio, initializePreviewAudio, previewSource } = get();
    
    // Stop main audio player before starting preview
    const mainAudioElements = document.querySelectorAll('audio');
    mainAudioElements.forEach(audio => {
      if (audio !== get().previewAudio && !audio.paused) {
        audio.pause();
      }
    });
    
    // Initialize audio if not already done
    if (!previewAudio) {
      initializePreviewAudio();
    }
    
    const audio = get().previewAudio;
    if (!audio) return;
    
    try {
      // Only reset if switching to a different source
      if (audio.src !== source || previewSource !== source) {
        // Stop any current preview and reset position
        if (audio.src !== source) {
          audio.pause();
          audio.currentTime = 0;
        }
        audio.src = source;
        audio.currentTime = 0;
      }
      // If same source, just resume from current position
      
      await audio.play();
      set({ isPreviewPlaying: true, previewSource: source, previewPausedManually: false });
    } catch (error) {
      console.error('Preview playback error:', error);
      set({ isPreviewPlaying: false });
    }
  },
  
  pausePreview: () => {
    const { previewAudio } = get();
    if (previewAudio) {
      previewAudio.pause();
      // Mark as manually paused to keep counter visible
      set({ previewPausedManually: true });
    }
  },
  
  resumePreview: async () => {
    const { previewAudio } = get();
    if (previewAudio) {
      try {
        await previewAudio.play();
        set({ isPreviewPlaying: true, previewPausedManually: false });
      } catch (error) {
        console.error('Preview resume error:', error);
        set({ isPreviewPlaying: false });
      }
    }
  },
  
  stopPreview: () => {
    const { previewAudio, previewTrackIndex } = get();
    if (previewAudio) {
      previewAudio.pause();
      previewAudio.currentTime = 0;
    }
    
    // Set the previewed track as current track to keep player activated
    if (previewTrackIndex !== null) {
      const { useAudioStore } = require('../stores/audioStore');
      useAudioStore.setState({
        currentTrackIndex: previewTrackIndex,
        hasTrackBeenSelected: true
      });
    }
    
    set({ 
      isPreviewPlaying: false,
      previewProgress: 0,
      previewCurrentTime: 0,
      previewTrackIndex: null, // Clear the preview state but keep track as current
      previewPausedManually: false, // Reset manual pause flag
      previewEnding: false // Reset ending flag
    });
  },
  
  resetPreview: () => {
    const { previewAudio } = get();
    if (previewAudio) {
      previewAudio.pause();
      previewAudio.currentTime = 0;
      // Clear the source to prevent resuming old audio
      previewAudio.src = '';
    }
    set({ 
      isPreviewPlaying: false, 
      previewTrackIndex: null, 
      previewProgress: 0, 
      previewCurrentTime: 0,
      previewSource: null,
      previewPausedManually: false
    });
  },
}));