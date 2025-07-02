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
        <p><strong>Version:</strong> V11_PORTRAIT_MODE_DEVELOPMENT</p>
        <p><strong>Phase:</strong> Portrait Layout Implementation - TAGS TOGGLE RELOCATION</p>
        <p><strong>Features:</strong> Auto-advance + Portrait spacing + Tags toggle on album name line</p>
        <p><strong>Git Branch:</strong> sandbox</p>
        <p><strong>Last Commit:</strong> cc68d59</p>
        <p><strong>Build Time:</strong> {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
};