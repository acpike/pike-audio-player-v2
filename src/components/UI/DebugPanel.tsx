import { useState, useEffect } from 'react';
import styles from './DebugPanel.module.css';

/**
 * Debug panel activated by "Tap for Description" button (temporary)
 * Will be replaced when description functionality is implemented
 */
export const DebugPanel = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleToggleDebug = () => {
      setIsVisible(prev => !prev);
    };

    window.addEventListener('toggleDebugPanel', handleToggleDebug);
    return () => window.removeEventListener('toggleDebugPanel', handleToggleDebug);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3>Debug Panel</h3>
        <button 
          className={styles.close}
          onClick={() => setIsVisible(false)}
          aria-label="Close debug panel"
        >
          ×
        </button>
      </div>
      <div className={styles.content}>
        <p><strong>Version:</strong> V24_SMART_SCROLL_PADDING_FADE</p>
        <p><strong>Phase:</strong> TrackList Fade Effects with Smart Scroll Padding ✅</p>
        <p><strong>Features:</strong> Production-ready fade effects, minimal smart scroll padding (18px/25px), unified TrackList positioning</p>
        <p><strong>Git Branch:</strong> feature/portrait-layout-fixes</p>
        <p><strong>Last Commit:</strong> [PENDING] - Add smart scroll padding and fade effects</p>
        <p><strong>Build Time:</strong> {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
};