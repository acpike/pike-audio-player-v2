import React from 'react';
import styles from './PreviewOverlay.module.css';

interface PreviewOverlayProps {
  isVisible: boolean;
  progress: number; // 0-100
  timeRemaining: number; // seconds remaining
}

export const PreviewOverlay: React.FC<PreviewOverlayProps> = ({
  isVisible,
  progress,
  timeRemaining
}) => {
  if (!isVisible) return null;

  const circumference = 2 * Math.PI * 18; // radius = 18px
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={styles.overlay}>
      <svg className={styles.progressRing} width="40" height="40">
        {/* Background circle */}
        <circle
          className={styles.progressRingBackground}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="2"
          fill="transparent"
          r="18"
          cx="20"
          cy="20"
        />
        {/* Progress circle */}
        <circle
          className={styles.progressRingProgress}
          stroke="rgba(96, 165, 250, 0.8)"
          strokeWidth="2"
          fill="transparent"
          r="18"
          cx="20"
          cy="20"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset,
          }}
        />
      </svg>
      <div className={styles.countdown}>
        {Math.ceil(timeRemaining)}
      </div>
    </div>
  );
};