import React, { useRef, useEffect } from 'react';
import { trackData } from '../../types/tracks';
import { useAudioStore } from '../../stores/audioStore';
import { useUIStore } from '../../stores/uiStore';
import { usePreviewStore } from '../../stores/previewStore';
import { TrackItem } from './TrackItem';
import { TrackListHeader } from './TrackListHeader';
import styles from './TrackList.module.css';

/**
 * Props for the TrackList component
 */
interface TrackListProps {
  /** Function to play a specific track by index */
  playTrack: (index: number, source?: string, autoPlay?: boolean) => Promise<void>;
  /** Function to toggle play/pause for current track */
  togglePlayPause: () => Promise<void>;
}

/**
 * TrackList - Scrollable list of available audio tracks
 * 
 * Displays all available tracks with thumbnails, titles, durations, and tags.
 * Shows "NOW PLAYING" header in landscape mode. Includes tags toggle for
 * showing/hiding track tags. Supports scroll snap for smooth navigation.
 * 
 * @param props - TrackList component props
 * @returns React component for track list interface
 */
export const TrackList: React.FC<TrackListProps> = ({ playTrack, togglePlayPause }) => {
  const { currentTrackIndex } = useAudioStore();
  const { isLandscapeMode, isPortraitMode } = useUIStore();
  const { previewTrackIndex } = usePreviewStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const lastSnappedIndexRef = useRef<number>(-1);
  

  const toggleDebugPanel = () => {
    window.dispatchEvent(new Event('toggleDebugPanel'));
  };

  // Haptic feedback when tracks snap into position
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      
      scrollTimeout = setTimeout(() => {
        // Calculate which track is currently centered/snapped
        const trackElements = container.children;
        
        // Find the track that's most centered in the viewport
        let closestIndex = 0;
        let closestDistance = Infinity;
        
        Array.from(trackElements).forEach((element, index) => {
          const rect = element.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          const trackCenter = rect.top + rect.height / 2;
          const containerCenter = containerRect.top + containerRect.height / 2;
          const distance = Math.abs(trackCenter - containerCenter);
          
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });
        
        // Trigger haptic feedback if we've snapped to a new track
        if (closestIndex !== lastSnappedIndexRef.current) {
          lastSnappedIndexRef.current = closestIndex;
          
          // Trigger haptic feedback
          if ('vibrate' in navigator) {
            navigator.vibrate(10); // 10ms haptic pulse
          }
        }
      }, 50); // Wait 50ms after scroll stops to determine snap position
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // QA Compliant CSS Modules class helpers
  const getTrackListClass = () => {
    return isLandscapeMode ? styles.trackListLandscape : styles.trackList;
  };

  const getTrackListContainerClass = () => {
    return isLandscapeMode ? styles.trackListContainerLandscape : styles.trackListContainer;
  };

  return (
    <div className={getTrackListClass()}>
      <TrackListHeader />
      <div className={styles.trackListWrapper}>
        <div className={getTrackListContainerClass()} ref={containerRef}>
          {trackData.map((track, index) => (
          <TrackItem
            key={index}
            track={track}
            index={index}
            isActive={currentTrackIndex === index}
            playTrack={playTrack}
            togglePlayPause={togglePlayPause}
          />
          ))}
        </div>
      </div>
    </div>
  );
};