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
    const landscapeClass = isLandscapeMode ? `${baseClass} ${styles.trackItemLandscape}` : baseClass;
    // Use wrapped class when description is showing to enable text flow
    return tagsToggleState === 'description' ? `${landscapeClass} ${styles.trackItemWrapped}` : landscapeClass;
  };

  const getTrackThumbnailClass = () => {
    const baseClass = isLandscapeMode ? styles.trackThumbnailLandscape : styles.trackThumbnail;
    const glowClass = shouldThumbnailGlow ? `${baseClass} ${styles.thumbnailGlow}` : baseClass;
    // Add float class when description is showing to enable text wrapping
    return tagsToggleState === 'description' ? `${glowClass} ${styles.trackThumbnailFloat}` : glowClass;
  };

  const getTrackInfoClass = () => {
    const baseClass = isLandscapeMode ? styles.trackInfoLandscape : styles.trackInfo;
    // Keep normal track info class - wrapping is handled at track item level
    return baseClass;
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
  



  const handleTrackClick = () => {
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
      <img 
        src={track.art} 
        alt={`${track.title} cover art`}
        className={getTrackThumbnailClass()}
        loading="lazy"
      />
      
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