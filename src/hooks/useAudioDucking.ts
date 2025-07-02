import { useEffect, useRef, useCallback } from 'react';
import { logger } from '../utils/logger';

/**
 * Audio Ducking Hook
 * 
 * Manages automatic volume reduction during phone calls and navigation announcements
 * for automotive environments. Provides smooth transitions and restoration.
 */

interface AudioDuckingOptions {
  /** Original volume level (0-1) */
  originalVolume: number;
  /** Ducked volume level (0-1) */
  duckedVolume: number;
  /** Transition duration in milliseconds */
  transitionDuration: number;
  /** Audio element to control */
  audioElement: HTMLAudioElement | null;
  /** Callback when ducking state changes */
  onDuckingChange?: (isDucked: boolean) => void;
}

interface AudioDuckingState {
  isDucked: boolean;
  isTransitioning: boolean;
  currentVolume: number;
}

export const useAudioDucking = (options: AudioDuckingOptions) => {
  const {
    originalVolume,
    duckedVolume = 0.2,
    transitionDuration = 500,
    audioElement,
    onDuckingChange
  } = options;

  const stateRef = useRef<AudioDuckingState>({
    isDucked: false,
    isTransitioning: false,
    currentVolume: originalVolume
  });

  const animationFrameRef = useRef<number | null>(null);
  const transitionStartRef = useRef<number>(0);

  /**
   * Smooth volume transition using requestAnimationFrame
   */
  const transitionVolume = useCallback((
    targetVolume: number,
    onComplete?: () => void
  ) => {
    if (!audioElement) return;

    const startVolume = audioElement.volume;
    const startTime = performance.now();
    transitionStartRef.current = startTime;
    stateRef.current.isTransitioning = true;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / transitionDuration, 1);
      
      // Use easeInOutCubic for smooth transitions
      const easeProgress = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      const currentVolume = startVolume + (targetVolume - startVolume) * easeProgress;
      audioElement.volume = Math.max(0, Math.min(1, currentVolume));
      stateRef.current.currentVolume = currentVolume;

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        stateRef.current.isTransitioning = false;
        animationFrameRef.current = null;
        onComplete?.();
        logger.debug('Audio ducking transition completed', {
          targetVolume,
          finalVolume: audioElement.volume
        });
      }
    };

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [audioElement, transitionDuration]);

  /**
   * Duck the audio (reduce volume)
   */
  const duck = useCallback(() => {
    if (stateRef.current.isDucked || !audioElement) return;

    logger.info('Audio ducking: Reducing volume for external audio');
    stateRef.current.isDucked = true;
    
    transitionVolume(duckedVolume, () => {
      onDuckingChange?.(true);
    });
  }, [audioElement, duckedVolume, transitionVolume, onDuckingChange]);

  /**
   * Unduck the audio (restore volume)
   */
  const unduck = useCallback(() => {
    if (!stateRef.current.isDucked || !audioElement) return;

    logger.info('Audio ducking: Restoring original volume');
    stateRef.current.isDucked = false;
    
    transitionVolume(originalVolume, () => {
      onDuckingChange?.(false);
    });
  }, [audioElement, originalVolume, transitionVolume, onDuckingChange]);

  /**
   * Force unduck (immediate restoration)
   */
  const forceUnduck = useCallback(() => {
    if (!audioElement) return;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    stateRef.current.isDucked = false;
    stateRef.current.isTransitioning = false;
    audioElement.volume = originalVolume;
    stateRef.current.currentVolume = originalVolume;
    
    onDuckingChange?.(false);
    logger.info('Audio ducking: Force unduck applied');
  }, [audioElement, originalVolume, onDuckingChange]);

  /**
   * Handle phone call detection via Page Visibility API
   */
  useEffect(() => {
    let isInCall = false;

    const handleVisibilityChange = () => {
      // Check if we're in a call context (navigation announcement, phone call, etc.)
      if (document.hidden && audioElement && !audioElement.paused) {
        // Check for signs of phone call or navigation
        const isLikelyCall = (
          'wakeLock' in navigator && 
          window.innerHeight !== screen.height // Indicates overlay (call/navigation)
        );

        if (isLikelyCall && !isInCall) {
          isInCall = true;
          duck();
        }
      } else if (!document.hidden && isInCall) {
        isInCall = false;
        // Delay unduck to avoid conflict with navigation ending
        setTimeout(unduck, 1000);
      }
    };

    const handleAudioInterruption = () => {
      if (audioElement && !audioElement.paused) {
        duck();
        
        // Auto-unduck after a reasonable time
        setTimeout(() => {
          if (stateRef.current.isDucked) {
            unduck();
          }
        }, 5000);
      }
    };

    // Listen for various interruption events
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Audio interruption events (for mobile browsers)
    audioElement?.addEventListener('pause', handleAudioInterruption);
    
    // Navigation detection (mobile/automotive devices only for privacy)
    const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const hasOrientation = 'orientation' in window;
    const isLikelyAutomotive = isMobileDevice || hasOrientation;

    if ('geolocation' in navigator && isLikelyAutomotive) {
      let watchId: number | null = null;
      
      const startNavigationWatch = () => {
        watchId = navigator.geolocation.watchPosition(
          () => {
            // If position changes rapidly, likely navigation is active
            // This is a heuristic for navigation apps
            logger.debug('Navigation activity detected via geolocation');
          },
          (error) => {
            logger.debug('Geolocation error (expected on desktop)', { error: error.message });
          }, // Error handler
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 1000 }
        );
      };

      // Only watch if user grants permission on mobile/automotive devices
      navigator.geolocation.getCurrentPosition(
        startNavigationWatch,
        (error) => {
          logger.debug('Geolocation permission denied or unavailable', { error: error.message });
        }, // Don't duck if no location permission
        { timeout: 1000 }
      );

      return () => {
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
        }
      };
    } else {
      logger.debug('Geolocation navigation detection disabled on desktop for privacy');
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      audioElement?.removeEventListener('pause', handleAudioInterruption);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioElement, duck, unduck]);

  /**
   * Bluetooth SCO (Synchronous Connection-Oriented) detection
   * Detects hands-free profile connections for calls
   */
  useEffect(() => {
    const handleAudioDeviceChange = () => {
      if ('mediaDevices' in navigator && 'enumerateDevices' in navigator.mediaDevices) {
        navigator.mediaDevices.enumerateDevices()
          .then(devices => {
            const hasBluetoothSCO = devices.some(device => 
              device.kind === 'audiooutput' && 
              device.label.toLowerCase().includes('sco')
            );

            if (hasBluetoothSCO && !stateRef.current.isDucked) {
              logger.info('Audio ducking: Bluetooth SCO detected, ducking audio');
              duck();
              
              // Auto-unduck after call likely ends
              setTimeout(() => {
                if (stateRef.current.isDucked) {
                  unduck();
                }
              }, 3000);
            }
          })
          .catch(error => {
            logger.warn('Audio ducking: Could not enumerate devices', error);
          });
      }
    };

    // Listen for device changes (Bluetooth connections)
    if ('mediaDevices' in navigator) {
      navigator.mediaDevices.addEventListener('devicechange', handleAudioDeviceChange);
      
      return () => {
        navigator.mediaDevices.removeEventListener('devicechange', handleAudioDeviceChange);
      };
    }
  }, [duck, unduck]);

  /**
   * Manual ducking controls for external triggers
   */
  const controls = {
    duck,
    unduck,
    forceUnduck,
    isDucked: () => stateRef.current.isDucked,
    isTransitioning: () => stateRef.current.isTransitioning,
    getCurrentVolume: () => stateRef.current.currentVolume
  };

  return controls;
};

/**
 * Utility function to create audio ducking with sensible defaults
 */
export const createAudioDucking = (
  audioElement: HTMLAudioElement | null,
  originalVolume: number = 0.8,
  onDuckingChange?: (isDucked: boolean) => void
) => {
  return useAudioDucking({
    audioElement,
    originalVolume,
    duckedVolume: 0.2,
    transitionDuration: 500,
    onDuckingChange
  });
};