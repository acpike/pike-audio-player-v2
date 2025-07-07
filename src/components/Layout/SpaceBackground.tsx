/**
 * Space Background Component - V8 Design System
 * 
 * Wraps the application with Space Black background theme.
 * Follows V8's clean component architecture with TypeScript strict compliance.
 * 
 * @fileoverview Space Black background wrapper component
 * @version V1_Rewrite_1.5.7a
 */

import React from 'react';
// import { useThemeStore } from '../../stores/themeStore';
import styles from '../../styles/SpaceBackground.module.css';

interface SpaceBackgroundProps {
  /** Child components to render within Space Black background */
  children: React.ReactNode;
}

/**
 * Space Background wrapper component
 * 
 * Conditionally applies Space Black background based on theme store state.
 * Provides the foundation for dynamic color extraction and glow effects.
 * 
 * @param children - Child components to render
 * @returns JSX element with conditional Space Black background
 */
export const SpaceBackground: React.FC<SpaceBackgroundProps> = ({ children }) => {
  // Note: isSpaceBlackEnabled available for future theme customization
  // const { isSpaceBlackEnabled } = useThemeStore();
  
  return (
    <div className={styles.spaceBackground}>
      <div className={styles.contentWrapper}>
        {children}
      </div>
    </div>
  );
};