import React from 'react';
import styles from './PreviewOverlay.module.css';

interface PreviewOverlayProps {
  isVisible: boolean;
  progress: number; // 0-100
  timeRemaining: number; // seconds remaining
  isPausedManually?: boolean; // Track if manually paused to show counter
  isEnding?: boolean; // Track if preview is ending to keep timer faded
}

export const PreviewOverlay: React.FC<PreviewOverlayProps> = ({
  isVisible,
  progress,
  timeRemaining,
  isPausedManually = false,
  isEnding = false
}) => {
  const [shouldFadeOut, setShouldFadeOut] = React.useState(false);
  
  // Start fade-out when preview is near completion (last 0.5 seconds or when reaching 100%)
  // But only if not manually paused - manual pause should keep counter visible
  // Once isEnding is true, keep timer faded to prevent reappearance
  React.useEffect(() => {
    if (isEnding || (!isPausedManually && (progress >= 95 || timeRemaining <= 0.5))) {
      setShouldFadeOut(true);
    } else {
      setShouldFadeOut(false);
    }
  }, [progress, timeRemaining, isPausedManually, isEnding]);
  
  // Hide overlay when not visible
  if (!isVisible) return null;

  // Calculate stroke-dashoffset for progress
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`${styles.overlay} ${shouldFadeOut ? styles.fadeOut : ''}`}>
      {/* Back to simple SVG but with clean implementation */}
      <svg width="48" height="48" className={styles.progressSvg}>
        {/* Background ring */}
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth="2"
        />
        {/* Progress ring */}
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="rgba(96, 165, 250, 1)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 24 24)"
          style={{ transition: 'stroke-dashoffset 0.1s linear' }}
        />
      </svg>
      <div className={styles.countdown}>
        {Math.ceil(timeRemaining)}
      </div>
    </div>
  );
};