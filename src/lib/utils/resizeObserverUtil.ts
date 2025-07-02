/**
 * Improved ResizeObserver utilities for ReactFlow stability
 */

/**
 * Creates a stable ResizeObserver that handles errors gracefully
 * @param callback - Function to call when resize is detected
 */
export function createStableResizeObserver(callback: ResizeObserverCallback): ResizeObserver {
  try {
    return new ResizeObserver((entries, observer) => {
      // Use requestAnimationFrame to avoid layout thrashing
      requestAnimationFrame(() => {
        try {
          // Ensure elements still exist in DOM before calling callback
          if (entries.length > 0 && document.body.contains(entries[0].target)) {
            callback(entries, observer);
          }
        } catch (e) {
          // Silent error handling to prevent console errors
          console.debug('ResizeObserver callback error (suppressed)');
        }
      });
    });
  } catch (e) {
    console.warn('ResizeObserver creation failed, using fallback');
    // Return no-op observer as fallback
    return {
      observe: () => {},
      unobserve: () => {},
      disconnect: () => {}
    } as ResizeObserver;
  }
}

/**
 * Throttles ResizeObserver callback to reduce layout thrashing
 * @param callback - Function to throttle
 * @param delay - Delay in ms between calls
 */
export function throttleResizeObserver<T extends (...args: any[]) => void>(
  callback: T,
  delay: number = 100
): (...args: Parameters<T>) => void {
  let lastCallTime = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;
    
    // Clear any pending timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    
    if (timeSinceLastCall >= delay) {
      // Enough time has passed, call immediately
      lastCallTime = now;
      callback(...args);
    } else {
      // Schedule for later with remaining time
      timeoutId = setTimeout(() => {
        lastCallTime = Date.now();
        callback(...args);
      }, delay - timeSinceLastCall);
    }
  };
}

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