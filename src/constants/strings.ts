/**
 * UI String Constants - QA Enhancement
 * 
 * Centralized string constants for internationalization and maintainability.
 * Replaces hard-coded strings throughout the application.
 */

export const UI_STRINGS = {
  // Player Controls
  PLAY: 'Play',
  PAUSE: 'Pause',
  LOADING: 'Loading...',
  
  // Player States
  NOW_PLAYING: 'NOW PLAYING',
  PREVIEWING: 'PREVIEWING',
  MUSIC_PLAYER: 'MUSIC PLAYER',
  
  // Track List
  SELECT_TRACK_BELOW: 'Select a track below',
  SELECT_TRACK: 'Select a track',
  TAP_TO_PLAY: 'Tap to play',
  UNKNOWN_TRACK: 'Unknown Track',
  UNKNOWN_ALBUM: 'Unknown Album',
  
  // Preview Buttons
  PREVIEW_15: '15s',
  PREVIEW_30: '30s',
  
  // Error Messages
  ERROR_AUDIO_FAILED: 'Audio playback failed',
  ERROR_AUDIO_LOAD: 'Failed to load audio file',
  ERROR_NETWORK: 'Network connection error',
  ERROR_GENERIC: 'An unexpected error occurred',
  
  // Error Recovery
  TRY_AGAIN: 'Try Again',
  REFRESH_PAGE: 'Refresh Page',
  AUTO_RECOVERY: 'Attempting auto-recovery...',
  RECOVERY_FAILED: 'Auto-recovery failed. Please refresh to try again.',
  
  // Accessibility
  ARIA_PLAY_BUTTON: 'Play audio track',
  ARIA_PAUSE_BUTTON: 'Pause audio track',
  ARIA_PROGRESS_BAR: 'Audio progress',
  ARIA_VOLUME_CONTROL: 'Volume control',
  
  // Debug Panel
  DEBUG_VERSION: 'Version',
  DEBUG_PHASE: 'Phase',
  DEBUG_FEATURES: 'Features',
  DEBUG_BRANCH: 'Git Branch',
  DEBUG_COMMIT: 'Last Commit',
  DEBUG_BUILD_TIME: 'Build Time',
  
  // UI Labels
  DESCRIPTION: 'Description',
  TAGS: 'TAGS',
  TRACKS_COUNT: (count: number) => `${count} tracks`,
  ALBUM_TRACK_INFO: (album: string, count: number) => `${album} | ${count} tracks`
} as const;

/**
 * Type for accessing UI strings with autocomplete support
 */
export type UIStringsKey = keyof typeof UI_STRINGS;