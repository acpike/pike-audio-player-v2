import React from 'react';
import styles from './InstructionalText.module.css';

interface InstructionalTextProps {
  isVisible: boolean;
}

export const InstructionalText: React.FC<InstructionalTextProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <span className={styles.instruction}>
      Tap to play <span className={styles.separator}>•</span> Double tap for preview
    </span>
  );
};