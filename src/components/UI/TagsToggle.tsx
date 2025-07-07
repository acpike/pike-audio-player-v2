import React from 'react';
import { useUIStore } from '../../stores/uiStore';
import styles from './TagsToggle.module.css';

interface TagsToggleProps {
  className?: string;
}

export const TagsToggle: React.FC<TagsToggleProps> = ({ className = '' }) => {
  const { tagsToggleState, setTagsToggle } = useUIStore();

  const handleClick = (e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).closest(`.${styles.tagsToggleSlider}`)?.getBoundingClientRect();
    if (!rect) return;
    
    const clickX = e.clientX - rect.left;
    const toggleWidth = rect.width;
    
    if (clickX < toggleWidth / 3) {
      // Left third clicked - description
      setTagsToggle('description');
    } else if (clickX > (toggleWidth * 2) / 3) {
      // Right third clicked - tags  
      setTagsToggle('tags');
    } else {
      // Middle third clicked - off
      setTagsToggle('off');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // Cycle through: off -> tags -> description -> off
      switch (tagsToggleState) {
        case 'off':
          setTagsToggle('tags');
          break;
        case 'tags':
          setTagsToggle('description');
          break;
        case 'description':
          setTagsToggle('off');
          break;
      }
    }
  };

  return (
    <div className={`${styles.tagsToggleContainer} tagsToggle ${className}`}>
      <div className={styles.tagsToggleLabel}>
        <div 
          className={`${styles.tagsToggleSlider} ${styles[tagsToggleState]}`}
          onClick={handleClick}
          role="button"
          tabIndex={0}
          aria-label={`Toggle: ${tagsToggleState}`}
          onKeyDown={handleKeyDown}
        >
          <span className={`${styles.tagsToggleText} ${styles.leftLabel}`}>DESC</span>
          <span className={`${styles.tagsToggleText} ${styles.centerLabel}`}>○</span>
          <span className={`${styles.tagsToggleText} ${styles.rightLabel}`}>TAGS</span>
        </div>
      </div>
    </div>
  );
};