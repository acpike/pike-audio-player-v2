import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PlayButton } from './PlayButton';
import { ProgressBar } from './ProgressBar';
import { TagsToggle } from '../UI/TagsToggle';
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
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const previousTrackRef = useRef<Track | null>(null);
  
  // Auto-hide play button state
  const [isPlayButtonVisible, setIsPlayButtonVisible] = useState(true);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // CSS Modules class helpers - QA Compliant
  const getAudioPlayerClass = () => {
    return isLandscapeMode ? styles.audioPlayerLandscape : styles.audioPlayer;
  };

  const getCoverWrapperClass = () => {
    if (isLandscapeMode && isDescriptionExpanded) return styles.coverWrapperLandscapeExpanded;
    if (isLandscapeMode) return styles.coverWrapperLandscape;
    return styles.coverWrapper;
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
    return `${baseClass} ${specificClass}`;
  };

  const getStatusTextClass = () => {
    const baseClass = styles.statusTextBase;
    const specificClass = isLandscapeMode ? styles.statusTextLandscape : styles.statusText;
    return `${baseClass} ${specificClass}`;
  };

  const getDescriptionWrapperClass = () => {
    if (isLandscapeMode && isDescriptionExpanded) return styles.descriptionWrapperLandscapeExpanded;
    if (isLandscapeMode) return styles.descriptionWrapperLandscape;
    if (isDescriptionExpanded) return styles.descriptionWrapperExpanded;
    return styles.descriptionWrapper;
  };

  const getMorphingDescriptionClass = () => {
    if (isLandscapeMode && isDescriptionExpanded) return styles.morphingDescriptionLandscapeExpanded;
    if (isLandscapeMode) return styles.morphingDescriptionLandscape;
    if (isDescriptionExpanded) return styles.morphingDescriptionExpanded;
    return styles.morphingDescription;
  };

  const getDescriptionTextClass = () => {
    const baseClass = styles.descriptionTextBase;
    const specificClass = isLandscapeMode ? styles.descriptionTextLandscape : styles.descriptionText;
    return `${baseClass} ${specificClass}`;
  };

  const getButtonTextClass = () => {
    return isLandscapeMode ? styles.buttonTextLandscape : styles.buttonText;
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

  // Auto-collapse description when track changes, auto-expand during preview
  useEffect(() => {
    if (previousTrackRef.current && currentTrack && previousTrackRef.current.title !== currentTrack.title) {
      setIsDescriptionExpanded(false);
    }
    previousTrackRef.current = currentTrack;
  }, [currentTrack]);
  
  // Auto-expand description during preview (playing or paused), collapse when preview ends
  useEffect(() => {
    if (previewTrackIndex !== null) {
      setIsDescriptionExpanded(true);
    } else {
      // Collapse description when preview ends completely
      setIsDescriptionExpanded(false);
    }
  }, [previewTrackIndex]);

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

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
      
      {/* Album info below cover art - shown on initial load */}
      {!hasTrackBeenSelected && (
        <div className={styles.initialAlbumInfo}>
          <div className={isPortraitMode ? styles.albumNameWithTags : styles.initialAlbumName}>
            <span>{trackData[0]?.album || UI_STRINGS.UNKNOWN_ALBUM}</span>
            {isPortraitMode && <TagsToggle />}
          </div>
          <div className={styles.initialTrackCount}>
            {UI_STRINGS.TRACKS_COUNT(trackData.length)}
          </div>
        </div>
      )}
      
      <div className={getTrackInfoClass()}>
        {!isLandscapeMode && (
          <>
            <h1 
              className={getTrackTitleClass()}
              onClick={toggleDebugPanel}
              style={{ cursor: 'pointer' }}
            >
              {previewTrackIndex !== null && displayTrack ? (
                <>
                  {displayTrack.title}
                  <span style={{ 
                    fontSize: '0.6em', 
                    fontWeight: 400, 
                    marginLeft: '8px',
                    opacity: 0.8 
                  }}>
                    (preview)
                  </span>
                </>
              ) : displayTrack 
                ? displayTrack.title 
                : UI_STRINGS.UNKNOWN_ALBUM
              }
            </h1>
            
            {hasTrackBeenSelected && (
              <div className={getStatusTextClass()}>
                {isLoading ? UI_STRINGS.LOADING : isPlaying ? 'Playing' : 'Paused'}
              </div>
            )}
          </>
        )}
        
        {/* Morphing Description Component */}
        {(hasTrackBeenSelected || previewTrackIndex !== null) && displayTrack && (
          <div className={getDescriptionWrapperClass()}>
            <div 
              key={displayTrack.title}
              className={getMorphingDescriptionClass()}
              onClick={previewTrackIndex !== null ? undefined : toggleDescription}
              role={previewTrackIndex !== null ? undefined : "button"}
              tabIndex={previewTrackIndex !== null ? -1 : 0}
              onKeyDown={previewTrackIndex !== null ? undefined : (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleDescription();
                }
              }}
              aria-label={previewTrackIndex !== null ? 'Preview description' : (isDescriptionExpanded ? 'Collapse description' : 'Expand description')}
              style={previewTrackIndex !== null ? { cursor: 'default' } : undefined}
            >
              {isDescriptionExpanded ? (
                <p className={getDescriptionTextClass()}>
                  {displayTrack.description || 'No description available for this track.'}
                </p>
              ) : (
                <span className={getButtonTextClass()}>
                  {UI_STRINGS.DESCRIPTION}
                </span>
              )}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};