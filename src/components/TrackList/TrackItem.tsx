import React, { useRef, useState, useEffect } from 'react';
import { Track } from '../../types/tracks';
import { useUIStore } from '../../stores/uiStore';
import { usePreviewStore } from '../../stores/previewStore';
import { useTrackColors } from '../../hooks/useTrackColors';
import { scrollTrackIntoView } from '../../utils/scrollToTrack';
// import { AUDIO_CONSTANTS } from '../../constants/audio';
import { PreviewButton } from './PreviewButton';
import styles from './TrackItem.module.css';

interface TrackItemProps {
  track: Track;
  index: number;
  isActive: boolean;
  playTrack: (index: number, source?: string, autoPlay?: boolean) => Promise<void>;
  togglePlayPause: () => Promise<void>;
}

export const TrackItem: React.FC<TrackItemProps> = ({ track, index, isActive, playTrack, togglePlayPause }) => {
  const { tagsToggleState, isLandscapeMode } = useUIStore();
  const { 
    isPreviewPlaying, 
    previewTrackIndex, 
    previewProgress,
    setPreviewTrack,
    playPreview,
    pausePreview,
    resumePreview
  } = usePreviewStore();
  const itemRef = useRef<HTMLDivElement>(null);
  const tagsContainerRef = useRef<HTMLDivElement>(null);
  const [visibleTagCount, setVisibleTagCount] = useState(track.tags.length);
  
  // Simple description overlay state
  const [showDescription, setShowDescription] = useState(false);
  
  // Simple touch tracking for swipe detection
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  
  // Determine if THIS track is currently playing a preview
  const isThisTrackPreviewPlaying = previewTrackIndex === index && isPreviewPlaying;
  
  // Determine if THIS track is the selected preview (playing OR paused)
  const isThisTrackPreviewSelected = previewTrackIndex === index;
  
  // Track tile container: Show active state for both preview and full track
  const shouldTrackGlow = isThisTrackPreviewSelected || (previewTrackIndex === null && isActive);
  
  // Track tile thumbnail glow: ONLY when THIS track is being previewed
  // Full track glow is handled by main player cover art
  const shouldThumbnailGlow = isThisTrackPreviewSelected;
  
  // Extract colors when any glow is needed (track tile or thumbnail)
  const trackColors = useTrackColors(track.title, track.art, shouldTrackGlow);

  // Smart tag limiting - measure and hide tags that don't fit
  useEffect(() => {
    if (!tagsToggleState || !tagsContainerRef.current || track.tags.length === 0) return;

    const measureTags = () => {
      const container = tagsContainerRef.current;
      if (!container) return;

      const containerWidth = container.offsetWidth;
      const tags = container.querySelectorAll(`.${styles.trackTag}`);
      let totalWidth = 0;
      let visibleCount = 0;

      for (let i = 0; i < tags.length; i++) {
        const tag = tags[i] as HTMLElement;
        const tagWidth = tag.offsetWidth;
        const gap = i > 0 ? 5 : 0; // 5px gap between tags (--spacing-xs)
        
        if (totalWidth + gap + tagWidth <= containerWidth) {
          totalWidth += gap + tagWidth;
          visibleCount++;
        } else {
          break;
        }
      }

      setVisibleTagCount(visibleCount);
    };

    // Small delay to ensure DOM is rendered
    const timeoutId = setTimeout(measureTags, 10);
    
    // Re-measure on window resize
    window.addEventListener('resize', measureTags);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', measureTags);
    };
  }, [tagsToggleState, track.tags.length]);
  

  // QA Compliant CSS Modules class helpers
  const getTrackItemClass = () => {
    const baseClass = shouldTrackGlow ? `${styles.trackItem} ${styles.active}` : styles.trackItem;
    return isLandscapeMode ? `${baseClass} ${styles.trackItemLandscape}` : baseClass;
  };

  const getTrackThumbnailClass = () => {
    const baseClass = isLandscapeMode ? styles.trackThumbnailLandscape : styles.trackThumbnail;
    return shouldThumbnailGlow ? `${baseClass} ${styles.thumbnailGlow}` : baseClass;
  };

  const getTrackInfoClass = () => {
    return isLandscapeMode ? styles.trackInfoLandscape : styles.trackInfo;
  };

  const getTrackTitleClass = () => {
    return isLandscapeMode ? styles.trackTitleLandscape : styles.trackTitle;
  };

  const getPreviewButtonsClass = () => {
    return isLandscapeMode ? styles.previewButtonsLandscape : styles.previewButtons;
  };


  const getTrackDurationClass = () => {
    return isLandscapeMode ? styles.trackDurationLandscape : styles.trackDuration;
  };
  

  // Simple touch handlers for swipe detection
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touchStart.x - touch.clientX; // Positive for left swipe
    const deltaY = Math.abs(touch.clientY - touchStart.y);
    
    // Only trigger if it's a clear horizontal left swipe (threshold: 60px)
    if (deltaX > 60 && deltaY < 40) {
      setShowDescription(true);
      e.preventDefault(); // Prevent any other touch interactions
    }
    
    setTouchStart(null);
  };

  const handleCloseDescription = () => {
    setShowDescription(false);
  };

  const handleTrackClick = () => {
    // Don't trigger click if description is showing
    if (showDescription) return;
    
    // Scroll the track into view using utility function
    scrollTrackIntoView(index);
    
    // During preview mode, any track click should start full playback
    if (previewTrackIndex !== null) {
      // Stop any preview and play this track's full version
      playTrack(index, undefined, true);
    } else if (isActive) {
      // If this track is already active (and no preview), toggle play/pause
      togglePlayPause();
    } else {
      // If this is a different track, play it
      playTrack(index);
    }
  };


  return (
    <div className={styles.trackItemWrapper}>
      <div 
        ref={itemRef}
        className={getTrackItemClass()}
        onClick={handleTrackClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        data-track-index={index}
        style={trackColors ? {
          '--glow-r': trackColors.r,
          '--glow-g': trackColors.g,
          '--glow-b': trackColors.b
        } as React.CSSProperties : undefined}
      >
      <img 
        src={track.art} 
        alt={`${track.title} cover art`}
        className={getTrackThumbnailClass()}
        loading="lazy"
      />
      
      <div className={getTrackInfoClass()}>
        <div className={styles.trackTopRow}>
          <h3 className={getTrackTitleClass()}>{track.title}</h3>
          <div className={getPreviewButtonsClass()}>
            <PreviewButton
              isPlaying={isThisTrackPreviewPlaying}
              isPaused={isThisTrackPreviewSelected && !isPreviewPlaying}
              progress={previewProgress}
              onToggle={async () => {
                if (isThisTrackPreviewPlaying) {
                  // If this track's preview is playing, pause it
                  pausePreview();
                } else if (previewTrackIndex === index && !isPreviewPlaying) {
                  // If this track was previewing but paused, resume it
                  await resumePreview();
                } else {
                  // If not playing preview or different track, start new preview
                  setPreviewTrack(index, track.short15);
                  await playPreview(track.short15);
                }
              }}
              size="mini"
            />
          </div>
        </div>
        <div className={getTrackDurationClass()}>{track.duration}</div>
        
        {tagsToggleState && (
          <div ref={tagsContainerRef} className={styles.trackTags}>
            {track.tags.map((tag, tagIndex) => (
              <span 
                key={tagIndex} 
                className={`${styles.trackTag} ${tagIndex >= visibleTagCount ? styles.hidden : ''}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      </div>
      
      {/* Simple Description Overlay */}
      {showDescription && (
        <div 
          className={styles.descriptionOverlay}
          onClick={handleCloseDescription}
        >
          <div className={styles.descriptionContent}>
            <button 
              className={styles.closeButton}
              onClick={handleCloseDescription}
              aria-label="Close description"
            >
              →
            </button>
            <p className={styles.descriptionText}>
              {track.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};