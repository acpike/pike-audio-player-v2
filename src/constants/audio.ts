/**
 * Audio-related constants for consistent configuration
 */

export const AUDIO_CONSTANTS = {
  /** Base retry delay in milliseconds for exponential backoff */
  RETRY_BASE_DELAY_MS: 1000,
  
  /** Audio preload strategy for mobile optimization */
  PRELOAD_STRATEGY: 'none' as const,
  
  /** Minimum ready state required for playback */
  MIN_READY_STATE: HTMLMediaElement.HAVE_CURRENT_DATA,
  
  /** Preview durations in seconds */
  PREVIEW_DURATION_SHORT: 15,
  PREVIEW_DURATION_LONG: 30,
} as const;

/**
 * Device detection and performance constants  
 */
export const DEVICE_CONSTANTS = {
  /** Hardware concurrency threshold for low-end device detection */
  LOW_END_CONCURRENCY_THRESHOLD: 4,
  
  /** Memory threshold for low-end device detection (100MB) */
  LOW_END_MEMORY_THRESHOLD: 100000000,
  
  /** Debounce delay for orientation changes in milliseconds */
  ORIENTATION_DEBOUNCE_MS: 150,
  
  /** Screen width thresholds for device classification */
  SMALL_ANDROID_MAX_WIDTH: 480,
  MOBILE_MAX_WIDTH: 768,
  TABLET_MIN_WIDTH: 950,
  TABLET_MAX_WIDTH: 1200,
  
  /** Aspect ratio threshold for landscape detection */
  LANDSCAPE_ASPECT_RATIO_THRESHOLD: 1.3,
} as const;

/**
 * Color extraction constants
 */
export const COLOR_CONSTANTS = {
  /** Pixel sampling step for color extraction performance */
  PIXEL_SAMPLING_STEP: 40,
  
  /** Minimum alpha value for color consideration */
  MIN_ALPHA_THRESHOLD: 128,
  
  /** Minimum RGB sum for color consideration */
  MIN_RGB_SUM_THRESHOLD: 100,
  
  /** Timeout for color extraction in milliseconds */
  EXTRACTION_TIMEOUT_MS: 3000,
  
  /** Maximum RGB color value */
  MAX_RGB_VALUE: 255,
  
  /** Color enhancement factor for glow effects */
  COLOR_ENHANCEMENT_FACTOR: 1.3,
  
  /** Default fallback color RGB values */
  DEFAULT_BLUE_R: 96,
  DEFAULT_BLUE_G: 165,
  DEFAULT_BLUE_B: 250,
  
  /** Additional fallback colors */
  PURPLE_R: 168,
  PURPLE_G: 85,
  PURPLE_B: 247,
  RED_R: 239,
  RED_G: 68,
  RED_B: 68,
  GREEN_R: 34,
  GREEN_G: 197,
  GREEN_B: 94,
  YELLOW_R: 251,
  YELLOW_G: 191,
  YELLOW_B: 36,
  PINK_R: 236,
  PINK_G: 72,
  PINK_B: 153,
} as const;

/**
 * UI interaction constants
 */
export const UI_CONSTANTS = {
  /** Debug panel triple-tap timeout in milliseconds */
  DEBUG_PANEL_TAP_TIMEOUT_MS: 1000,
  
  /** SVG viewBox standard size for icons */
  ICON_VIEWBOX_SIZE: 24,
  
  /** Base for parseInt operations */
  PARSE_INT_BASE: 10,
  
  /** Time display formatting */
  SECONDS_PER_MINUTE: 60,
  PERCENTAGE_MULTIPLIER: 100,
  
  /** Progress bar constraints */
  PROGRESS_MIN_PERCENT: 0,
  PROGRESS_MAX_PERCENT: 100,
  
} as const;

/**
 * SVG icon coordinate constants
 */
export const SVG_CONSTANTS = {
  /** Play button pause icon coordinates */
  PAUSE_RECT1: { x: "6", y: "4", width: "4", height: "16" },
  PAUSE_RECT2: { x: "14", y: "4", width: "4", height: "16" },
  
  /** Play button play icon coordinates */
  PLAY_POLYGON: "5,3 19,12 5,21",
  
  /** Tags toggle arrow coordinates */
  TAGS_ARROW_PATH: "M7 7h10l-5.5 8L7 7z",
  
  /** Stroke width for SVG elements */
  STROKE_WIDTH: "2",
} as const;

/**
 * Audio error types for proper error handling
 */
export class AudioError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly retryable: boolean = true
  ) {
    super(message);
    this.name = 'AudioError';
  }
}

export class NotAllowedError extends AudioError {
  constructor(message: string = 'Autoplay blocked by browser policy') {
    super(message, 'NOT_ALLOWED', false);
    this.name = 'NotAllowedError';
  }
}

export class AbortError extends AudioError {
  constructor(message: string = 'Operation was aborted') {
    super(message, 'ABORT', false);
    this.name = 'AbortError';
  }
}