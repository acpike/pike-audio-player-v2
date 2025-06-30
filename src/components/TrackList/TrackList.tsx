import React from 'react';
import { trackData } from '../../types/tracks';
import { useAudioStore } from '../../stores/audioStore';
import { useUIStore } from '../../stores/uiStore';
import { TrackItem } from './TrackItem';
import { TagsToggle } from '../UI/TagsToggle';
import styles from './TrackList.module.css';

/**
 * Props for the TrackList component
 */
interface TrackListProps {
  /** Function to play a specific track by index */
  playTrack: (index: number, source?: string, autoPlay?: boolean) => Promise<void>;
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
export const TrackList: React.FC<TrackListProps> = ({ playTrack }) => {
  const { currentTrackIndex } = useAudioStore();
  const { isLandscapeMode } = useUIStore();

  return (
    <div className={styles.trackList} data-landscape={isLandscapeMode}>
      <div className={styles.trackListHeader} data-landscape={isLandscapeMode}>
        {isLandscapeMode && (
          <div className={styles.nowPlayingHeader}>
            {currentTrackIndex !== null ? (
              <>
                <div className={styles.nowPlayingLabel}>NOW PLAYING</div>
                <h2 className={styles.nowPlayingTitle}>{trackData[currentTrackIndex]?.title || 'Unknown Track'}</h2>
              </>
            ) : (
              <>
                <div className={styles.nowPlayingLabel}>MUSIC PLAYER</div>
                <h2 className={styles.nowPlayingTitle}>Select a track below</h2>
              </>
            )}
          </div>
        )}
        <TagsToggle />
      </div>
      <div className={styles.trackListContainer} data-landscape={isLandscapeMode}>
        {trackData.map((track, index) => (
          <TrackItem
            key={index}
            track={track}
            index={index}
            isActive={currentTrackIndex === index}
            playTrack={playTrack}
          />
        ))}
      </div>
    </div>
  );
};