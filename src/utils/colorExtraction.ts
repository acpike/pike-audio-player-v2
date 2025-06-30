/**
 * Color Extraction Service
 * 
 * Canvas-based color extraction for dynamic glow effects from cover art.
 * Implements professional color analysis with caching and error handling.
 * 
 * @fileoverview Dynamic color extraction utilities for cover art analysis
 */

import { ExtractedColors } from '../types/colors';
import { logger } from './logger';
import { COLOR_CONSTANTS } from '../constants/audio';

/**
 * Color extraction service using HTML5 Canvas API
 * 
 * Provides advanced color analysis capabilities including dominant color
 * extraction, complementary color generation, and glow effect creation.
 */
export class ColorExtractionService {
  private cache = new Map<string, ExtractedColors>();
  private readonly CACHE_EXPIRY_MS = 1000 * 60 * 30; // 30 minutes

  /**
   * Extract color palette from image URL
   * 
   * Uses Canvas API to analyze image pixels and extract dominant colors
   * with intelligent color harmonization for professional results.
   * 
   * @param imageUrl - URL of the image to analyze
   * @returns Promise resolving to extracted color palette
   */
  async extractFromImage(imageUrl: string): Promise<ExtractedColors> {
    try {
      // Check cache first
      const cached = this.getCachedColors(imageUrl);
      if (cached) {
        logger.info('Color extraction cache hit', { imageUrl });
        return cached;
      }

      // Load and analyze image
      const colors = await this.analyzeImageColors(imageUrl);
      
      // Cache results
      this.cache.set(imageUrl, colors);
      
      logger.info('Color extraction completed', { 
        imageUrl, 
        dominant: colors.dominant,
        glow: colors.glow 
      });
      
      return colors;
    } catch (error) {
      logger.error('Color extraction failed', { 
        imageUrl,
        error: error instanceof Error ? error.message : String(error)
      });
      
      // Return fallback colors
      return this.getFallbackColors();
    }
  }

  /**
   * Analyze image colors using Canvas API
   * 
   * @private
   * @param imageUrl - URL of image to analyze
   * @returns Promise resolving to extracted colors
   */
  private async analyzeImageColors(imageUrl: string): Promise<ExtractedColors> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            throw new Error('Canvas context not available');
          }

          // Optimize canvas size for performance
          const scale = Math.min(100 / img.width, 100 / img.height);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          
          // Draw and analyze image
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          // Extract colors using advanced color quantization
          const colors = this.extractColorsFromImageData(imageData);
          
          resolve(colors);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${imageUrl}`));
      };
      
      img.src = imageUrl;
    });
  }

  /**
   * Extract colors from image data using smart sampling
   * 
   * Focuses on vibrant, representative colors by sampling strategically
   * and preserving color vibrancy without aggressive quantization.
   * 
   * @private
   * @param imageData - Canvas image data
   * @returns Extracted color palette
   */
  private extractColorsFromImageData(imageData: ImageData): ExtractedColors {
    const colors: Array<{r: number, g: number, b: number}> = [];
    const data = imageData.data;
    
    // Efficient sampling pattern - every 10th pixel for performance
    for (let i = 0; i < data.length; i += COLOR_CONSTANTS.PIXEL_SAMPLING_STEP) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      
      // Simple, effective filtering - skip transparent and very dark pixels
      if (a > COLOR_CONSTANTS.MIN_ALPHA_THRESHOLD && (r + g + b) > COLOR_CONSTANTS.MIN_RGB_SUM_THRESHOLD) {
        colors.push({ r, g, b });
      }
    }
    
    if (colors.length === 0) {
      return this.getFallbackColors();
    }
    
    // Clean averaging algorithm - predictable and reliable
    const avgColor = colors.reduce(
      (acc, color) => ({
        r: acc.r + color.r,
        g: acc.g + color.g,
        b: acc.b + color.b
      }),
      { r: 0, g: 0, b: 0 }
    );
    
    avgColor.r = Math.round(avgColor.r / colors.length);
    avgColor.g = Math.round(avgColor.g / colors.length);
    avgColor.b = Math.round(avgColor.b / colors.length);
    
    // Consistent saturation enhancement for vibrant results
    const saturationBoost = COLOR_CONSTANTS.COLOR_ENHANCEMENT_FACTOR;
    const boostedR = Math.min(COLOR_CONSTANTS.MAX_RGB_VALUE, Math.round(avgColor.r * saturationBoost));
    const boostedG = Math.min(COLOR_CONSTANTS.MAX_RGB_VALUE, Math.round(avgColor.g * saturationBoost));
    const boostedB = Math.min(COLOR_CONSTANTS.MAX_RGB_VALUE, Math.round(avgColor.b * saturationBoost));
    
    const dominant = `rgb(${boostedR}, ${boostedG}, ${boostedB})`;
    
    // Generate accent color from dominant color
    const accent = this.generateAccentColor(dominant);
    
    // Generate glow color with appropriate opacity
    const glow = this.generateGlowFromColor(dominant);
    
    // Generate complementary color
    const complementary = this.generateComplementaryColor(dominant);
    
    return {
      dominant,
      accent,
      glow,
      complementary,
      extractedAt: Date.now()
    };
  }


  /**
   * Generate accent color from dominant color
   * 
   * @private
   * @param dominant - Dominant color in rgb() format
   * @returns Accent color string
   */
  private generateAccentColor(dominant: string): string {
    const rgbMatch = dominant.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!rgbMatch) return 'rgb(59, 130, 246)';
    
    const [, r, g, b] = rgbMatch;
    const variation = 40;
    return `rgb(${Math.min(255, parseInt(r) + variation)}, ${Math.min(255, parseInt(g) + variation)}, ${Math.min(255, parseInt(b) + variation)})`;
  }

  /**
   * Generate glow color with adaptive opacity for Space Black
   * 
   * Uses pure extracted colors with opacity that adapts to brightness:
   * - Dark colors get higher opacity for visibility
   * - Bright colors get lower opacity to prevent overpowering
   * 
   * @param color - Base color in rgb() format
   * @returns Pure color with adaptive opacity for balanced visibility
   */
  generateGlowFromColor(color: string): string {
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!rgbMatch) return 'rgba(96, 165, 250, 0.4)';
    
    let r = parseInt(rgbMatch[1]);
    let g = parseInt(rgbMatch[2]);
    let b = parseInt(rgbMatch[3]);
    
    // Check if color is too dark for glow visibility
    const brightness = (r + g + b) / 3;
    if (brightness < 80) {
      // Boost dark colors to ensure visibility
      const boostFactor = 80 / brightness;
      r = Math.min(255, Math.round(r * boostFactor));
      g = Math.min(255, Math.round(g * boostFactor));
      b = Math.min(255, Math.round(b * boostFactor));
    }
    
    // Use consistent higher opacity for Space Black visibility
    return `rgba(${r}, ${g}, ${b}, 0.6)`;
  }


  /**
   * Generate complementary color using color theory
   * 
   * @private
   * @param color - Base color in rgb() format
   * @returns Complementary color string
   */
  private generateComplementaryColor(color: string): string {
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!rgbMatch) return 'rgb(255, 255, 255)';
    
    const [, r, g, b] = rgbMatch;
    
    // Simple complementary color calculation
    const compR = 255 - parseInt(r);
    const compG = 255 - parseInt(g);
    const compB = 255 - parseInt(b);
    
    return `rgb(${compR}, ${compG}, ${compB})`;
  }

  /**
   * Get cached colors if still valid
   * 
   * @private
   * @param imageUrl - Image URL to check cache for
   * @returns Cached colors or null if expired/missing
   */
  private getCachedColors(imageUrl: string): ExtractedColors | null {
    const cached = this.cache.get(imageUrl);
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.extractedAt > this.CACHE_EXPIRY_MS;
    if (isExpired) {
      this.cache.delete(imageUrl);
      return null;
    }
    
    return cached;
  }

  /**
   * Get fallback colors when extraction fails
   * 
   * @private
   * @returns Default color palette
   */
  private getFallbackColors(): ExtractedColors {
    return {
      dominant: `rgb(${COLOR_CONSTANTS.DEFAULT_BLUE_R}, ${COLOR_CONSTANTS.DEFAULT_BLUE_G}, ${COLOR_CONSTANTS.DEFAULT_BLUE_B})`,
      accent: 'rgb(59, 130, 246)',
      glow: `rgba(${COLOR_CONSTANTS.DEFAULT_BLUE_R}, ${COLOR_CONSTANTS.DEFAULT_BLUE_G}, ${COLOR_CONSTANTS.DEFAULT_BLUE_B}, 0.4)`,
      complementary: 'rgb(250, 165, 96)',
      extractedAt: Date.now()
    };
  }

  /**
   * Clear extraction cache
   */
  clearCache(): void {
    this.cache.clear();
    logger.info('Color extraction cache cleared');
  }
}

// Export singleton instance
export const colorExtractionService = new ColorExtractionService();