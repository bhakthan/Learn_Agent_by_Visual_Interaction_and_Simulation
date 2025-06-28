import { useEffect, useRef, useState, useCallback } from 'react';
import { createDebouncedResizeObserver } from '../utils/resizeObserverUtils';

type ResizeObserverRect = {
  width: number;
  height: number;
  x: number;
  y: number;
  top: number;
  left: number;
  right: number;
  bottom: number;
};

/**
 * React hook for safe ResizeObserver usage that avoids loop errors
 * @param debounceTime Debounce delay in ms
 * @returns [ref, dimensions, observer] 
 */
export function useResizeObserver<T extends HTMLElement = HTMLDivElement>(
  debounceTime: number = 100
): [React.RefObject<T>, ResizeObserverRect | undefined, ResizeObserver | null] {
  const ref = useRef<T>(null);
  const [dimensions, setDimensions] = useState<ResizeObserverRect>();
  const [observer, setObserver] = useState<ResizeObserver | null>(null);

  const handleResize = useCallback((entries: ResizeObserverEntry[]) => {
    if (!entries.length) return;
    
    // Use contentRect for more accurate sizing that excludes borders
    const contentRect = entries[0].contentRect;
    
    // Schedule state update to avoid React state updates during render
    requestAnimationFrame(() => {
      setDimensions({
        width: contentRect.width,
        height: contentRect.height,
        x: contentRect.x,
        y: contentRect.y,
        top: contentRect.top,
        left: contentRect.left,
        right: contentRect.right,
        bottom: contentRect.bottom
      });
    });
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    
    // Create debounced observer 
    const resizeObserver = createDebouncedResizeObserver(handleResize, debounceTime);
    
    // Start observing
    resizeObserver.observe(ref.current);
    
    // Store observer instance
    setObserver(resizeObserver);
    
    // Cleanup function to disconnect observer
    return () => {
      resizeObserver.disconnect();
      setObserver(null);
    };
  }, [handleResize, debounceTime]);

  return [ref, dimensions, observer];
}

export default useResizeObserver;