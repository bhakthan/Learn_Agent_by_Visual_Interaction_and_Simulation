/**
 * Utility functions for handling ResizeObserver-related errors and optimizations
 */

/**
 * Creates a stable ResizeObserver that doesn't throw loop errors
 */
export const createStableResizeObserver = (callback: ResizeObserverCallback): ResizeObserver => {
  try {
    return new ResizeObserver((entries, observer) => {
      // Use requestAnimationFrame to avoid synchronous layout triggers
      window.requestAnimationFrame(() => {
        try {
          // Check if we're still in a valid state to execute callback
          if (entries.length && document.body.contains(entries[0]?.target as Element)) {
            callback(entries, observer);
          }
        } catch (e) {
          console.error('Error in ResizeObserver callback:', e);
        }
      });
    });
  } catch (e) {
    console.error('Error creating ResizeObserver:', e);
    // Return a dummy observer if creation fails
    return {
      observe: () => {},
      unobserve: () => {},
      disconnect: () => {},
    } as ResizeObserver;
  }
};

/**
 * Throttle function for ResizeObserver callbacks
 */
export const throttleResizeObserver = (callback: Function, delay: number = 100) => {
  let lastCall = 0;
  let timeout: number | null = null;
  
  return (...args: any[]) => {
    const now = Date.now();
    
    if (now - lastCall < delay) {
      if (timeout) clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        lastCall = now;
        callback(...args);
      }, delay);
    } else {
      lastCall = now;
      callback(...args);
    }
  };
};

/**
 * Creates a stable resize detector that works around ResizeObserver issues
 * @param element - Element to observe
 * @param callback - Function to call on resize
 * @param options - Configuration options
 */
export function createStableResizeDetector(
  element: HTMLElement,
  callback: () => void,
  options: { 
    throttle?: number;
    useRAF?: boolean;
    disconnectOnError?: boolean;
  } = {}
): () => void {
  // Default options
  const {
    throttle = 100,
    useRAF = true,
    disconnectOnError = true
  } = options;
  
  // Error counter to help disable problematic observers
  let errorCount = 0;
  
  // Throttled callback
  const throttledCallback = throttleResizeObserver(() => {
    if (useRAF) {
      requestAnimationFrame(callback);
    } else {
      callback();
    }
  }, throttle);
  
  // Create stable observer
  const observer = createStableResizeObserver((entries) => {
    try {
      throttledCallback();
    } catch (e) {
      errorCount++;
      console.debug('Resize detector error (suppressed)');
      
      // Disconnect if we're encountering repeated errors
      if (disconnectOnError && errorCount > 3) {
        try {
          observer.disconnect();
        } catch (err) {
          // Silent handling
        }
      }
    }
  });
  
  // Start observing
  try {
    observer.observe(element);
  } catch (e) {
    console.warn('Failed to observe element', e);
  }
  
  // Return cleanup function
  return () => {
    try {
      observer.disconnect();
    } catch (e) {
      // Silent cleanup error handling
    }
  };
}

/**
 * Sets up global error handling for ResizeObserver errors
 */
export const setupResizeObserverErrorHandling = () => {
  // Only run in browser environment
  if (typeof window === 'undefined') return;
  
  // Track error counts to apply adaptive solutions
  let errorCount = 0;
  let lastErrorTime = 0;
  let recoveryInProgress = false;
  
  // Handle ResizeObserver errors specifically
  const handleResizeObserverError = (e: Event | string) => {
    const errorMsg = typeof e === 'string' ? e : (e as any).message || '';
    
    if (
      errorMsg.includes('ResizeObserver') || 
      errorMsg.includes('loop') ||
      errorMsg.includes('undelivered notifications')
    ) {
      // Track errors for adaptive handling
      const now = Date.now();
      errorCount++;
      
      // If we're getting lots of errors in a short time, be more aggressive in recovery
      if (now - lastErrorTime < 2000 && errorCount > 3 && !recoveryInProgress) {
        recoveryInProgress = true;
        
        // Throttled recovery function
        const stabilizeFlow = () => {
          // Find and stabilize ReactFlow elements
          document.querySelectorAll('.react-flow, .react-flow__container, .react-flow__viewport').forEach(el => {
            if (el instanceof HTMLElement) {
              // Apply stabilization techniques
              el.style.transform = 'translateZ(0)';
              el.style.backfaceVisibility = 'hidden';
              
              // Ensure elements have reasonable sizes
              const parent = el.parentElement;
              if (parent && parent.offsetHeight > 10 && (!el.style.height || el.offsetHeight < 10)) {
                el.style.height = `${parent.offsetHeight}px`;
              } else if (!el.style.height || el.offsetHeight < 10) {
                el.style.height = '300px';
              }
            }
          });
          
          // Reset recovery state after a delay
          setTimeout(() => {
            recoveryInProgress = false;
            errorCount = Math.max(0, errorCount - 2);
          }, 2000);
        };
        
        // Apply stabilization
        requestAnimationFrame(stabilizeFlow);
      }
      
      lastErrorTime = now;
      return true;
    }
    return false;
  };
  
  // Intercept console errors
  const originalConsoleError = console.error;
  console.error = function(msg, ...args) {
    if (typeof msg === 'string' && handleResizeObserverError(msg)) {
      return; // Suppress error
    }
    
    // Pass through other errors
    return originalConsoleError.apply(console, [msg, ...args]);
  };
  
  // Add global error event listener
  window.addEventListener('error', (e) => {
    if (e.message && handleResizeObserverError(e.message)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, true);
};