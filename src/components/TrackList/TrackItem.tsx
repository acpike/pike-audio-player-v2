import React from 'react';
import { Track } from '../../types/tracks';
import { useUIStore } from '../../stores/uiStore';
import { useTrackColors } from '../../hooks/useTrackColors';
import { AUDIO_CONSTANTS } from '../../constants/audio';
import styles from './TrackItem.module.css';

interface TrackItemProps {
  track: Track;
  index: number;
  isActive: boolean;
  playTrack: (index: number, source?: string, autoPlay?: boolean) => Promise<void>;
}

export const TrackItem: React.FC<TrackItemProps> = ({ track, index, isActive, playTrack }) => {
  const { tagsToggleState, isLandscapeMode } = useUIStore();
  
  // Extract colors for this specific track when active
  const trackColors = useTrackColors(track.title, track.art, isActive);

  // QA Compliant CSS Modules class helpers
  const getTrackItemClass = () => {
    const baseClass = isActive ? `${styles.trackItem} ${styles.active}` : styles.trackItem;
    return isLandscapeMode ? `${baseClass} ${styles.trackItemLandscape}` : baseClass;
  };

  const getTrackThumbnailClass = () => {
    return isLandscapeMode ? styles.trackThumbnailLandscape : styles.trackThumbnail;
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

  const getPreviewButtonClass = () => {
    return isLandscapeMode ? styles.previewButtonLandscape : styles.previewButton;
  };

  const getTrackDurationClass = () => {
    return isLandscapeMode ? styles.trackDurationLandscape : styles.trackDuration;
  };
  

  const handleTrackClick = () => {
    playTrack(index);
  };

  const handlePreviewClick = (e: React.MouseEvent, source: string) => {
    e.stopPropagation();
    playTrack(index, source);
  };

  return (
    <div 
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
            <button 
              className={getPreviewButtonClass()}
              onClick={(e) => handlePreviewClick(e, track.short15)}
              title={`${AUDIO_CONSTANTS.PREVIEW_DURATION_SHORT} second preview`}
            >
              {AUDIO_CONSTANTS.PREVIEW_DURATION_SHORT}s
            </button>
          </div>
        </div>
        <div className={getTrackDurationClass()}>{track.duration}</div>
        
        {tagsToggleState && (
          <div className={styles.trackTags}>
            {track.tags.map((tag, tagIndex) => (
              <span key={tagIndex} className={styles.trackTag}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};