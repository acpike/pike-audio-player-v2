// V7 UI State Properties - Extracted from device detection and responsive logic
export type DeviceType = 'phone' | 'ipad' | 'desktop';
export type Orientation = 'portrait' | 'landscape';

export interface UIState {
  deviceType: DeviceType;
  orientation: Orientation;
  isLandscapeMode: boolean;
  isPortraitMode: boolean;
  isInIframe: boolean;
  isDescriptionExpanded: boolean;
  isSwipeExpanded: boolean;
  isSwipeActive: boolean;
  tagsToggleState: 'off' | 'tags' | 'description';
  screenWidth: number;
  screenHeight: number;
  parentOrigin: string | null;
}

export interface UIActions {
  setDeviceType: (type: DeviceType) => void;
  setOrientation: (orientation: Orientation) => void;
  setLandscapeMode: (isLandscape: boolean) => void;
  setPortraitMode: (isPortrait: boolean) => void;
  setDescriptionExpanded: (expanded: boolean) => void;
  setSwipeExpanded: (expanded: boolean) => void;
  setSwipeActive: (active: boolean) => void;
  setTagsToggle: (state: 'off' | 'tags' | 'description') => void;
  updateScreenDimensions: () => void;
}