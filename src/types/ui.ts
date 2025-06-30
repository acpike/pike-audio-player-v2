// V7 UI State Properties - Extracted from device detection and responsive logic
export type DeviceType = 'phone' | 'ipad' | 'desktop';
export type Orientation = 'portrait' | 'landscape';

export interface UIState {
  deviceType: DeviceType;
  orientation: Orientation;
  isLandscapeMode: boolean;
  isInIframe: boolean;
  isDescriptionExpanded: boolean;
  isSwipeExpanded: boolean;
  isSwipeActive: boolean;
  tagsToggleState: boolean;
  screenWidth: number;
  screenHeight: number;
  parentOrigin: string | null;
}

export interface UIActions {
  setDeviceType: (type: DeviceType) => void;
  setOrientation: (orientation: Orientation) => void;
  setLandscapeMode: (isLandscape: boolean) => void;
  setDescriptionExpanded: (expanded: boolean) => void;
  setSwipeExpanded: (expanded: boolean) => void;
  setSwipeActive: (active: boolean) => void;
  setTagsToggle: (state: boolean) => void;
  updateScreenDimensions: () => void;
}