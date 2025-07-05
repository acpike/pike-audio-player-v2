import React, { useEffect } from 'react';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';
import { useTouchDeviceClasses, useDeviceTypeClasses } from '../../hooks/useBodyClasses';
import { useUIStore } from '../../stores/uiStore';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { logger } from '../../utils/logger';
import styles from './ResponsiveLayout.module.css';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

// V7 Responsive Layout Shell - CSS Modules approach with landscape-mode class switching
export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children }) => {
  // CRITICAL: Do NOT remove isLandscapeMode - it initializes the landscape detection system
  // Even though not used directly here, the hook call triggers orientation listeners
  const { deviceType, isLandscapeMode } = useDeviceDetection(); // Initialize device detection
  const { setTagsToggle, isPortraitMode } = useUIStore();
  const { hasTrackBeenSelected, isPlaying } = useAudioPlayer();
  
  // Satisfy TypeScript - isLandscapeMode initializes detection system (NEVER remove)
  void isLandscapeMode;

  // V7 Apply device-specific optimizations using extracted hooks
  useTouchDeviceClasses();
  useDeviceTypeClasses(deviceType);

  // V7 Load persisted tags toggle state - From V7 localStorage persistence
  useEffect(() => {
    try {
      const persistedTagsState = localStorage.getItem('tagsToggleState');
      if (persistedTagsState !== null) {
        const state = JSON.parse(persistedTagsState);
        setTagsToggle(state);
      }
    } catch (error) {
      logger.warn('Failed to load persisted tags toggle state', { error: error instanceof Error ? error.message : String(error) });
    }
  }, [setTagsToggle]);

  // QA Compliant CSS Modules class selector - UNCHANGED to preserve layout
  const getPlayerClass = () => {
    if (isLandscapeMode) return styles.playerLandscape;
    if (isPortraitMode) return styles.playerPortrait;
    return styles.player; // Default fallback
  };

  // State detection attributes for CSS enhancement - ADDITIVE ONLY
  const getStateAttributes = () => ({
    'data-has-track': hasTrackBeenSelected.toString(),
    'data-is-playing': isPlaying.toString(),
    'data-orientation': isPortraitMode ? 'portrait' : isLandscapeMode ? 'landscape' : 'default'
  });

  return (
    <div className={getPlayerClass()} {...getStateAttributes()}>
      {children}
    </div>
  );
};