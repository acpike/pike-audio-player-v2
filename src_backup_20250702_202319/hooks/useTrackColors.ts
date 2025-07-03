/**
 * Track Color Extraction Hook - V8 Design System
 * 
 * Extracts colors from individual track thumbnails and sets CSS variables
 * for track tile glow effects. Follows clean hook patterns.
 * 
 * @fileoverview Individual track color extraction for tile glow harmony
 * @version V1_Rewrite_1.5.7d
 */

import { useEffect, useState } from 'react';
import { ColorExtractionService } from '../utils/colorExtraction';
import { logger } from '../utils/logger';

/**
 * Extract colors for a specific track and return them for local use
 * 
 * @param trackId - Unique track identifier  
 * @param imageUrl - Track thumbnail URL
 * @param isActive - Whether this track is currently active
 * @returns Object with extracted RGB values
 */
export const useTrackColors = (trackId: string, imageUrl: string, isActive: boolean) => {
  const [colors, setColors] = useState<{r: string, g: string, b: string} | null>(null);

  useEffect(() => {
    if (!isActive || !imageUrl || !trackId) {
      setColors(null);
      return;
    }

    const extractColors = async () => {
      try {
        const colorService = new ColorExtractionService();
        const extractedColors = await colorService.extractFromImage(imageUrl);
        
        // Parse the glow color to get RGB values
        const rgbMatch = extractedColors.glow.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (rgbMatch) {
          const [, r, g, b] = rgbMatch;
          setColors({ r, g, b });
          logger.info('Track colors extracted', { trackId, r, g, b });
        }
      } catch (error) {
        logger.error('Track color extraction failed', { trackId, error });
        setColors(null);
      }
    };

    extractColors();
  }, [trackId, imageUrl, isActive]);

  return colors;
};