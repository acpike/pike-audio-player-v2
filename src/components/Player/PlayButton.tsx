import React from 'react';
import { UI_CONSTANTS, SVG_CONSTANTS } from '../../constants/audio';
import styles from './PlayButton.module.css';

/**
 * Props for the PlayButton component
 */
interface PlayButtonProps {
  /** Function to toggle between play and pause states */
  togglePlayPause: () => Promise<void>;
  /** Whether audio is currently playing */
  isPlaying: boolean;
  /** Whether audio is currently loading/buffering */
  isLoading: boolean;
  /** Whether the button should be visible (for auto-hide functionality) */
  isVisible?: boolean;
}

/**
 * PlayButton - Central play/pause control button
 * 
 * Large circular button that toggles audio playback. Shows play icon when paused,
 * pause icon when playing, and loading spinner during buffering. Adapts size 
 * and positioning for landscape/portrait orientations.
 * 
 * @param props - PlayButton component props
 * @returns React component for play/pause button
 */
export const PlayButton: React.FC<PlayButtonProps> = ({ togglePlayPause, isPlaying, isLoading, isVisible = true }) => {

  // QA Compliant CSS Modules class helpers
  const getPlayButtonClass = () => {
    const visibilityClass = isVisible ? '' : styles.hidden;
    return `${styles.playButton} ${visibilityClass}`.trim();
  };

  const getPlayIconClass = () => {
    return styles.playIcon;
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    togglePlayPause();
  };

  return (
    <button 
      className={getPlayButtonClass()}
      onClick={handleClick}
      disabled={isLoading}
      aria-label={isPlaying ? 'Pause' : 'Play'}
    >
      {isLoading ? (
        <div className={styles.loadingSpinner} />
      ) : (
        <svg className={getPlayIconClass()} viewBox={`0 0 ${UI_CONSTANTS.ICON_VIEWBOX_SIZE} ${UI_CONSTANTS.ICON_VIEWBOX_SIZE}`}>
          {isPlaying ? (
            // Pause icon
            <>
              <rect {...SVG_CONSTANTS.PAUSE_RECT1} />
              <rect {...SVG_CONSTANTS.PAUSE_RECT2} />
            </>
          ) : (
            // Play icon
            <polygon points={SVG_CONSTANTS.PLAY_POLYGON} />
          )}
        </svg>
      )}
    </button>
  );
};