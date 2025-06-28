/**
 * Utilities to handle ResizeObserver errors and optimizations
 */

/**
 * Set up error handling for ResizeObserver loop limit errors
 * This prevents console errors when ResizeObserver callbacks take too long
 * or trigger layout shifts that cause additional resize observations
 */
export function setupResizeObserverErrorHandling() {
  // Only run in browser environment
  if (typeof window === 'undefined') return;

  // Check if the error event listener has already been added
  if ((window as any).__resizeObserverErrorHandlerAdded) return;
  
  // Add error event listener specifically for ResizeObserver errors
  window.addEventListener('error', (e) => {
    if (
      e.message === 'ResizeObserver loop limit exceeded' || 
      e.message === 'ResizeObserver loop completed with undelivered notifications.'
    ) {
      // Prevent the error from appearing in console
      e.stopImmediatePropagation();
      // This is a benign error that doesn't need user notification
    }
  });

  // Mark that we've added the handler
  (window as any).__resizeObserverErrorHandlerAdded = true;
}

/**
 * Create a debounced resize observer to prevent excessive callbacks
 * @param callback Function to call when resize is detected
 * @param delay Debounce delay in ms
 * @returns ResizeObserver instance
 */
export function createDebouncedResizeObserver(
  callback: ResizeObserverCallback,
  delay: number = 250
): ResizeObserver {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  const debouncedCallback: ResizeObserverCallback = (entries, observer) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      try {
        callback(entries, observer);
      } catch (error) {
        console.log('Resize observer error prevented:', error);
      }
      timeoutId = null;
    }, delay);
  };
  
  return new ResizeObserver(debouncedCallback);
}