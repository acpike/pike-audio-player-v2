import React from 'react';
import styles from './InstructionalText.module.css';

interface InstructionalTextProps {
  isVisible: boolean;
}

export const InstructionalText: React.FC<InstructionalTextProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className={styles.instructionalText}>
      <span className={styles.instruction}>
        Tap for full track <span className={styles.separator}>•</span> Double tap for preview
      </span>
    </div>
  );
};