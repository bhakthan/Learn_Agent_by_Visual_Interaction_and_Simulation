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
      e.message.includes('ResizeObserver loop completed with undelivered notifications')
    ) {
      // Prevent the error from appearing in console
      e.stopImmediatePropagation();
      // This is a benign error that doesn't need user notification
    }
  });

  // Patch console.error to filter out ResizeObserver warnings
  const originalConsoleError = console.error;
  console.error = function(...args: any[]) {
    // Check if the error is related to ResizeObserver
    if (args.length > 0 && 
        typeof args[0] === 'string' && 
        (args[0].includes('ResizeObserver loop') || 
         args[0].includes('ResizeObserver was created'))) {
      // Suppress these specific errors
      return;
    }
    // Pass through all other errors
    return originalConsoleError.apply(console, args);
  };

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
  let latestEntries: ResizeObserverEntry[] = [];
  let rafId: number | null = null;
  
  const debouncedCallback: ResizeObserverCallback = (entries, observer) => {
    // Store the latest entries
    latestEntries = entries;
    
    // Clear any existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    // Use requestAnimationFrame to sync with browser rendering
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
    
    timeoutId = setTimeout(() => {
      rafId = requestAnimationFrame(() => {
        try {
          // Execute callback with the latest entries
          callback(latestEntries, observer);
        } catch (error) {
          console.log('Resize observer error prevented:', error);
        } finally {
          timeoutId = null;
          rafId = null;
        }
      });
    }, delay);
  };
  
  return new ResizeObserver(debouncedCallback);
}

/**
 * Create a throttled resize observer for high-frequency updates
 * @param callback Function to call when resize is detected
 * @param limit Max frequency in ms
 * @returns ResizeObserver instance
 */
export function createThrottledResizeObserver(
  callback: ResizeObserverCallback,
  limit: number = 60
): ResizeObserver {
  let lastRun = 0;
  let rafId: number | null = null;
  let latestEntries: ResizeObserverEntry[] = [];
  
  const throttledCallback: ResizeObserverCallback = (entries, observer) => {
    // Always store the latest entries
    latestEntries = entries;
    
    const now = Date.now();
    
    // If enough time has passed since last run
    if (now - lastRun >= limit) {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      
      rafId = requestAnimationFrame(() => {
        try {
          callback(latestEntries, observer);
        } catch (error) {
          console.log('Resize observer error prevented:', error);
        } finally {
          lastRun = Date.now();
          rafId = null;
        }
      });
    }
  };
  
  return new ResizeObserver(throttledCallback);
}