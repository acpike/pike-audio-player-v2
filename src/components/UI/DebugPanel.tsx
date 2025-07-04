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
        <p><strong>Version:</strong> V27_SMART_TAG_LIMITING</p>
        <p><strong>Phase:</strong> Portrait Description Expansion & Smart Tag System ✅</p>
        <p><strong>Features:</strong> Portrait description expansion (80% scale, coordinated movement), smart tag limiting (single-line adaptive), landscape-style expanded description</p>
        <p><strong>Git Branch:</strong> feature/portrait-layout-fixes</p>
        <p><strong>Last Commit:</strong> [PENDING] - Complete portrait description expansion with smart tags</p>
        <p><strong>Build Time:</strong> {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
};