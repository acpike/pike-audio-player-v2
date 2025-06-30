import { useEffect } from 'react';
import { DEVICE_CONSTANTS } from '../constants/audio';
import { DeviceType } from '../types/ui';

/**
 * Hook for managing touch device and performance body classes
 */
export const useTouchDeviceClasses = () => {
  useEffect(() => {
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isMobile || isTouchDevice) {
      document.body.classList.add('touch-device');
      
      // V7 Performance optimization for low-end devices  
      const isLowEnd = navigator.hardwareConcurrency <= DEVICE_CONSTANTS.LOW_END_CONCURRENCY_THRESHOLD || 
                      ((performance as any).memory && (performance as any).memory.totalJSHeapSize < DEVICE_CONSTANTS.LOW_END_MEMORY_THRESHOLD);
      
      if (isLowEnd) {
        document.body.classList.add('low-performance');
      }
    }
  }, []);
};

/**
 * Hook for managing device type body classes
 */
export const useDeviceTypeClasses = (deviceType: DeviceType) => {
  useEffect(() => {
    // Remove all device classes
    document.body.classList.remove('phone-device', 'ipad-device', 'desktop-device');
    // Add current device class
    document.body.classList.add(`${deviceType}-device`);
    
    return () => {
      // Cleanup on unmount
      document.body.classList.remove('phone-device', 'ipad-device', 'desktop-device');
    };
  }, [deviceType]);
};