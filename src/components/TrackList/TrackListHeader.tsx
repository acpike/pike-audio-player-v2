import React from 'react';
import { AlbumInfo } from '../UI/AlbumInfo';
import { TagsToggle } from '../UI/TagsToggle';
import styles from './TrackListHeader.module.css';

interface TrackListHeaderProps {}

/**
 * TrackListHeader - Simplified header for both portrait and landscape
 * 
 * Shows only AlbumInfo and TagsToggle consistently in both orientations.
 * NOW PLAYING info has been moved to the cover art area in landscape mode.
 */
export const TrackListHeader: React.FC<TrackListHeaderProps> = () => {
  return (
    <div className={styles.trackListHeader}>
      {/* Album Info - left side */}
      <AlbumInfo 
        albumName="Demo Tracks"
        trackCount={5}
        className={styles.albumInfoPosition}
      />

      {/* Tags Toggle - right side */}
      <TagsToggle className={styles.tagsTogglePosition} />
    </div>
  );
};