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
  const [shouldFadeOut, setShouldFadeOut] = React.useState(false);
  
  // Start fade-out when preview is near completion (last 0.5 seconds or when reaching 100%)
  React.useEffect(() => {
    if (progress >= 95 || timeRemaining <= 0.5) {
      setShouldFadeOut(true);
    } else {
      setShouldFadeOut(false);
    }
  }, [progress, timeRemaining]);
  
  // Hide overlay when not visible
  if (!isVisible) return null;

  const circumference = 2 * Math.PI * 22; // radius = 22px for larger overlay
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`${styles.overlay} ${shouldFadeOut ? styles.fadeOut : ''}`}>
      <svg className={styles.progressRing} width="48" height="48">
        {/* Background circle */}
        <circle
          className={styles.progressRingBackground}
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth="3"
          fill="transparent"
          r="22"
          cx="24"
          cy="24"
        />
        {/* Progress circle */}
        <circle
          className={styles.progressRingProgress}
          stroke="rgba(96, 165, 250, 1)"
          strokeWidth="3"
          fill="transparent"
          r="22"
          cx="24"
          cy="24"
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