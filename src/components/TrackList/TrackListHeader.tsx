import React from 'react';
import { AlbumInfo } from '../UI/AlbumInfo';
import { TagsToggle } from '../UI/TagsToggle';
import { InstructionalText } from '../UI/InstructionalText';
import { useAudioStore } from '../../stores/audioStore';
import { usePreviewStore } from '../../stores/previewStore';
import styles from './TrackListHeader.module.css';

interface TrackListHeaderProps {}

/**
 * TrackListHeader - Simplified header for both portrait and landscape
 * 
 * Shows AlbumInfo, TagsToggle, and conditional InstructionalText.
 * NOW PLAYING info has been moved to the cover art area in landscape mode.
 */
export const TrackListHeader: React.FC<TrackListHeaderProps> = () => {
  const { currentTrackIndex } = useAudioStore();
  const { previewTrackIndex } = usePreviewStore();
  
  // Same condition as used in AudioPlayer
  const hasTrackBeenSelected = currentTrackIndex !== null;
  const shouldShowInstructions = !hasTrackBeenSelected && previewTrackIndex === null;

  return (
    <div className={styles.trackListHeader}>
      {/* Top row: Album Info and Tags Toggle */}
      <div className={styles.topRow}>
        <AlbumInfo 
          albumName="Demo Tracks"
          trackCount={5}
          className={styles.albumInfoPosition}
        />
        <TagsToggle className={styles.tagsTogglePosition} />
      </div>

      {/* Bottom row: Instructional Text (conditional) */}
      {shouldShowInstructions && (
        <div className={styles.bottomRow}>
          <InstructionalText isVisible={true} />
        </div>
      )}
    </div>
  );
};