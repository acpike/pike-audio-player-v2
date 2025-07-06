import React, { useEffect, useState, useRef } from 'react';
import styles from './SmartLip.module.css';

interface SmartLipProps {
  scrollContainer: HTMLElement | null;
}

export const SmartLip: React.FC<SmartLipProps> = ({ scrollContainer }) => {
  const [isVisible, setIsVisible] = useState(true);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const INACTIVITY_DELAY = 2000; // 2 seconds
  const SCROLL_THRESHOLD = 10; // pixels

  useEffect(() => {
    if (!scrollContainer) return;

    const handleScroll = () => {
      const scrollTop = scrollContainer.scrollTop;

      // Clear existing timer
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }

      if (scrollTop > SCROLL_THRESHOLD && isVisible) {
        // User scrolled down, hide the lip
        setIsVisible(false);
      } else if (scrollTop <= SCROLL_THRESHOLD && !isVisible) {
        // User scrolled to top, set timer to show lip after inactivity
        inactivityTimerRef.current = setTimeout(() => {
          setIsVisible(true);
        }, INACTIVITY_DELAY);
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll);

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [scrollContainer, isVisible]);

  return (
    <div className={styles.smartLipContainer}>
      <div className={`${styles.smartLip} ${!isVisible ? styles.hidden : ''}`}>
        Tap to play <span className={styles.separator}>•</span> Double tap for preview
      </div>
    </div>
  );
};