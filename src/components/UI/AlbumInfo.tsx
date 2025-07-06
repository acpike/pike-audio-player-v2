import React from 'react';
import styles from './AlbumInfo.module.css';

interface AlbumInfoProps {
  albumName: string;
  trackCount: number;
  className?: string;
}

/**
 * AlbumInfo - Shared component for displaying album name and track count
 * 
 * Used in both portrait and landscape orientations with different CSS positioning.
 * Provides consistent styling and structure across orientations.
 */
export const AlbumInfo: React.FC<AlbumInfoProps> = ({ 
  albumName, 
  trackCount, 
  className = '' 
}) => {
  return (
    <div className={`${styles.albumInfo} ${className}`}>
      <span className={styles.albumName}>{albumName}</span>
      <span className={styles.separator}>•</span>
      <span className={styles.trackCount}>{trackCount} tracks</span>
    </div>
  );
};