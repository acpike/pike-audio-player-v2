import React from 'react';
import { Track } from '../../types/tracks';
import { UI_STRINGS } from '../../constants/strings';
import styles from './NowPlayingInfo.module.css';

interface NowPlayingInfoProps {
  currentTrack: Track | null;
  currentTrackIndex: number | null;
  previewTrack: Track | null;
  previewTrackIndex: number | null;
  onTitleClick?: () => void;
  className?: string;
  isLandscapeLayout?: boolean;
}

/**
 * NowPlayingInfo - Shared component for displaying current track status
 * 
 * Shows NOW PLAYING, PREVIEWING, or MUSIC PLAYER state with track title.
 * Used in both portrait and landscape orientations with different CSS positioning.
 */
export const NowPlayingInfo: React.FC<NowPlayingInfoProps> = ({ 
  currentTrack,
  currentTrackIndex,
  previewTrack,
  previewTrackIndex,
  onTitleClick,
  className = '',
  isLandscapeLayout = false
}) => {
  // Determine current state and content
  let label: string;
  let title: string;
  
  if (previewTrackIndex !== null) {
    label = UI_STRINGS.PREVIEWING;
    title = previewTrack?.title || UI_STRINGS.UNKNOWN_TRACK;
  } else if (currentTrackIndex !== null) {
    label = UI_STRINGS.NOW_PLAYING;
    title = currentTrack?.title || UI_STRINGS.UNKNOWN_TRACK;
  } else {
    label = UI_STRINGS.MUSIC_PLAYER;
    title = UI_STRINGS.SELECT_TRACK_BELOW;
  }

  // Landscape layout: title first, then label (no border)
  if (isLandscapeLayout) {
    return (
      <div className={`${styles.nowPlayingInfo} ${styles.nowPlayingInfoLandscape} ${className}`}>
        <h2 
          className={styles.nowPlayingTitle}
          onClick={onTitleClick}
          style={onTitleClick ? { cursor: 'pointer' } : undefined}
        >
          {title}
        </h2>
        <div className={styles.nowPlayingLabel}>{label}</div>
      </div>
    );
  }

  // Default layout: label first, then title (with border)
  return (
    <div className={`${styles.nowPlayingInfo} ${className}`}>
      <div className={styles.nowPlayingLabel}>{label}</div>
      <h2 
        className={styles.nowPlayingTitle}
        onClick={onTitleClick}
        style={onTitleClick ? { cursor: 'pointer' } : undefined}
      >
        {title}
      </h2>
    </div>
  );
};