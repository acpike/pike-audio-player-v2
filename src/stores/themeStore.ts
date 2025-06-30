/**
 * Theme Store - V8 Design System
 * 
 * Zustand store for managing Space Black theme and dynamic color extraction.
 * Follows V8's established store patterns with TypeScript strict compliance.
 * 
 * @fileoverview Theme state management for Space Black system
 * @version V1_Rewrite_1.5.7a
 */

import { create } from 'zustand';
import { ThemeState, ThemeActions, ExtractedColors } from '../types/colors';
import { DEFAULT_GLOW } from '../constants/colors';
import { logger } from '../utils/logger';

interface ThemeStore extends ThemeState, ThemeActions {}

/**
 * Theme store for Space Black background and dynamic color management
 * 
 * Manages the theme state including Space Black enabling/disabling and
 * dynamic color extraction from cover art for glow effects.
 */
export const useThemeStore = create<ThemeStore>((set, get) => ({
  // V8 State Properties - Clean initial state
  currentGlowColor: DEFAULT_GLOW.ELECTRIC_BLUE,
  isSpaceBlackEnabled: true, // Default to Space Black theme
  extractedColors: null,

  // V8 Actions - Following established patterns
  
  /**
   * Set glow color - Pure state management
   * 
   * Updates store state only. Components should use useCSSProperty hook
   * to sync this value to CSS custom properties.
   */
  setGlowColor: (color: string) => {
    try {
      set({ currentGlowColor: color });
      
      logger.info('Glow color updated', { color });
    } catch (error) {
      logger.error('Failed to set glow color', { 
        error: error instanceof Error ? error.message : String(error),
        color 
      });
    }
  },

  /**
   * Enable Space Black theme
   */
  enableSpaceBlack: () => {
    set({ isSpaceBlackEnabled: true });
    logger.info('Space Black theme enabled');
  },

  /**
   * Disable Space Black theme
   */
  disableSpaceBlack: () => {
    set({ isSpaceBlackEnabled: false });
    logger.info('Space Black theme disabled');
  },

  /**
   * Update extracted colors from cover art analysis
   * 
   * Stores the extracted color palette and automatically applies
   * the glow color for immediate visual feedback.
   */
  setExtractedColors: (colors: ExtractedColors) => {
    try {
      set({ extractedColors: colors });
      
      // Automatically apply the extracted glow color
      get().setGlowColor(colors.glow);
      
      logger.info('Extracted colors updated', { 
        dominant: colors.dominant,
        glow: colors.glow 
      });
    } catch (error) {
      logger.error('Failed to set extracted colors', { 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  },

  /**
   * Reset to default colors - Pure state management
   * 
   * Clears extracted colors and returns to default glow color.
   * Components should use useCSSProperty hook to sync CSS.
   */
  resetToDefaults: () => {
    try {
      set({ 
        extractedColors: null,
        currentGlowColor: DEFAULT_GLOW.ELECTRIC_BLUE 
      });
      
      logger.info('Theme reset to defaults');
    } catch (error) {
      logger.error('Failed to reset theme to defaults', { 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  }
}));