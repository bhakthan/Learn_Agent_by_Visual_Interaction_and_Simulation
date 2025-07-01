import { useEffect, useRef, useState, useCallback } from 'react';
import { createStableResizeObserver } from '../utils/resizeObserverUtils';

/**
 * Hook for safely using ResizeObserver with enhanced stability
 * Implements error handling, debouncing and memoization to prevent excessive renders
 * 
 * @param callback The resize callback
 * @param options Configuration options
 * @returns An object with the latest observed size and element reference
 */
export function useResizeObserver<T extends HTMLElement = HTMLDivElement>(
  callback?: (entry: ResizeObserverEntry) => void,
  options: {
    debounce?: number;
    disabled?: boolean;
    ref?: React.RefObject<T>;
    onError?: (error: unknown) => void;
    skipInitialCallback?: boolean;
  } = {}
) {
  const { 
    debounce = 100, 
    disabled = false,
    ref: externalRef,
    onError,
    skipInitialCallback = false
  } = options;
  
  // Create internal ref if external ref not provided
  const internalRef = useRef<T>(null);
  const ref = externalRef || internalRef;
  
  // Track the latest size with state for reactivity
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  
  // Refs to track state without triggering re-renders
  const callbackRef = useRef(callback);
  const initialCallbackMadeRef = useRef(!skipInitialCallback);
  const isActiveRef = useRef(!disabled);
  const observerRef = useRef<ResizeObserver | null>(null);
  
  // Update refs when props change without causing effect to re-run
  callbackRef.current = callback;
  isActiveRef.current = !disabled;
  
  // Memoized resize handler to prevent unnecessary observer recreations
  const handleResize = useCallback((entries: ResizeObserverEntry[]) => {
    if (!isActiveRef.current || entries.length === 0) return;
    
    try {
      const entry = entries[entries.length - 1]; // Use most recent entry
      
      // Extract sizes with safeguards against DOMRectReadOnly access errors
      const newWidth = entry.contentRect?.width ?? 0;
      const newHeight = entry.contentRect?.height ?? 0;
      
      // Only trigger if size actually changed
      setSize(prevSize => {
        if (prevSize.width !== newWidth || prevSize.height !== newHeight) {
          // Update size state
          const newSize = { width: newWidth, height: newHeight };
          
          // Call callback if defined
          if (callbackRef.current) {
            // Enforce initial callback rule
            if (!initialCallbackMadeRef.current) {
              initialCallbackMadeRef.current = true;
              // Skip if we should not call initially
              if (!skipInitialCallback) {
                callbackRef.current(entry);
              }
            } else {
              callbackRef.current(entry);
            }
          }
          
          return newSize;
        }
        return prevSize;
      });
    } catch (error) {
      if (onError) {
        onError(error);
      } else {
        console.warn('Error in resize observer callback', error);
      }
    }
  }, [skipInitialCallback, onError]);
  
  // Setup resize observer with stable implementation
  useEffect(() => {
    if (disabled || !ref.current) return;
    
    try {
      // Clean up any existing observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      
      // Create a stable resize observer with debounce handling built-in
      observerRef.current = createStableResizeObserver(handleResize);
      
      // Start observing
      if (ref.current) {
        observerRef.current.observe(ref.current);
        
        // Immediately check size to initialize values
        const width = ref.current.offsetWidth;
        const height = ref.current.offsetHeight;
        if (width > 0 || height > 0) {
          setSize({ width, height });
        }
      }
      
      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
          observerRef.current = null;
        }
      };
    } catch (error) {
      if (onError) {
        onError(error);
      } else {
        console.warn('Failed to create resize observer', error);
      }
      return () => {};
    }
  }, [disabled, handleResize]);
  
  // Return object with ref and size information
  return {
    ref,
    size,
    width: size.width,
    height: size.height
  };
}