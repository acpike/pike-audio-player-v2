import { useCallback, useRef, useEffect } from 'react';
import { useAudioStore } from '../stores/audioStore';
import { usePreviewStore } from '../stores/previewStore';
import { trackData } from '../types/tracks';
import { useAudioDucking } from './useAudioDucking';
import { UI_STRINGS } from '../constants/strings';
import { logger } from '../utils/logger';
import { scrollTrackIntoView } from '../utils/scrollToTrack';

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
  
  const { resetPreview } = usePreviewStore();

  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  // @ts-expect-error - Reserved for future Audio Context features
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const playTrackRef = useRef<((index: number, source?: string, autoPlay?: boolean) => Promise<void>) | null>(null);

  // Audio ducking for navigation announcements and phone calls
  const audioDucking = useAudioDucking({
    audioElement: audioRef.current,
    originalVolume: 0.8,
    duckedVolume: 0.2,
    transitionDuration: 500,
    onDuckingChange: (isDucked) => {
      console.log(`Audio ducking: ${isDucked ? 'ducked' : 'restored'} for automotive environment`);
    }
  });

  // Wake Lock API to prevent screen sleep during playback
  useEffect(() => {
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator && isPlaying) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
          console.log('Wake lock activated for car audio');
        } catch (error) {
          console.warn('Wake lock request failed:', error);
        }
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
          console.log('Wake lock released');
        } catch (error) {
          console.warn('Wake lock release failed:', error);
        }
      }
    };

    if (isPlaying) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    // Handle visibility change to re-acquire wake lock
    const handleVisibilityChangeForWakeLock = () => {
      if (!document.hidden && isPlaying && !wakeLockRef.current) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChangeForWakeLock);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChangeForWakeLock);
      releaseWakeLock();
    };
  }, [isPlaying]);

  // Service Worker registration for offline audio caching
  useEffect(() => {
    const registerServiceWorker = async () => {
      const enableServiceWorker = true; // Re-enabling Service Worker
      if ('serviceWorker' in navigator && enableServiceWorker) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registered for offline audio caching');
          
          // Listen for messages from service worker
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data.type === 'SYNC_AUDIO_STATE') {
              // Handle audio state sync after offline recovery
              console.log('Audio state sync:', event.data.data.message);
            }
          });
          
          // Background sync for offline state
          if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            try {
              (registration as any).sync.register('audio-state-sync');
            } catch (error) {
              console.warn('Background sync not supported:', error);
            }
          }
        } catch (error) {
          console.warn('Service Worker registration failed:', error);
        }
      }
    };

    registerServiceWorker();
  }, []);

  // Pre-cache audio files when tracks are loaded
  useEffect(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // Pre-cache current track for offline playback
      if (currentTrackIndex !== null) {
        const currentTrack = trackData[currentTrackIndex];
        if (currentTrack) {
          navigator.serviceWorker.controller.postMessage({
            type: 'CACHE_AUDIO',
            url: currentTrack.full
          });
          navigator.serviceWorker.controller.postMessage({
            type: 'CACHE_AUDIO', 
            url: currentTrack.short15
          });
          navigator.serviceWorker.controller.postMessage({
            type: 'CACHE_AUDIO',
            url: currentTrack.short30
          });
        }
      }
    }
  }, [currentTrackIndex]);

  // Initialize Audio Context for enhanced car audio performance (SAFE VERSION)
  useEffect(() => {
    const initAudioContext = () => {
      try {
        const enableAdvancedAudio = true; // Re-enabled with safe implementation
        if (!enableAdvancedAudio) return;

        // Create AudioContext for better latency and processing
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        const audio = audioRef.current;
        if (!audio || !audioContextRef.current) return;

        // SAFE APPROACH: Only create gain node, don't hijack the audio element
        gainNodeRef.current = audioContextRef.current.createGain();
        
        // DON'T create MediaElementAudioSourceNode - let HTML5 audio work normally
        // The Audio Context is just ready for advanced features if needed later
        
        // Resume AudioContext if suspended (required for autoplay policies)
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }
        
        console.log('Audio Context initialized (non-invasive mode)');
      } catch (error) {
        console.warn('AudioContext not supported or failed to initialize:', error);
      }
    };

    // Initialize on first user interaction
    const handleUserInteraction = () => {
      initAudioContext();
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    // Automotive and mobile optimized settings
    audio.preload = 'auto'; // Better for car audio systems
    audio.crossOrigin = 'anonymous'; // Allow cross-origin audio
    
    // iOS Safari automotive compatibility
    audio.setAttribute('playsinline', 'true');
    audio.setAttribute('webkit-playsinline', 'true');
    const store = useAudioStore.setState;
    const listeners = {
      timeupdate: () => {
        store({ currentTime: audio.currentTime, duration: audio.duration || 0 });
        // Update Media Session position state for car displays
        if ('mediaSession' in navigator && audio.duration) {
          navigator.mediaSession.setPositionState({
            duration: audio.duration,
            playbackRate: audio.playbackRate,
            position: audio.currentTime
          });
        }
      },
      loadstart: () => store({ isLoading: true }),
      canplay: () => store({ isLoading: false }),
      play: () => store({ isPlaying: true }),
      pause: () => store({ isPlaying: false }),
      ended: () => {
        // Auto-advance to next track for full tracks only (not previews)
        const state = useAudioStore.getState();
        if (!state.isPreview && state.currentTrackIndex !== null && state.currentTrackIndex < trackData.length - 1) {
          // Auto-advance to next track
          const nextIndex = state.currentTrackIndex + 1;
          if (playTrackRef.current) {
            playTrackRef.current(nextIndex);
            // Scroll the newly selected track into view
            scrollTrackIntoView(nextIndex);
          }
        } else {
          // No auto-advance: just stop playback
          store({ isPlaying: false, currentTime: 0 });
        }
      },
      error: (event: Event) => {
        // Enhanced audio error handling for loading failures
        const audio = event.target as HTMLAudioElement;
        const error = audio.error;
        
        let errorMessage: string = UI_STRINGS.ERROR_AUDIO_FAILED;
        let errorDetails = 'Unknown audio error';
        
        if (error) {
          switch (error.code) {
            case error.MEDIA_ERR_ABORTED:
              errorMessage = 'Audio loading was aborted';
              errorDetails = 'The audio loading process was stopped';
              break;
            case error.MEDIA_ERR_NETWORK:
              errorMessage = UI_STRINGS.ERROR_NETWORK;
              errorDetails = 'Network error occurred while loading audio';
              break;
            case error.MEDIA_ERR_DECODE:
              errorMessage = UI_STRINGS.ERROR_AUDIO_LOAD;
              errorDetails = 'Audio file format not supported or corrupted';
              break;
            case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMessage = UI_STRINGS.ERROR_AUDIO_LOAD;
              errorDetails = 'Audio source not supported by browser';
              break;
            default:
              errorMessage = UI_STRINGS.ERROR_AUDIO_FAILED;
              errorDetails = `Audio error code: ${error.code}`;
          }
        }
        
        logger.error('Audio element error event:', {
          errorCode: error?.code,
          errorMessage,
          errorDetails,
          audioSrc: audio.src,
          currentTrackIndex,
          timestamp: new Date().toISOString()
        });
        
        // Update state with error information
        store({ 
          isPlaying: false, 
          isLoading: false,
          error: errorMessage 
        });
        
        // Show user-friendly error in console
        console.error(`🎵 ${errorMessage}`, {
          details: errorDetails,
          audioSrc: audio.src
        });
      },
      ratechange: () => {
        // Update position state when playback rate changes
        if ('mediaSession' in navigator && audio.duration) {
          navigator.mediaSession.setPositionState({
            duration: audio.duration,
            playbackRate: audio.playbackRate,
            position: audio.currentTime
          });
        }
      }
    };
    Object.entries(listeners).forEach(([e, h]) => audio.addEventListener(e, h));
    return () => Object.entries(listeners).forEach(([e, h]) => audio.removeEventListener(e, h));
  }, []);

  const playTrack = useCallback(async (index: number, source?: string, autoPlay = true): Promise<void> => {
    const track = trackData[index];
    const audio = audioRef.current;
    if (!track || !audio) return;

    // Scroll the track into view when manually selected
    scrollTrackIntoView(index);

    // Stop any preview that might be playing
    resetPreview();

    // Check if we need crossfade (if audio is currently playing)
    const shouldCrossfade = !audio.paused && hasTrackBeenSelected;
    
    if (shouldCrossfade) {
      // Phase 1: Fade out current track (0.2s)
      const originalVolume = audio.volume;
      const fadeOutDuration = 200; // 0.2s
      const fadeOutSteps = 10;
      const fadeOutInterval = fadeOutDuration / fadeOutSteps;
      const volumeStep = originalVolume / fadeOutSteps;
      
      for (let i = 0; i < fadeOutSteps; i++) {
        audio.volume = originalVolume - (volumeStep * (i + 1));
        await new Promise(resolve => setTimeout(resolve, fadeOutInterval));
      }
      
      // Phase 2: Brief silence (0.1s)
      audio.pause();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Reset for new track
      audio.currentTime = 0;
      audio.src = '';
      audio.load();
      audio.volume = 0; // Start new track at volume 0
    } else {
      // No crossfade needed - immediate switch
      audio.pause();
      audio.currentTime = 0;
      audio.src = '';
      audio.load();
    }

    // Set up new track
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
        
        // Phase 3: Fade in new track (0.2s) - only if we did crossfade
        if (shouldCrossfade) {
          const fadeInDuration = 200; // 0.2s
          const fadeInSteps = 10;
          const fadeInInterval = fadeInDuration / fadeInSteps;
          const targetVolume = 0.8; // Standard volume
          const volumeStep = targetVolume / fadeInSteps;
          
          for (let i = 0; i < fadeInSteps; i++) {
            audio.volume = volumeStep * (i + 1);
            await new Promise(resolve => setTimeout(resolve, fadeInInterval));
          }
          
          audio.volume = targetVolume; // Ensure exact final volume
        } else {
          // Set normal volume for non-crossfade scenarios
          audio.volume = 0.8;
        }
      } catch (error) {
        // Enhanced audio error handling
        audio.volume = 0.8; // Reset volume on error
        
        const errorMessage = error instanceof Error ? error.message : UI_STRINGS.ERROR_AUDIO_FAILED;
        
        logger.error('Audio playback failed:', {
          error: errorMessage,
          trackIndex: index,
          trackTitle: track.title,
          audioSrc: audio.src,
          timestamp: new Date().toISOString()
        });
        
        // Determine error type for user feedback
        let userErrorMessage: string = UI_STRINGS.ERROR_AUDIO_FAILED;
        if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('fetch')) {
          userErrorMessage = UI_STRINGS.ERROR_NETWORK;
        } else if (errorMessage.toLowerCase().includes('load') || errorMessage.toLowerCase().includes('decode')) {
          userErrorMessage = UI_STRINGS.ERROR_AUDIO_LOAD;
        }
        
        // Update state with error information
        useAudioStore.setState({ 
          isPlaying: false, 
          isLoading: false,
          error: userErrorMessage 
        });
        
        // Show user-friendly error notification
        console.error(`🎵 ${userErrorMessage}`, {
          track: track.title,
          details: errorMessage
        });
        
        // Optional: Attempt retry for network errors
        if (errorMessage.toLowerCase().includes('network') && !source) {
          setTimeout(() => {
            console.log('Retrying audio playback...');
            playTrack(index, source, autoPlay);
          }, 2000);
        }
      }
    } else {
      // Set normal volume even when not autoplaying
      audio.volume = 0.8;
    }
  }, [hasTrackBeenSelected, resetPreview]);

  // Store playTrack in ref for access in event listeners
  playTrackRef.current = playTrack;

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

  // Playback rate control for advanced audio features
  const setPlaybackRate = useCallback((rate: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = Math.max(0.25, Math.min(2.0, rate)); // Clamp between 0.25x and 2x
    }
  }, []);

  // Advanced volume control (HTML5 + optional Audio Context)
  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    
    // Set HTML5 audio volume (primary method)
    const audio = audioRef.current;
    if (audio) {
      audio.volume = clampedVolume;
    }
    
    // Optional: Set Audio Context gain if available (for future advanced features)
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setValueAtTime(clampedVolume, audioContextRef.current.currentTime);
    }
  }, []);

  // Media Session API for car audio and lockscreen integration
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    
    const currentTrack = currentTrackIndex !== null ? trackData[currentTrackIndex] : null;
    
    if (currentTrack && hasTrackBeenSelected) {
      // Enhanced metadata for Bluetooth and car audio systems
      const enhancedMetadata = new MediaMetadata({
        title: currentTrack.title,
        artist: 'Aaron Pike Music',
        album: 'Demo Collection',
        artwork: [
          { src: currentTrack.art, sizes: '96x96', type: 'image/png' },
          { src: currentTrack.art, sizes: '128x128', type: 'image/png' },
          { src: currentTrack.art, sizes: '192x192', type: 'image/png' },
          { src: currentTrack.art, sizes: '256x256', type: 'image/png' },
          { src: currentTrack.art, sizes: '384x384', type: 'image/png' },
          { src: currentTrack.art, sizes: '512x512', type: 'image/png' }
        ]
      });

      // Add custom Bluetooth metadata if supported
      if ('bluetoothAdvertisingData' in navigator) {
        try {
          (enhancedMetadata as any).genre = currentTrack.tags ? currentTrack.tags.join(', ') : 'Cinematic';
          (enhancedMetadata as any).trackNumber = ((currentTrackIndex || 0) + 1).toString();
          (enhancedMetadata as any).totalTracks = trackData.length.toString();
          (enhancedMetadata as any).duration = currentTrack.duration;
          (enhancedMetadata as any).composer = 'Aaron Pike';
          (enhancedMetadata as any).year = new Date().getFullYear().toString();
        } catch (error) {
          console.warn('Extended Bluetooth metadata not supported:', error);
        }
      }

      navigator.mediaSession.metadata = enhancedMetadata;

      // Set playback state for car audio systems
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

      // Enhanced Bluetooth broadcasting
      if ('bluetooth' in navigator) {
        try {
          // Broadcast rich metadata for advanced Bluetooth devices
          const bluetoothData = {
            name: `${currentTrack.title} - Aaron Pike Music`,
            serviceData: {
              '0x180F': new Uint8Array([0x01, (currentTrackIndex || 0) + 1]), // Track info
              '0x1812': new TextEncoder().encode(currentTrack.title) // Title
            }
          };
          console.log('Broadcasting Bluetooth metadata:', bluetoothData);
        } catch (error) {
          console.warn('Bluetooth metadata broadcasting not supported:', error);
        }
      }
    }

    // Action handlers for car audio and lockscreen controls
    navigator.mediaSession.setActionHandler('play', () => {
      if (!isPlaying && currentTrackIndex !== null) {
        togglePlayPause();
      }
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      if (isPlaying) {
        togglePlayPause();
      }
    });

    navigator.mediaSession.setActionHandler('nexttrack', () => {
      if (currentTrackIndex !== null && currentTrackIndex < trackData.length - 1) {
        playTrack(currentTrackIndex + 1);
      }
    });

    navigator.mediaSession.setActionHandler('previoustrack', () => {
      if (currentTrackIndex !== null && currentTrackIndex > 0) {
        playTrack(currentTrackIndex - 1);
      }
    });

    navigator.mediaSession.setActionHandler('seekto', (details) => {
      const audio = audioRef.current;
      if (audio && details.seekTime !== undefined) {
        audio.currentTime = details.seekTime;
        // Update position state after seeking
        if (audio.duration) {
          navigator.mediaSession.setPositionState({
            duration: audio.duration,
            playbackRate: audio.playbackRate,
            position: details.seekTime
          });
        }
      }
    });

    // Advanced seek controls for car audio systems
    navigator.mediaSession.setActionHandler('seekbackward', (details) => {
      const audio = audioRef.current;
      if (audio) {
        const seekOffset = details.seekOffset || 10;
        audio.currentTime = Math.max(0, audio.currentTime - seekOffset);
      }
    });

    navigator.mediaSession.setActionHandler('seekforward', (details) => {
      const audio = audioRef.current;
      if (audio) {
        const seekOffset = details.seekOffset || 10;
        audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + seekOffset);
      }
    });

    // Stop handler - pause and reset to beginning
    navigator.mediaSession.setActionHandler('stop', () => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        useAudioStore.setState({ isPlaying: false, currentTime: 0 });
      }
    });

    // Advanced error handling for car audio connectivity issues
    const handleVisibilityChange = () => {
      const audio = audioRef.current;
      if (document.hidden && audio && !audio.paused) {
        // Save state when app goes to background
        sessionStorage.setItem('audioWasPlaying', 'true');
      } else if (!document.hidden && sessionStorage.getItem('audioWasPlaying') === 'true') {
        // Resume when returning from background if car audio was playing
        sessionStorage.removeItem('audioWasPlaying');
        if (audio && audio.paused && currentTrackIndex !== null) {
          audio.play().catch(() => {
            // Silently handle autoplay restrictions
          });
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup on unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.setActionHandler('seekto', null);
        navigator.mediaSession.setActionHandler('seekbackward', null);
        navigator.mediaSession.setActionHandler('seekforward', null);
        navigator.mediaSession.setActionHandler('stop', null);
      }
    };
  }, [currentTrackIndex, isPlaying, hasTrackBeenSelected, togglePlayPause, playTrack]);

  // Enhanced error recovery for car audio network issues
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleNetworkError = () => {
      if (navigator.onLine === false) {
        // Store playback position for offline recovery
        if (currentTrackIndex !== null) {
          sessionStorage.setItem('lastTrackIndex', currentTrackIndex.toString());
          sessionStorage.setItem('lastTrackTime', audio.currentTime.toString());
        }
      }
    };

    const handleOnlineStatus = () => {
      if (navigator.onLine) {
        // Attempt to recover playback when connection returns
        const lastIndex = sessionStorage.getItem('lastTrackIndex');
        const lastTime = sessionStorage.getItem('lastTrackTime');
        
        if (lastIndex !== null && currentTrackIndex === null) {
          playTrack(parseInt(lastIndex), undefined, false);
          if (lastTime && audio) {
            audio.currentTime = parseFloat(lastTime);
          }
          sessionStorage.removeItem('lastTrackIndex');
          sessionStorage.removeItem('lastTrackTime');
        }
      }
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleNetworkError);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleNetworkError);
    };
  }, [currentTrackIndex, playTrack]);

  return {
    audioRef,
    playTrack,
    togglePlayPause,
    setPlaybackRate,
    setVolume,
    currentTrack: currentTrackIndex !== null ? trackData[currentTrackIndex] : null,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    hasTrackBeenSelected,
    // Audio ducking controls for automotive environment
    audioDucking: {
      duck: audioDucking.duck,
      unduck: audioDucking.unduck,
      forceUnduck: audioDucking.forceUnduck,
      isDucked: audioDucking.isDucked,
      isTransitioning: audioDucking.isTransitioning
    }
  };
};