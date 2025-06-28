import { useEffect, useRef } from 'react';
import { createStableResizeObserver } from '../utils/stableResizeObserver';

/**
 * React hook for safely observing element resizes
 * Uses our buffered, error-resistant approach to prevent ResizeObserver loops
 * 
 * @param callback Function to call when the element resizes
 * @param elementRef React ref to the element to observe
 * @param options Options for the resize observer
 */
export function useResizeObserver(
  callback: (entry: ResizeObserverEntry) => void,
  elementRef: React.RefObject<Element>,
  options?: {
    debounce?: number;
    disabled?: boolean;
  }
) {
  // Keep track of the latest callback
  const callbackRef = useRef(callback);
  
  // Update ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Set up the resize observer
  useEffect(() => {
    // Skip if disabled or no element
    if (options?.disabled || !elementRef.current) {
      return;
    }

    // Track whether we've set up error recovery
    let hasSetupErrorRecovery = false;
    let isActive = true;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    
    // Create buffered observer with error handling
    const observer = createStableResizeObserver(entries => {
      if (!isActive) return;
      
      // Clear any existing debounce timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      
      // Debounce the callback for performance
      const delay = options?.debounce || 0;
      
      if (delay > 0) {
        debounceTimer = setTimeout(() => {
          if (entries[0] && isActive) {
            callbackRef.current(entries[0]);
          }
        }, delay);
      } else {
        // Call immediately if no debounce
        if (entries[0] && isActive) {
          callbackRef.current(entries[0]);
        }
      }
    });

    // Set up error handling specific to this observer
    const handleResizeError = () => {
      if (!hasSetupErrorRecovery && isActive) {
        hasSetupErrorRecovery = true;
        
        // Temporarily disable observer
        isActive = false;
        observer.disconnect();
        
        // Re-enable after a cooldown period
        setTimeout(() => {
          if (elementRef.current) {
            try {
              isActive = true;
              observer.observe(elementRef.current);
            } catch (e) {
              // Silent fail - don't break the app
            }
          }
        }, 1000);
      }
    };

    try {
      // Start observing
      observer.observe(elementRef.current);
      
      // Listen for ResizeObserver errors
      const errorHandler = (event: ErrorEvent) => {
        if (event.message?.includes('ResizeObserver')) {
          handleResizeError();
        }
      };
      
      window.addEventListener('error', errorHandler);
      
      // Clean up
      return () => {
        window.removeEventListener('error', errorHandler);
        observer.disconnect();
        isActive = false;
        
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
      };
    } catch (e) {
      // Fallback to simple polling if ResizeObserver fails
      console.warn('ResizeObserver setup failed (handled)');
      
      // Use polling as fallback
      let element = elementRef.current;
      let lastWidth = element?.clientWidth || 0;
      let lastHeight = element?.clientHeight || 0;
      
      const intervalId = setInterval(() => {
        if (!element || !isActive) return;
        
        const newWidth = element.clientWidth;
        const newHeight = element.clientHeight;
        
        if (newWidth !== lastWidth || newHeight !== lastHeight) {
          lastWidth = newWidth;
          lastHeight = newHeight;
          
          // Create a minimal entry-like object
          const entry = {
            target: element,
            contentRect: {
              width: newWidth,
              height: newHeight,
              x: 0,
              y: 0,
              top: 0,
              right: newWidth,
              bottom: newHeight,
              left: 0
            }
          } as unknown as ResizeObserverEntry;
          
          callbackRef.current(entry);
        }
      }, 1000);
      
      return () => clearInterval(intervalId);
    }
  }, [elementRef, options?.debounce, options?.disabled]);
}