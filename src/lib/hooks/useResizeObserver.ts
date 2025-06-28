import { useEffect, useRef } from 'react';
import { createStableResizeObserver } from '../utils/resizeObserverUtils';

/**
 * Hook for safely using ResizeObserver 
 * with error handling and debouncing
 * 
 * @param callback The resize callback
 * @param options Configuration options
 * @returns An object with the latest observed size
 */
export function useResizeObserver<T extends HTMLElement = HTMLDivElement>(
  callback: (entry: ResizeObserverEntry) => void,
  options: {
    debounce?: number;
    disabled?: boolean;
    ref?: React.RefObject<T>;
  } = {}
) {
  const { 
    debounce = 200, 
    disabled = false,
    ref: externalRef
  } = options;
  
  // Create internal ref if external ref not provided
  const internalRef = useRef<T>(null);
  const ref = externalRef || internalRef;
  
  // Track the latest size
  const sizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });
  
  useEffect(() => {
    if (disabled || !ref.current) return;
    
    // Create a stable resize observer
    const observer = createStableResizeObserver((entries) => {
      if (entries.length === 0) return;
      
      const entry = entries[entries.length - 1]; // Use most recent entry
      
      // Only trigger callback if size actually changed
      const newWidth = entry.contentRect.width;
      const newHeight = entry.contentRect.height;
      
      if (
        newWidth !== sizeRef.current.width || 
        newHeight !== sizeRef.current.height
      ) {
        sizeRef.current = { width: newWidth, height: newHeight };
        callback(entry);
      }
    }, { debounce, disabled });
    
    // Start observing
    observer.observe(ref.current);
    
    return () => {
      observer.disconnect();
    };
  }, [callback, debounce, disabled, ref]);
  
  return {
    ref,
    size: sizeRef.current,
    width: sizeRef.current.width,
    height: sizeRef.current.height
  };
}