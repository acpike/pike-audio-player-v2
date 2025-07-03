import { useEffect } from 'react';

/**
 * Custom hook for managing CSS custom properties safely
 * Extracts DOM manipulation from stores to React hooks
 */
export const useCSSProperty = (property: string, value: string) => {
  useEffect(() => {
    if (typeof document !== 'undefined' && property && value) {
      document.documentElement.style.setProperty(property, value);
    }
  }, [property, value]);
};