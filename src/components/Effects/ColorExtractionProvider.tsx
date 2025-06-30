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
  
  // Update theme when colors change - isolated from audio state
  useEffect(() => {
    if (colors) {
      setExtractedColors(colors);
    } else {
      resetToDefaults();
    }
  }, [colors, setExtractedColors, resetToDefaults]);

  return <>{children}</>;
};