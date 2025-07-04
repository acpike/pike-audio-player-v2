import React, { useRef, useState, useEffect } from 'react';
import { Track } from '../../types/tracks';
import { useUIStore } from '../../stores/uiStore';
import { usePreviewStore } from '../../stores/previewStore';
import { useTrackColors } from '../../hooks/useTrackColors';
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
  

  const handleTrackClick = () => {
    // Scroll the track into view if it's partially visible
    if (itemRef.current) {
      const trackElement = itemRef.current;
      const container = trackElement.parentElement;
      
      if (container) {
        const trackRect = trackElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Check if track is partially out of view
        const isPartiallyAbove = trackRect.top < containerRect.top;
        const isPartiallyBelow = trackRect.bottom > containerRect.bottom;
        
        if (isPartiallyAbove || isPartiallyBelow) {
          // Calculate scroll position to center the track
          const trackOffsetTop = trackElement.offsetTop;
          const trackHeight = trackElement.offsetHeight;
          const containerHeight = container.clientHeight;
          
          // Scroll to position that centers the track (or puts it at top if too tall)
          const scrollTop = trackOffsetTop - (containerHeight - trackHeight) / 2;
          
          // Temporarily disable scroll-snap for smooth animation
          container.style.scrollSnapType = 'none';
          
          // Smooth scroll with custom duration
          const startScroll = container.scrollTop;
          const distance = Math.max(0, scrollTop) - startScroll;
          const duration = 600; // 600ms for slower, more polished animation
          const startTime = performance.now();
          
          const animateScroll = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth deceleration
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            
            container.scrollTop = startScroll + (distance * easeOutCubic);
            
            if (progress < 1) {
              requestAnimationFrame(animateScroll);
            } else {
              // Re-enable scroll-snap after animation completes
              container.style.scrollSnapType = 'y mandatory';
            }
          };
          
          requestAnimationFrame(animateScroll);
        }
      }
    }
    
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
  );
};