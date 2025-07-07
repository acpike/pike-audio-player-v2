import React, { useEffect } from 'react';
import { useColorExtraction } from '../../hooks/useColorExtraction';
import { useThemeStore } from '../../stores/themeStore';
import { useCSSProperty } from '../../hooks/useCSSProperty';
import { Track } from '../../types/tracks';

interface ColorExtractionProviderProps {
  currentTrack: Track | null;
  children: React.ReactNode;
}

/**
 * V1_Rewrite_QA_1.6.9.1: Isolated color extraction system
 * 
 * Decoupled from audio player to prevent state interference.
 * Handles color extraction and theme updates independently.
 */
export const ColorExtractionProvider: React.FC<ColorExtractionProviderProps> = ({ 
  currentTrack, 
  children 
}) => {
  // Color extraction isolated from audio flow
  const { colors } = useColorExtraction(currentTrack?.art || null);
  const setExtractedColors = useThemeStore(state => state.setExtractedColors);
  const resetToDefaults = useThemeStore(state => state.resetToDefaults);
  const currentGlowColor = useThemeStore(state => state.currentGlowColor);
  
  // Sync glow color to CSS custom property
  useCSSProperty('--current-glow-color', currentGlowColor);
  
  
  // Extract RGB components and set individual CSS variables to prevent fallback flashing
  const extractRGBFromColor = (color: string) => {
    const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbaMatch) {
      return {
        r: rgbaMatch[1],
        g: rgbaMatch[2], 
        b: rgbaMatch[3]
      };
    }
    return { r: '255', g: '255', b: '255' }; // Fallback to white
  };
  
  const rgb = extractRGBFromColor(currentGlowColor);
  useCSSProperty('--glow-r', rgb.r);
  useCSSProperty('--glow-g', rgb.g);
  useCSSProperty('--glow-b', rgb.b);
  
  // Update theme when colors change - isolated from audio state
  useEffect(() => {
    if (colors) {
      setExtractedColors(colors);
    }
    // Note: Don't reset to defaults when colors is null - preserve previous color
    // during extraction. Only reset when explicitly needed (no track at all).
  }, [colors, setExtractedColors]);

  // Reset only when no track is selected at all
  useEffect(() => {
    if (!currentTrack) {
      resetToDefaults();
    }
  }, [currentTrack, resetToDefaults]);

  return <>{children}</>;
};