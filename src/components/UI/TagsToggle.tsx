import React from 'react';
import { useUIStore } from '../../stores/uiStore';
import styles from './TagsToggle.module.css';

export const TagsToggle: React.FC = () => {
  const { tagsToggleState, setTagsToggle } = useUIStore();

  const handleToggle = () => {
    setTagsToggle(!tagsToggleState);
  };

  return (
    <div className={`${styles.tagsToggleContainer} tagsToggle`}>
      <label className={styles.tagsToggleLabel}>
        <input 
          type="checkbox" 
          className={styles.tagsToggleInput}
          checked={tagsToggleState}
          onChange={handleToggle}
          aria-label={tagsToggleState ? 'Hide tags' : 'Show tags'}
        />
        <div className={styles.tagsToggleSlider}>
          <span className={styles.tagsToggleText}>TAGS</span>
        </div>
      </label>
    </div>
  );
};