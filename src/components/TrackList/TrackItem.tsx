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
  

  const handleTrackClick = () => {
    playTrack(index);
  };

  const handlePreviewClick = (e: React.MouseEvent, source: string) => {
    e.stopPropagation();
    playTrack(index, source);
  };

  return (
    <div 
      className={`${styles.trackItem} ${isActive ? styles.active : ''}`}
      onClick={handleTrackClick}
      data-landscape={isLandscapeMode}
      style={trackColors ? {
        '--glow-r': trackColors.r,
        '--glow-g': trackColors.g,
        '--glow-b': trackColors.b
      } as React.CSSProperties : undefined}
    >
      <img 
        src={track.art} 
        alt={`${track.title} cover art`}
        className={styles.trackThumbnail}
        data-landscape={isLandscapeMode}
        loading="lazy"
      />
      
      <div className={styles.trackInfo} data-landscape={isLandscapeMode}>
        <div className={styles.trackTopRow}>
          <h3 className={styles.trackTitle} data-landscape={isLandscapeMode}>{track.title}</h3>
          <div className={styles.previewButtons} data-landscape={isLandscapeMode}>
            <button 
              className={styles.previewButton}
              onClick={(e) => handlePreviewClick(e, track.short15)}
              title={`${AUDIO_CONSTANTS.PREVIEW_DURATION_SHORT} second preview`}
              data-landscape={isLandscapeMode}
            >
              {AUDIO_CONSTANTS.PREVIEW_DURATION_SHORT}s
            </button>
          </div>
        </div>
        <div className={styles.trackDuration} data-landscape={isLandscapeMode}>{track.duration}</div>
        
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