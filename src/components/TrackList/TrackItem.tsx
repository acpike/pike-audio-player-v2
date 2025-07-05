import React, { useRef, useState, useEffect } from 'react';
import { Track } from '../../types/tracks';
import { useUIStore } from '../../stores/uiStore';
import { usePreviewStore } from '../../stores/previewStore';
import { useTrackColors } from '../../hooks/useTrackColors';
import { scrollTrackIntoView } from '../../utils/scrollToTrack';
// import { AUDIO_CONSTANTS } from '../../constants/audio';
import { PreviewOverlay } from './PreviewOverlay';
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
    previewCurrentTime,
    setPreviewTrack,
    playPreview,
    pausePreview,
    resumePreview
  } = usePreviewStore();
  const itemRef = useRef<HTMLDivElement>(null);
  const tagsContainerRef = useRef<HTMLDivElement>(null);
  const [visibleTagCount, setVisibleTagCount] = useState(track.tags.length);
  
  // Double-tap detection state
  const [lastTapTime, setLastTapTime] = useState(0);
  const [singleTapTimer, setSingleTapTimer] = useState<NodeJS.Timeout | null>(null);
  const doubleTapThreshold = 300; // 300ms for double-tap detection
  
  
  
  // Determine if THIS track is currently playing a preview
  const isThisTrackPreviewPlaying = previewTrackIndex === index && isPreviewPlaying;
  
  // Determine if THIS track is the selected preview (playing OR paused)
  const isThisTrackPreviewSelected = previewTrackIndex === index;
  
  // Track tile container: Show active state for both preview and full track
  const shouldTrackGlow = isThisTrackPreviewSelected || (previewTrackIndex === null && isActive);
  
  // Visual hierarchy system:
  // Preview state: Track tile + thumbnail glow (user focus on track list)
  // Full track state: Track tile glows, thumbnail no glow (user focus on main player)
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
  
  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (singleTapTimer) {
        clearTimeout(singleTapTimer);
      }
    };
  }, [singleTapTimer]);
  

  // QA Compliant CSS Modules class helpers
  const getTrackItemClass = () => {
    const baseClass = shouldTrackGlow ? `${styles.trackItem} ${styles.active}` : styles.trackItem;
    const landscapeClass = isLandscapeMode ? `${baseClass} ${styles.trackItemLandscape}` : baseClass;
    // Use wrapped class when description is showing to enable text flow
    return tagsToggleState === 'description' ? `${landscapeClass} ${styles.trackItemWrapped}` : landscapeClass;
  };

  const getTrackThumbnailClass = () => {
    const baseClass = isLandscapeMode ? styles.trackThumbnailLandscape : styles.trackThumbnail;
    const glowClass = shouldThumbnailGlow ? `${baseClass} ${styles.thumbnailGlow}` : baseClass;
    // Don't add trackThumbnailFloat class - floating is handled by container
    return glowClass;
  };

  const getTrackInfoClass = () => {
    const baseClass = isLandscapeMode ? styles.trackInfoLandscape : styles.trackInfo;
    // Keep normal track info class - wrapping is handled at track item level
    return baseClass;
  };

  const getTrackTitleClass = () => {
    return isLandscapeMode ? styles.trackTitleLandscape : styles.trackTitle;
  };



  const getTrackDurationClass = () => {
    return isLandscapeMode ? styles.trackDurationLandscape : styles.trackDuration;
  };
  



  const handleTrackClick = () => {
    const currentTime = Date.now();
    const timeDifference = currentTime - lastTapTime;
    
    // Scroll the track into view using utility function
    scrollTrackIntoView(index);
    
    if (timeDifference < doubleTapThreshold && lastTapTime > 0) {
      // Double-tap detected - clear any pending single tap and handle preview
      if (singleTapTimer) {
        clearTimeout(singleTapTimer);
        setSingleTapTimer(null);
      }
      handlePreviewToggle();
      setLastTapTime(0); // Reset to prevent triple-tap issues
    } else {
      // Potential single tap - set timer to execute after double-tap threshold
      const timer = setTimeout(() => {
        handleSingleTap();
        setSingleTapTimer(null);
      }, doubleTapThreshold);
      
      setSingleTapTimer(timer);
      setLastTapTime(currentTime);
    }
  };
  
  const handleSingleTap = () => {
    // During preview mode, any single tap should start full playback
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
  
  const handlePreviewToggle = () => {
    if (isThisTrackPreviewSelected) {
      // Track is already selected for preview - toggle play/pause
      if (isPreviewPlaying) {
        pausePreview();
      } else {
        resumePreview();
      }
    } else {
      // Start preview for this track
      setPreviewTrack(index, track.short15);
      playPreview(track.short15);
    }
  };


  return (
      <div 
        ref={itemRef}
        className={getTrackItemClass()}
        onClick={handleTrackClick}
        data-track-index={index}
        style={trackColors ? {
          '--glow-r': trackColors.r,
          '--glow-g': trackColors.g,
          '--glow-b': trackColors.b
        } as React.CSSProperties : undefined}
      >
      <div 
        style={{ 
          position: 'relative',
          display: tagsToggleState === 'description' ? 'inline-block' : 'block'
        }}
        className={tagsToggleState === 'description' ? styles.thumbnailFloatContainer : ''}
      >
        <img 
          src={track.art} 
          alt={`${track.title} cover art`}
          className={getTrackThumbnailClass()}
          loading="lazy"
        />
        <PreviewOverlay
          isVisible={isThisTrackPreviewPlaying}
          progress={previewProgress}
          timeRemaining={15 - previewCurrentTime}
        />
      </div>
      
      <div className={getTrackInfoClass()}>
        <div className={styles.titleDurationRow}>
          <h3 className={getTrackTitleClass()}>{track.title}</h3>
          <div className={getTrackDurationClass()}>{track.duration}</div>
        </div>
        
        {tagsToggleState === 'tags' && (
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
      
      {tagsToggleState === 'description' && (
        <div className={styles.trackDescription}>
          <p className={styles.trackDescriptionText}>
            {track.description}
          </p>
        </div>
      )}
      </div>
  );
};