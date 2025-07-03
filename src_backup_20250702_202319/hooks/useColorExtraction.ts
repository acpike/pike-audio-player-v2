/**
 * Color Extraction Hook - V8 Design System
 * 
 * Simple hook that extracts colors from an image URL.
 * Returns extracted colors and loading state.
 * 
 * @fileoverview Clean color extraction hook following React best practices
 * @version V1_Rewrite_1.5.7c
 */

import { useState, useEffect } from 'react';
import { ColorExtractionService } from '../utils/colorExtraction';
import { ExtractedColors } from '../types/colors';

/**
 * Extract colors from image URL
 * 
 * @param imageUrl - URL of image to analyze
 * @returns Object with colors and loading state
 */
export const useColorExtraction = (imageUrl: string | null) => {
  const [colors, setColors] = useState<ExtractedColors | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!imageUrl) {
      setColors(null);
      return;
    }

    setIsLoading(true);
    const colorService = new ColorExtractionService();

    colorService.extractFromImage(imageUrl)
      .then(setColors)
      .catch(() => setColors(null))
      .finally(() => setIsLoading(false));
  }, [imageUrl]);

  return { colors, isLoading };
};