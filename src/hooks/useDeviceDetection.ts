import { useEffect } from 'react';
import { useUIStore } from '../stores/uiStore';
import { DEVICE_CONSTANTS } from '../constants/audio';
import { logger } from '../utils/logger';
import type { DeviceType } from '../types/ui';

// V7 Device Detection Logic - Extracted from lines 2007-2024, 2555-2850
export const useDeviceDetection = () => {
  const { 
    setDeviceType, 
    setOrientation, 
    setLandscapeMode, 
    updateScreenDimensions,
    deviceType,
    orientation,
    isLandscapeMode,
    isInIframe
  } = useUIStore();

  // V7 Phone Detection - Exact logic from lines 2007-2024
  const isPhoneDevice = (): boolean => {
    const isIPhone = /iPhone/i.test(navigator.userAgent);
    const isSmallAndroid = /Android/i.test(navigator.userAgent) && window.screen.width <= DEVICE_CONSTANTS.SMALL_ANDROID_MAX_WIDTH;
    // V7 breakpoint: Changed from 896px to match CSS @media mobile breakpoint
    const isSmallScreen = window.screen.width <= DEVICE_CONSTANTS.MOBILE_MAX_WIDTH || window.screen.height <= DEVICE_CONSTANTS.MOBILE_MAX_WIDTH;
    
    return isIPhone || isSmallAndroid || isSmallScreen;
  };

  // V7 Iframe Detection - From lines 2026-2060
  const detectIframe = (): boolean => {
    return window.parent !== window;
  };

  // V7 Orientation Detection - From lines 2655-2690
  const detectOrientation = () => {
    // Multiple detection methods for reliability (V7 approach)
    const mediaQueryLandscape = window.matchMedia('(orientation: landscape)').matches;
    const screenLandscape = screen.orientation && 
                           screen.orientation.type.includes('landscape');
    const dimensionsLandscape = window.innerWidth > window.innerHeight;
    const aspectRatioLandscape = window.innerWidth / window.innerHeight > DEVICE_CONSTANTS.LANDSCAPE_ASPECT_RATIO_THRESHOLD;

    // Use any positive result (more inclusive) - V7 line 2662
    const isLandscape = mediaQueryLandscape || screenLandscape || 
                       (dimensionsLandscape && aspectRatioLandscape);

    return isLandscape ? 'landscape' : 'portrait';
  };

  // V7 Device Type Classification
  const classifyDevice = (): DeviceType => {
    if (isPhoneDevice()) {
      return 'phone';
    }
    
    // V7 iPad detection: tablet width range based on media queries
    const isTablet = window.screen.width > DEVICE_CONSTANTS.TABLET_MIN_WIDTH && window.screen.width <= DEVICE_CONSTANTS.TABLET_MAX_WIDTH;
    if (isTablet) {
      return 'ipad';
    }
    
    return 'desktop';
  };

  // V7 Orientation Handler - From handleTabletOrientationChange
  const handleOrientationChange = () => {
    const newOrientation = detectOrientation();
    const newDeviceType = classifyDevice();
    const isLandscape = newOrientation === 'landscape';

    // Update screen dimensions first
    updateScreenDimensions();
    
    // Update device classification
    setDeviceType(newDeviceType);
    setOrientation(newOrientation);
    setLandscapeMode(isLandscape);

    // V7 Debug logging - From lines 2669-2680
    logger.deviceDetection({
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      mediaQuery: window.matchMedia('(orientation: landscape)').matches,
      screenOrientation: screen.orientation?.type,
      aspectRatio: (window.innerWidth / window.innerHeight).toFixed(2),
      isLandscape,
      deviceType: newDeviceType,
      isIframe: detectIframe()
    });
  };

  useEffect(() => {
    // Initial detection
    handleOrientationChange();

    // V7 Event Listeners - From setupSmartOrientationHandling (lines 2627-2641)
    let debounceTimer: NodeJS.Timeout;
    const debouncedHandler = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        handleOrientationChange();
      }, DEVICE_CONSTANTS.ORIENTATION_DEBOUNCE_MS); // Debounce to prevent rapid orientation changes
    };

    window.addEventListener('orientationchange', debouncedHandler);
    window.addEventListener('resize', debouncedHandler);

    return () => {
      window.removeEventListener('orientationchange', debouncedHandler);
      window.removeEventListener('resize', debouncedHandler);
      clearTimeout(debounceTimer);
    };
  }, []);

  return {
    deviceType,
    orientation,
    isLandscapeMode,
    isInIframe,
    isPhoneDevice: deviceType === 'phone'
  };
};