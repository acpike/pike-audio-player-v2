import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PlayButton } from './PlayButton';
import { ProgressBar } from './ProgressBar';
import { NowPlayingInfo } from '../UI/NowPlayingInfo';
import { useUIStore } from '../../stores/uiStore';
import { usePreviewStore } from '../../stores/previewStore';
import { Track, trackData } from '../../types/tracks';
import { UI_STRINGS } from '../../constants/strings';
import styles from './AudioPlayer.module.css';

/**
 * Props for the AudioPlayer component
 */
interface AudioPlayerProps {
  /** Reference to the HTML audio element for playback control */
  audioRef: React.RefObject<HTMLAudioElement>;
  /** Currently selected track object, null if no track selected */
  currentTrack: Track | null;
  /** Index of currently selected track, null if none selected */
  currentTrackIndex: number | null;
  /** Whether any track has been selected during this session */
  hasTrackBeenSelected: boolean;
  /** Whether audio is currently loading/buffering */
  isLoading: boolean;
  /** Whether audio is currently playing */
  isPlaying: boolean;
  /** Function to toggle play/pause state */
  togglePlayPause: () => Promise<void>;
  /** Function to play a specific track by index */
  playTrack: (index: number, source?: string, autoPlay?: boolean) => Promise<void>;
}

/**
 * AudioPlayer - Core audio playback and control interface
 * 
 * Manages audio playback interface including cover art, track info, play controls,
 * progress bar, and expandable description. Adapts layout for landscape/portrait
 * orientations and provides morphing description functionality.
 * 
 * @param props - AudioPlayer component props
 * @returns React component for audio player interface
 */
export const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  audioRef, 
  currentTrack,
  currentTrackIndex,
  hasTrackBeenSelected, 
  isLoading, 
  isPlaying,
  togglePlayPause,
  playTrack
}) => {
  const { isLandscapeMode, isPortraitMode } = useUIStore();
  const { previewTrackIndex } = usePreviewStore();
  
  // Determine which track to display (preview selected or current)
  const displayTrack = previewTrackIndex !== null 
    ? trackData[previewTrackIndex] 
    : currentTrack;
  
  // Determine if we should show controls (hide during any preview activity)
  const shouldShowControls = previewTrackIndex === null;
  const previousTrackRef = useRef<Track | null>(null);
  
  // Auto-hide play button state
  const [isPlayButtonVisible, setIsPlayButtonVisible] = useState(true);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Dynamic title sizing state
  const [titleSizeClass, setTitleSizeClass] = useState<string>('');
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Swipe gesture state - Conservative implementation (unused in this version)
  // const [isSwipeInProgress, setIsSwipeInProgress] = useState(false);

  // Track navigation functions for swipe gestures
  const goToNextTrack = useCallback(() => {
    if (currentTrackIndex !== null && currentTrackIndex < trackData.length - 1) {
      playTrack(currentTrackIndex + 1);
    }
  }, [currentTrackIndex, playTrack]);

  const goToPreviousTrack = useCallback(() => {
    if (currentTrackIndex !== null && currentTrackIndex > 0) {
      playTrack(currentTrackIndex - 1);
    }
  }, [currentTrackIndex, playTrack]);

  // Simplified touch-based swipe detection for debugging
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    // Check if touch started on progress bar area - if so, ignore for swipe
    const target = e.target as HTMLElement;
    if (target.closest('[class*="progressOverlay"]') || target.closest('[class*="progress"]')) {
      return; // Don't interfere with progress bar interactions
    }
    
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !hasTrackBeenSelected) return;
    
    // Check if we're interacting with progress bar
    const target = e.target as HTMLElement;
    if (target.closest('[class*="progressOverlay"]') || target.closest('[class*="progress"]')) {
      touchStartRef.current = null; // Reset but don't process as swipe
      return; // Don't interfere with progress bar interactions
    }
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;
    
    // Option A: Conservative swipe detection - 50px threshold, horizontal priority
    const SWIPE_THRESHOLD = 50;
    const MAX_SWIPE_TIME = 1000; // 1 second max
    
    // Check if it's a horizontal swipe (more horizontal than vertical movement)
    if (Math.abs(deltaX) > Math.abs(deltaY) && 
        Math.abs(deltaX) > SWIPE_THRESHOLD && 
        deltaTime < MAX_SWIPE_TIME) {
      
      if (deltaX > 0) {
        // Swipe right - previous track
        goToPreviousTrack();
      } else {
        // Swipe left - next track  
        goToNextTrack();
      }
    }
    
    touchStartRef.current = null;
  };

  // CSS Modules class helpers - QA Compliant with state detection
  const getAudioPlayerClass = () => {
    const baseClass = isLandscapeMode ? styles.audioPlayerLandscape : styles.audioPlayer;
    // Add track-selected modifier only in portrait mode
    if (isPortraitMode && hasTrackBeenSelected) {
      return `${baseClass} ${styles.audioPlayerPortraitWithTrack}`;
    }
    return baseClass;
  };

  const getCoverWrapperClass = () => {
    const shouldCoverArtGlow = hasTrackBeenSelected && previewTrackIndex === null;
    const baseClass = isLandscapeMode ? styles.coverWrapperLandscape : styles.coverWrapper;
    
    if (shouldCoverArtGlow) {
      return `${baseClass} ${styles.withTrackGlow}`;
    }
    return baseClass;
  };

  const getCoverArtClass = () => {
    // Cover art glow only for full playback, not during any preview activity
    const shouldCoverArtGlow = hasTrackBeenSelected && previewTrackIndex === null;
    if (isLandscapeMode && shouldCoverArtGlow) return styles.coverArtLandscapeWithTrack;
    if (isLandscapeMode) return styles.coverArtLandscape;
    if (shouldCoverArtGlow) return styles.coverArtWithTrack;
    return styles.coverArt;
  };

  const getButtonContainerClass = () => {
    return isLandscapeMode ? styles.buttonContainerLandscape : styles.buttonContainer;
  };

  const getTrackInfoClass = () => {
    return styles.trackInfo;
  };

  const getTrackTitleClass = () => {
    const baseClass = styles.trackTitleBase;
    const specificClass = isLandscapeMode ? styles.trackTitleLandscape : styles.trackTitle;
    const sizeClass = titleSizeClass ? styles[titleSizeClass] : '';
    return `${baseClass} ${specificClass} ${sizeClass}`.trim();
  };

  const getStatusTextClass = () => {
    const baseClass = styles.statusTextBase;
    const specificClass = isLandscapeMode ? styles.statusTextLandscape : styles.statusText;
    return `${baseClass} ${specificClass}`;
  };



  // Auto-hide play button after 3 seconds when playing
  useEffect(() => {
    // Clear any existing timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    if (isPlaying && hasTrackBeenSelected) {
      // Show button immediately when playing starts
      setIsPlayButtonVisible(true);
      
      // Set timeout to hide after 3 seconds
      hideTimeoutRef.current = setTimeout(() => {
        setIsPlayButtonVisible(false);
      }, 3000);
    } else {
      // Show button when paused or not playing
      setIsPlayButtonVisible(true);
    }

    // Cleanup timeout on unmount
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    };
  }, [isPlaying, hasTrackBeenSelected]);

  // Track previous track for reference
  useEffect(() => {
    previousTrackRef.current = currentTrack;
  }, [currentTrack]);

  // Dynamic title sizing - measures actual text width vs container width
  useEffect(() => {
    const measureTitleSize = () => {
      if (!titleRef.current || !hasTrackBeenSelected || !displayTrack) {
        setTitleSizeClass('');
        return;
      }

      const titleElement = titleRef.current;
      const containerWidth = titleElement.offsetWidth;
      
      // Temporarily remove size class to measure natural width
      titleElement.style.fontSize = '32px'; // Matches --font-size-6xl base size
      titleElement.style.letterSpacing = '0.03em';
      titleElement.style.whiteSpace = 'nowrap';
      
      const textWidth = titleElement.scrollWidth;
      const ratio = textWidth / containerWidth;
      
      // Determine appropriate size class based on overflow ratio
      if (ratio > 1.4) {
        setTitleSizeClass('titleVeryLong');
      } else if (ratio > 1.1) {
        setTitleSizeClass('titleLong');
      } else {
        setTitleSizeClass('');
      }
    };

    // Measure on title change, orientation change, or initial load
    measureTitleSize();
    
    // Re-measure on window resize (orientation changes, etc.)
    window.addEventListener('resize', measureTitleSize);
    
    return () => {
      window.removeEventListener('resize', measureTitleSize);
    };
  }, [displayTrack?.title, hasTrackBeenSelected, isLandscapeMode, isPortraitMode]);
  

  const toggleDebugPanel = () => {
    window.dispatchEvent(new Event('toggleDebugPanel'));
  };

  const handleCoverInteraction = () => {
    // Show button on any cover art interaction
    setIsPlayButtonVisible(true);
    
    // Clear existing timeout and reset the hide timer
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    
    // Only set new timeout if currently playing
    if (isPlaying && hasTrackBeenSelected) {
      hideTimeoutRef.current = setTimeout(() => {
        setIsPlayButtonVisible(false);
      }, 3000);
    }
  };


  return (
    <div className={getAudioPlayerClass()}>
      {/* Simple HTML5 audio element - V7 pattern */}
      <audio ref={audioRef} preload="metadata" />
      {/* V7 Cover wrapper - Clean audio player without visual effects coupling */}
      <div 
        className={getCoverWrapperClass()} 
        onMouseMove={handleCoverInteraction} 
        onTouchStart={(e) => {
          handleCoverInteraction();
          handleTouchStart(e);
        }}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'pan-y' }} // Allow vertical scrolling, handle horizontal gestures
      >
        <img 
          src={displayTrack?.art || "https://static.wixstatic.com/media/ec6721_6320ff4ac93c4fa8b900854d633e6a3b~mv2.png"}
          alt={displayTrack ? `${displayTrack.title} cover art` : "Album art - Select a track below"}
          className={getCoverArtClass()}
        />
        
        {/* V7 Play button overlaid on center of cover art - Hidden during preview */}
        {hasTrackBeenSelected && shouldShowControls && (
          <div className={getButtonContainerClass()}>
            <PlayButton 
              togglePlayPause={togglePlayPause} 
              isPlaying={isPlaying} 
              isLoading={isLoading}
              isVisible={isPlayButtonVisible}
            />
          </div>
        )}
        
        {/* V7 Progress controls overlay - Hidden during preview */}
        {hasTrackBeenSelected && shouldShowControls && (
          <div className={styles.progressOverlay}>
            <ProgressBar audioRef={audioRef} />
          </div>
        )}
      </div>
      
      {/* NOW PLAYING info removed - now handled in unified TrackListHeader */}
      
      {/* Album info removed - now handled by unified track header */}

      
      {/* Track info shown in both orientations for unified red border behavior */}
      <div className={getTrackInfoClass()}>
        <h1 
          ref={titleRef}
          className={getTrackTitleClass()}
          onClick={toggleDebugPanel}
          style={{ cursor: 'pointer' }}
        >
          {displayTrack 
            ? displayTrack.title 
            : isLandscapeMode 
              ? UI_STRINGS.SELECT_TRACK 
              : UI_STRINGS.SELECT_TRACK_BELOW
          }
        </h1>
        
        {(hasTrackBeenSelected || previewTrackIndex !== null) ? (
          <div className={`${getStatusTextClass()} ${isLoading ? styles.statusTextLoading : ''}`}>
            {isLoading ? UI_STRINGS.LOADING : 
             previewTrackIndex !== null ? UI_STRINGS.PREVIEWING :
             hasTrackBeenSelected ? UI_STRINGS.NOW_PLAYING : 
             UI_STRINGS.MUSIC_PLAYER}
          </div>
        ) : (
          <div className={styles.instructionalText}>
            Tap to play <span className={styles.instructionalSeparator}>•</span> Double tap for preview
          </div>
        )}
      </div>
    </div>
  );
};