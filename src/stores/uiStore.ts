import { create } from 'zustand';
import { UIState, UIActions } from '../types/ui';
import { LocalStorageManager } from '../utils/localStorage';

interface UIStore extends UIState, UIActions {}

export const useUIStore = create<UIStore>((set) => ({
  // V7 UI State Properties - From device detection and responsive logic
  deviceType: 'desktop',
  orientation: 'portrait',
  isLandscapeMode: false,
  isPortraitMode: true,
  isInIframe: false,
  isDescriptionExpanded: false,
  isSwipeExpanded: false,
  isSwipeActive: false,
  tagsToggleState: LocalStorageManager.loadTagsToggleState(),
  screenWidth: window.innerWidth,
  screenHeight: window.innerHeight,
  parentOrigin: null,

  // Actions
  setDeviceType: (type) => {
    set({ deviceType: type });
  },

  setOrientation: (orientation) => {
    set({ orientation });
  },

  setLandscapeMode: (isLandscape) => {
    set({ isLandscapeMode: isLandscape, isPortraitMode: !isLandscape });
    // Modern CSS Module approach: no DOM manipulation, use data attributes
  },

  setPortraitMode: (isPortrait) => {
    set({ isPortraitMode: isPortrait, isLandscapeMode: !isPortrait });
  },

  setDescriptionExpanded: (expanded) => {
    set({ isDescriptionExpanded: expanded });
  },

  setSwipeExpanded: (expanded) => {
    set({ isSwipeExpanded: expanded });
  },

  setSwipeActive: (active) => {
    set({ isSwipeActive: active });
  },

  setTagsToggle: (state) => {
    set({ tagsToggleState: state });
    LocalStorageManager.persistTagsToggleState(state);
  },

  updateScreenDimensions: () => {
    set({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight
    });
  }
}));