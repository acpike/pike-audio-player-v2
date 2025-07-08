import React, { useState, useEffect, useRef } from 'react';
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
 * Dynamically switches to vertical layout when album name is too long.
 */
export const AlbumInfo: React.FC<AlbumInfoProps> = ({ 
  albumName, 
  trackCount, 
  className = '' 
}) => {
  const [useVerticalLayout, setUseVerticalLayout] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const albumNameRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const checkTextOverflow = () => {
      if (!containerRef.current || !albumNameRef.current) return;

      const container = containerRef.current;
      const albumNameElement = albumNameRef.current;
      
      // Get computed styles to measure text properly
      const computedStyle = window.getComputedStyle(albumNameElement);
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (context) {
        context.font = `${computedStyle.fontWeight} ${computedStyle.fontSize} ${computedStyle.fontFamily}`;
        const textMetrics = context.measureText(albumName);
        const textWidth = textMetrics.width;
        
        // Only switch to vertical for very long album names (longer than 50 characters)
        const threshold = 300; // Fixed threshold - only very long names trigger vertical
        
        setUseVerticalLayout(textWidth > threshold);
      }
    };

    // Check on mount and resize with a small delay to ensure CSS has applied
    const timeoutId = setTimeout(checkTextOverflow, 100);
    window.addEventListener('resize', checkTextOverflow);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', checkTextOverflow);
    };
  }, [albumName]);

  const isLongAlbumName = albumName.length > 40;

  return (
    <div 
      ref={containerRef}
      className={`${styles.albumInfo} ${useVerticalLayout ? styles.albumInfoVertical : ''} ${className}`}
    >
      <span 
        ref={albumNameRef} 
        className={`${styles.albumName} ${useVerticalLayout && isLongAlbumName ? styles.albumNameLong : ''}`}
      >
        {albumName}
      </span>
      <span className={styles.separator}>•</span>
      <span className={styles.trackCount}>{trackCount} tracks</span>
    </div>
  );
};