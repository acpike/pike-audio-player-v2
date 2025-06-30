import React, { useState, useRef, useEffect } from 'react';
import { PlayButton } from './PlayButton';
import { ProgressBar } from './ProgressBar';
import { useUIStore } from '../../stores/uiStore';
import { Track } from '../../types/tracks';
import styles from './AudioPlayer.module.css';

/**
 * Props for the AudioPlayer component
 */
interface AudioPlayerProps {
  /** Reference to the HTML audio element for playback control */
  audioRef: React.RefObject<HTMLAudioElement>;
  /** Currently selected track object, null if no track selected */
  currentTrack: Track | null;
  /** Whether any track has been selected during this session */
  hasTrackBeenSelected: boolean;
  /** Whether audio is currently loading/buffering */
  isLoading: boolean;
  /** Whether audio is currently playing */
  isPlaying: boolean;
  /** Function to toggle play/pause state */
  togglePlayPause: () => Promise<void>;
}

/**
 * AudioPlayer - Core audio playback and control interface
 * 
 * Manages audio playback interface including cover art, track info, play controls,
 * progress bar, and expandable description. Adapts layout for landscape/portrait
 * orientations and provides morphing description functionality.
 * 
 * @param props - AudioPlayer component props
 * @returns React component for audio player interface
 */
export const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  audioRef, 
  currentTrack, 
  hasTrackBeenSelected, 
  isLoading, 
  isPlaying,
  togglePlayPause
}) => {
  const { isLandscapeMode } = useUIStore();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const previousTrackRef = useRef<Track | null>(null);

  // CSS Modules class helpers - QA Compliant
  const getAudioPlayerClass = () => {
    return isLandscapeMode ? styles.audioPlayerLandscape : styles.audioPlayer;
  };

  const getCoverWrapperClass = () => {
    if (isLandscapeMode && isDescriptionExpanded) return styles.coverWrapperLandscapeExpanded;
    if (isLandscapeMode) return styles.coverWrapperLandscape;
    return styles.coverWrapper;
  };

  const getCoverArtClass = () => {
    if (isLandscapeMode && hasTrackBeenSelected) return styles.coverArtLandscapeWithTrack;
    if (isLandscapeMode) return styles.coverArtLandscape;
    if (hasTrackBeenSelected) return styles.coverArtWithTrack;
    return styles.coverArt;
  };

  const getButtonContainerClass = () => {
    return isLandscapeMode ? styles.buttonContainerLandscape : styles.buttonContainer;
  };

  const getTrackInfoClass = () => {
    return styles.trackInfo;
  };

  const getTrackTitleClass = () => {
    const baseClass = styles.trackTitleBase;
    const specificClass = isLandscapeMode ? styles.trackTitleLandscape : styles.trackTitle;
    return `${baseClass} ${specificClass}`;
  };

  const getStatusTextClass = () => {
    const baseClass = styles.statusTextBase;
    const specificClass = isLandscapeMode ? styles.statusTextLandscape : styles.statusText;
    return `${baseClass} ${specificClass}`;
  };

  const getDescriptionWrapperClass = () => {
    if (isLandscapeMode && isDescriptionExpanded) return styles.descriptionWrapperLandscapeExpanded;
    if (isLandscapeMode) return styles.descriptionWrapperLandscape;
    if (isDescriptionExpanded) return styles.descriptionWrapperExpanded;
    return styles.descriptionWrapper;
  };

  const getMorphingDescriptionClass = () => {
    if (isLandscapeMode && isDescriptionExpanded) return styles.morphingDescriptionLandscapeExpanded;
    if (isLandscapeMode) return styles.morphingDescriptionLandscape;
    if (isDescriptionExpanded) return styles.morphingDescriptionExpanded;
    return styles.morphingDescription;
  };

  const getDescriptionTextClass = () => {
    const baseClass = styles.descriptionTextBase;
    const specificClass = isLandscapeMode ? styles.descriptionTextLandscape : styles.descriptionText;
    return `${baseClass} ${specificClass}`;
  };

  const getButtonTextClass = () => {
    return isLandscapeMode ? styles.buttonTextLandscape : styles.buttonText;
  };

  // Auto-collapse description when track changes
  useEffect(() => {
    if (previousTrackRef.current && currentTrack && previousTrackRef.current.title !== currentTrack.title) {
      setIsDescriptionExpanded(false);
    }
    previousTrackRef.current = currentTrack;
  }, [currentTrack]);

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  return (
    <div className={getAudioPlayerClass()}>
      {/* Simple HTML5 audio element - V7 pattern */}
      <audio ref={audioRef} preload="metadata" />
      {/* V7 Cover wrapper - Clean audio player without visual effects coupling */}
      <div className={getCoverWrapperClass()}>
        <img 
          src={currentTrack?.art || "https://static.wixstatic.com/media/ec6721_6320ff4ac93c4fa8b900854d633e6a3b~mv2.png"}
          alt={currentTrack ? `${currentTrack.title} cover art` : "Album art - Select a track below"}
          className={getCoverArtClass()}
        />
        
        {/* V7 Play button overlaid on center of cover art */}
        {hasTrackBeenSelected && (
          <div className={getButtonContainerClass()}>
            <PlayButton togglePlayPause={togglePlayPause} isPlaying={isPlaying} isLoading={isLoading} />
          </div>
        )}
        
        {/* V7 Progress controls overlay */}
        {hasTrackBeenSelected && (
          <div className={styles.progressOverlay}>
            <ProgressBar audioRef={audioRef} />
          </div>
        )}
      </div>
      
      <div className={getTrackInfoClass()}>
        {!isLandscapeMode && (
          <>
            <h1 className={getTrackTitleClass()}>
              {currentTrack ? currentTrack.title : 'Demo Tracks'}
            </h1>
            
            <div className={getStatusTextClass()}>
              {hasTrackBeenSelected 
                ? (isLoading ? 'Loading...' : isPlaying ? 'Playing' : 'Paused')
                : 'Tap a track to play'
              }
            </div>
          </>
        )}
        
        {/* Morphing Description Component */}
        {hasTrackBeenSelected && currentTrack && (
          <div className={getDescriptionWrapperClass()}>
            <div 
              key={currentTrack.title}
              className={getMorphingDescriptionClass()}
              onClick={toggleDescription}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleDescription();
                }
              }}
              aria-label={isDescriptionExpanded ? 'Collapse description' : 'Expand description'}
            >
              {isDescriptionExpanded ? (
                <p className={getDescriptionTextClass()}>
                  {currentTrack.description || 'No description available for this track.'}
                </p>
              ) : (
                <span className={getButtonTextClass()}>
                  Description
                </span>
              )}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};