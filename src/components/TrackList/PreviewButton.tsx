import React from 'react';
import styles from './PreviewButton.module.css';

interface PreviewButtonProps {
  isPlaying: boolean;
  isPaused?: boolean; // Track is selected for preview but paused
  progress: number; // 0-100
  onToggle: () => void;
  size?: 'mini' | 'small' | 'medium';
}

export const PreviewButton: React.FC<PreviewButtonProps> = ({
  isPlaying,
  isPaused = false,
  progress,
  onToggle,
  size = 'mini'
}) => {
  const isActive = isPlaying || isPaused;
  const buttonClass = `${styles.previewButton} ${styles[`size${size.charAt(0).toUpperCase() + size.slice(1)}`]} ${
    isActive ? styles.playing : ''
  }`;

  return (
    <button 
      className={buttonClass}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      style={{ '--progress': `${progress}%` } as React.CSSProperties}
      aria-label={isPlaying ? 'Pause preview' : isPaused ? 'Resume preview' : 'Play 15 second preview'}
    >
      <span className={styles.buttonText}>
        <span className={styles.number}>15</span>
        <span className={styles.unit}>s</span>
      </span>
      {isPlaying ? (
        <div className={styles.pauseIcon}></div>
      ) : isPaused ? (
        <div className={styles.playIcon}>▶</div>
      ) : null}
    </button>
  );
};