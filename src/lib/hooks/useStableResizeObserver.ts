import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * A stable version of ResizeObserver that prevents infinite loops
 * and properly handles error cases that might crash the application
 */
export function useStableResizeObserver<T extends HTMLElement = HTMLElement>() {
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const elementRef = useRef<T | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const requestRef = useRef<number | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorCountRef = useRef<number>(0);

  // Clean up all resources
  const cleanup = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    
    if (requestRef.current !== null) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
    
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  // Update dimensions with debounce and RAF for better performance
  const updateDimensions = useCallback(() => {
    if (!elementRef.current) return;

    // Clear existing debounce timer
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce to reduce update frequency
    debounceTimerRef.current = setTimeout(() => {
      // Use requestAnimationFrame for smoother updates
      requestRef.current = requestAnimationFrame(() => {
        try {
          if (!elementRef.current) return;
          
          // Get current dimensions
          const rect = elementRef.current.getBoundingClientRect();
          
          // Only update if dimensions have changed significantly
          setSize(prevSize => {
            const widthDiff = Math.abs(prevSize.width - rect.width);
            const heightDiff = Math.abs(prevSize.height - rect.height);
            
            // Use a threshold to prevent tiny fluctuations
            const CHANGE_THRESHOLD = 2; // pixels
            
            if (widthDiff > CHANGE_THRESHOLD || heightDiff > CHANGE_THRESHOLD) {
              return { width: rect.width, height: rect.height };
            }
            return prevSize;
          });
          
          // Reset error count on successful update
          errorCountRef.current = 0;
        } catch (error) {
          // Track errors and disable observer if too many errors occur
          errorCountRef.current++;
          console.error('Error in ResizeObserver (handled):', error);
          
          if (errorCountRef.current > 3) {
            // Too many errors, disable observer temporarily
            cleanup();
            
            // Try to re-enable after cooling off period
            setTimeout(() => {
              setupObserver();
            }, 2000);
          }
        } finally {
          requestRef.current = null;
          debounceTimerRef.current = null;
        }
      });
    }, 100); // 100ms debounce
  }, [cleanup]);

  // Set up the observer
  const setupObserver = useCallback(() => {
    if (!elementRef.current) return;
    
    // Clean up existing observer
    cleanup();
    
    try {
      // Create new ResizeObserver with error handling
      observerRef.current = new ResizeObserver(() => {
        updateDimensions();
      });
      
      // Start observing
      observerRef.current.observe(elementRef.current, { box: 'border-box' });
      
      // Initial size calculation
      updateDimensions();
      
    } catch (error) {
      console.error('Failed to create ResizeObserver (handled):', error);
      // Fallback to window resize events
      window.addEventListener('resize', updateDimensions);
    }
  }, [cleanup, updateDimensions]);

  // Set up the ref callback
  const ref = useCallback((element: T | null) => {
    elementRef.current = element;
    
    if (element) {
      setupObserver();
    } else {
      cleanup();
    }
  }, [cleanup, setupObserver]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanup();
      window.removeEventListener('resize', updateDimensions);
    };
  }, [cleanup, updateDimensions]);

  return { ref, ...size };
}