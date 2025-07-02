import React, { useRef, useState, useCallback } from 'react';
import { useAudioStore } from '../../stores/audioStore';
import { UI_CONSTANTS } from '../../constants/audio';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  audioRef: React.RefObject<HTMLAudioElement>;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ audioRef }) => {
  const { currentTime, duration, isLoading } = useAudioStore();
  const progressRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);

  // V7 Time formatting
  const formatTime = (time: number): string => {
    if (!time || !isFinite(time)) return '0:00';
    const minutes = Math.floor(time / UI_CONSTANTS.SECONDS_PER_MINUTE);
    const seconds = Math.floor(time % UI_CONSTANTS.SECONDS_PER_MINUTE);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // V7 Progress calculation
  const progress = duration > 0 ? (isDragging ? dragTime : currentTime) / duration : 0;
  const progressPercent = Math.min(Math.max(progress * UI_CONSTANTS.PERCENTAGE_MULTIPLIER, UI_CONSTANTS.PROGRESS_MIN_PERCENT), UI_CONSTANTS.PROGRESS_MAX_PERCENT);
  
  // Update tooltip position with requestAnimationFrame for maximum smoothness
  const updateTooltipPosition = useCallback((clientX: number) => {
    if (!progressRef.current || !tooltipRef.current) return;
    
    requestAnimationFrame(() => {
      if (!progressRef.current || !tooltipRef.current) return;
      
      const rect = progressRef.current.getBoundingClientRect();
      const relativeX = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const percentage = (relativeX / rect.width) * 100;
      
      // Use percentage positioning like CSS for consistency
      tooltipRef.current.style.left = `${percentage}%`;
      tooltipRef.current.style.transform = `translateX(-50%)`;
    });
  }, []);

  // V7 Scrubbing logic - From V7 progress bar touch events
  const handleProgressClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!progressRef.current || !audioRef?.current || !duration) return;

    const rect = progressRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clickPercent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newTime = clickPercent * duration;

    audioRef.current.currentTime = newTime;
    useAudioStore.setState({ currentTime: newTime });
  }, [duration, audioRef]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    updateTooltipPosition(e.clientX);
    handleProgressClick(e);
  }, [handleProgressClick, updateTooltipPosition]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !progressRef.current || !duration) return;

    const rect = progressRef.current.getBoundingClientRect();
    const movePercent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = movePercent * duration;
    setDragTime(newTime);
    updateTooltipPosition(e.clientX);
  }, [isDragging, duration, updateTooltipPosition]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging || !audioRef?.current) return;

    audioRef.current.currentTime = dragTime;
    useAudioStore.setState({ currentTime: dragTime });
    setIsDragging(false);
  }, [isDragging, dragTime, audioRef]);

  // V7 Touch events for mobile scrubbing
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    updateTooltipPosition(e.touches[0].clientX);
    handleProgressClick(e);
  }, [handleProgressClick, updateTooltipPosition]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !progressRef.current || !duration) return;

    e.preventDefault();
    const rect = progressRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const movePercent = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
    const newTime = movePercent * duration;
    setDragTime(newTime);
    updateTooltipPosition(touch.clientX);
  }, [isDragging, duration, updateTooltipPosition]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging || !audioRef?.current) return;

    audioRef.current.currentTime = dragTime;
    useAudioStore.setState({ currentTime: dragTime });
    setIsDragging(false);
  }, [isDragging, dragTime, audioRef]);

  // V7 Event listeners for mouse/touch
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  if (isLoading || duration === 0) {
    return (
      <div className={styles.progressWrapper}>
        <div className={styles.timeDisplay}>
          <span>--:--</span>
          <span>--:--</span>
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: '0%' }} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.progressWrapper}>
      <div className={styles.timeDisplay}>
        <span className={styles.currentTime}>
          {formatTime(isDragging ? dragTime : currentTime)}
        </span>
        <span className={styles.duration}>
          {formatTime(duration)}
        </span>
      </div>
      
      <div 
        ref={progressRef}
        className={`${styles.progressBar} ${isDragging ? styles.progressBarDragging : ''}`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div 
          className={styles.progressFill}
          style={{ width: `${progressPercent}%` }}
        >
          <div 
            className={styles.progressThumb}
            style={{ display: isDragging ? 'block' : 'none' }}
          />
        </div>
        
        {/* Scrub Tooltip - Only visible when dragging */}
        {isDragging && (
          <div 
            ref={tooltipRef}
            className={styles.scrubTooltip}
          >
            {formatTime(dragTime)}
          </div>
        )}
      </div>
    </div>
  );
};