/**
 * Utility function to scroll a track into view within the track list container
 * Used for both manual track selection and auto-advance scenarios
 */
export const scrollTrackIntoView = (trackIndex: number) => {
  // Find the track element by data attribute or index
  const trackElement = document.querySelector(`[data-track-index="${trackIndex}"]`) as HTMLElement;
  
  if (!trackElement) {
    console.warn(`Track element not found for index ${trackIndex}`);
    return;
  }
  

  const container = trackElement.parentElement;
  
  if (!container) {
    console.warn('Track list container not found');
    return;
  }

  const trackRect = trackElement.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  
  // Check if track is partially out of view
  const isPartiallyAbove = trackRect.top < containerRect.top;
  const isPartiallyBelow = trackRect.bottom > containerRect.bottom;
  
  if (isPartiallyAbove || isPartiallyBelow) {
    // Calculate scroll position to center the track
    const trackOffsetTop = trackElement.offsetTop;
    const trackHeight = trackElement.offsetHeight;
    const containerHeight = container.clientHeight;
    
    // Scroll to position that centers the track (or puts it at top if too tall)
    const scrollTop = trackOffsetTop - (containerHeight - trackHeight) / 2;
    
    // Temporarily disable scroll-snap for smooth animation
    container.style.scrollSnapType = 'none';
    
    // Smooth scroll with custom duration
    const startScroll = container.scrollTop;
    const distance = Math.max(0, scrollTop) - startScroll;
    const duration = 600; // 600ms for slower, more polished animation
    const startTime = performance.now();
    
    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth deceleration
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      
      container.scrollTop = startScroll + (distance * easeOutCubic);
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        // Re-enable scroll-snap after animation completes
        container.style.scrollSnapType = 'y mandatory';
      }
    };
    
    requestAnimationFrame(animateScroll);
  }
};