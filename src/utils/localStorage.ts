// V7 localStorage Logic - Converted from V7 persistence methods
import { UI_CONSTANTS } from '../constants/audio';
import { logger } from './logger';

export class LocalStorageManager {
  // V7 loadPersistedTrackIndex - From lines 2027-2042
  static loadPersistedTrackIndex(trackDataLength: number): number | null {
    try {
      const persistedIndex = localStorage.getItem('currentTrackIndex');
      if (persistedIndex !== null) {
        const index = parseInt(persistedIndex, UI_CONSTANTS.PARSE_INT_BASE);
        // Validate the persisted index is still valid
        if (index >= UI_CONSTANTS.PROGRESS_MIN_PERCENT && index < trackDataLength) {
          logger.localStorage('loaded', 'currentTrackIndex', index);
          return index;
        }
      }
    } catch (error) {
      logger.warn('localStorage not available, using session state', { error: error instanceof Error ? error.message : String(error) });
    }
    return null;
  }

  // V7 persistTrackIndex - From lines 2044-2056
  static persistTrackIndex(index: number | null, trackDataLength: number): void {
    try {
      if (index !== null && index >= UI_CONSTANTS.PROGRESS_MIN_PERCENT && index < trackDataLength) {
        localStorage.setItem('currentTrackIndex', index.toString());
        logger.localStorage('persisted', 'currentTrackIndex', index);
      } else {
        localStorage.removeItem('currentTrackIndex');
        logger.localStorage('cleared', 'currentTrackIndex');
      }
    } catch (error) {
      logger.warn('Failed to persist track index', { error: error instanceof Error ? error.message : String(error) });
    }
  }

  // V7 Tags toggle persistence - From V7 progress summary
  static loadTagsToggleState(): boolean {
    try {
      const persistedState = localStorage.getItem('tagsToggleState');
      if (persistedState !== null) {
        return JSON.parse(persistedState);
      }
    } catch (error) {
      logger.warn('Failed to load tags toggle state', { error: error instanceof Error ? error.message : String(error) });
    }
    return false; // Default state
  }

  static persistTagsToggleState(state: boolean): void {
    try {
      localStorage.setItem('tagsToggleState', JSON.stringify(state));
      logger.localStorage('persisted', 'tagsToggleState', state);
    } catch (error) {
      logger.warn('Failed to persist tags toggle state', { error: error instanceof Error ? error.message : String(error) });
    }
  }


  // V7 clearPersistedState - From lines 2058-2065
  static clearPersistedState(): void {
    try {
      localStorage.removeItem('currentTrackIndex');
      localStorage.removeItem('tagsToggleState');
      logger.localStorage('cleared', 'all');
    } catch (error) {
      logger.warn('Failed to clear persisted state', { error: error instanceof Error ? error.message : String(error) });
    }
  }
}