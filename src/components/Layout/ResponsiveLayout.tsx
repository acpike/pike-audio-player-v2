import React from 'react';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';
import { useTouchDeviceClasses, useDeviceTypeClasses } from '../../hooks/useBodyClasses';
import { useUIStore } from '../../stores/uiStore';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
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

  // Tags toggle state is managed by UI store with proper localStorage integration
  // No need for duplicate localStorage loading here

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