/**
 * Space Black Color Foundation - V8 Design System
 * 
 * Provides consistent color constants for the Space Black theme implementation.
 * Follows V8's clean architecture patterns with TypeScript constants.
 * 
 * @fileoverview Color constants for Space Black theme system
 * @version V1_Rewrite_1.5.7a
 */

/**
 * Space Black color palette for deep space background system
 * 
 * These colors create depth and visual hierarchy while maintaining
 * accessibility and professional appearance across all devices.
 */
export const SPACE_BLACK_COLORS = {
  /** Core gradient foundation colors */
  TRUE_BLACK: '#000000',
  DEEP_CHARCOAL: '#0a0a0a', 
  DARK_GRAY: '#141414',
  
  /** Depth gradient overlays for dimensional effect */
  DEPTH_OVERLAY_1: 'rgba(15, 15, 15, 0.8)',
  DEPTH_OVERLAY_2: 'rgba(25, 25, 25, 0.6)', 
  DEPTH_OVERLAY_3: 'rgba(20, 20, 20, 0.7)',
  
  /** Enhanced glass morphism values for Space Black */
  GLASS_SPACE_BASE: 'rgba(20, 20, 20, 0.8)',
  GLASS_WHITE_HIGH: 'rgba(255, 255, 255, 0.06)',
  GLASS_WHITE_MID: 'rgba(255, 255, 255, 0.02)',
  GLASS_WHITE_LOW: 'rgba(255, 255, 255, 0.01)',
  GLASS_BORDER: 'rgba(255, 255, 255, 0.08)'
} as const;

/**
 * Default glow color (will be replaced by dynamic extraction in 1.5.7b)
 * 
 * This provides a fallback color for the dynamic glow system.
 */
export const DEFAULT_GLOW = {
  /** Primary brand color - electric blue */
  ELECTRIC_BLUE: 'rgba(96, 165, 250, 0.4)'
} as const;

/**
 * Type definitions for theme color management
 */
export type SpaceBlackColor = typeof SPACE_BLACK_COLORS[keyof typeof SPACE_BLACK_COLORS];
export type DefaultGlowColor = typeof DEFAULT_GLOW[keyof typeof DEFAULT_GLOW];