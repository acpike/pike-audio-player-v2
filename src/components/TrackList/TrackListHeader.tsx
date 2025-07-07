import React from 'react';
import { AlbumInfo } from '../UI/AlbumInfo';
import { TagsToggle } from '../UI/TagsToggle';
import styles from './TrackListHeader.module.css';

interface TrackListHeaderProps {}

/**
 * TrackListHeader - Simplified header for both portrait and landscape
 * 
 * Shows AlbumInfo and TagsToggle only. 
 * Instructional text has been moved to the main title area.
 * NOW PLAYING info has been moved to the cover art area in landscape mode.
 */
export const TrackListHeader: React.FC<TrackListHeaderProps> = () => {
  return (
    <div className={styles.trackListHeader}>
      {/* Album Info and Tags Toggle */}
      <div className={styles.topRow}>
        <AlbumInfo 
          albumName="Demo Tracks"
          trackCount={5}
          className={styles.albumInfoPosition}
        />
        <TagsToggle className={styles.tagsTogglePosition} />
      </div>
    </div>
  );
};