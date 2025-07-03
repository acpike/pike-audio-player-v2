/**
 * Color Type Definitions - V8 Design System
 * 
 * Provides type safety for the dynamic color extraction and theme system.
 * Follows V8's strict TypeScript patterns.
 * 
 * @fileoverview Type definitions for color management system
 * @version V1_Rewrite_1.5.7a
 */

/**
 * Extracted color palette from cover art analysis
 * 
 * This interface defines the structure for colors extracted from images,
 * providing consistent typing for the dynamic color system.
 */
export interface ExtractedColors {
  /** Primary dominant color from the image */
  dominant: string;
  
  /** Secondary accent color for highlights */
  accent: string;
  
  /** Glow effect color with appropriate opacity */
  glow: string;
  
  /** Complementary color for contrast elements */
  complementary: string;
  
  /** Timestamp of extraction for cache validation */
  extractedAt: number;
}

/**
 * Theme state for Space Black background system
 */
export interface ThemeState {
  /** Current glow color (initially default, then dynamic) */
  currentGlowColor: string;
  
  /** Whether Space Black theme is enabled */
  isSpaceBlackEnabled: boolean;
  
  /** Extracted colors from current cover art */
  extractedColors: ExtractedColors | null;
}

/**
 * Theme actions for color management
 */
export interface ThemeActions {
  /** Set glow color and update CSS custom property */
  setGlowColor: (color: string) => void;
  
  /** Enable Space Black theme */
  enableSpaceBlack: () => void;
  
  /** Disable Space Black theme */
  disableSpaceBlack: () => void;
  
  /** Update extracted colors from cover art analysis */
  setExtractedColors: (colors: ExtractedColors) => void;
  
  /** Reset to default colors */
  resetToDefaults: () => void;
}

/**
 * Color extraction service interface
 */
export interface ColorExtractionService {
  /** Extract colors from image URL */
  extractFromImage: (imageUrl: string) => Promise<ExtractedColors>;
  
  /** Generate glow color from base color */
  generateGlowFromColor: (color: string) => string;
  
  /** Clear extraction cache */
  clearCache: () => void;
}