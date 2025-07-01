/**
 * Setup error handling for ResizeObserver to prevent unhandled errors
 */
export const setupResizeObserverErrorHandling = () => {
  // Track errors to limit how often we apply fixes
  const errorCounts = {
    count: 0,
    lastError: 0,
    throttled: false,
  };
  
  // Create handler for common ResizeObserver errors
  const handleResizeObserverError = (msg: string) => {
    // Track errors with throttling
    const now = Date.now();
    if (now - errorCounts.lastError > 5000) {
      // Reset counter after 5 seconds
      errorCounts.count = 0;
    }
    
    errorCounts.count++;
    errorCounts.lastError = now;
    
    // Only apply fixes if seeing repeated errors and not already throttled
    if (errorCounts.count > 3 && !errorCounts.throttled) {
      errorCounts.throttled = true;
      
      // Apply fixes
      setTimeout(() => {
        try {
          // Look for elements with size issues
          document.querySelectorAll('.react-flow__viewport, .react-flow__container, .react-flow').forEach(el => {
            if (el instanceof HTMLElement) {
              // Apply hardware acceleration and set explicit size
              el.style.transform = 'translateZ(0)';
              if (!el.style.height || el.offsetHeight < 10) {
                el.style.height = '400px';
              }
            }
          });
          
          // Reset after a delay
          setTimeout(() => {
            errorCounts.throttled = false;
            errorCounts.count = Math.max(0, errorCounts.count - 2);
          }, 2000);
        } catch (e) {
          // Silent recovery
        }
      }, 100);
    }
    
    // Return true to indicate we've handled the error
    return true;
  };
  
  // Override console.error to handle ResizeObserver errors
  const originalError = console.error;
  console.error = function(...args: any[]) {
    // Check if this is a ResizeObserver error
    if (args[0] && typeof args[0] === 'string' && (
      args[0].includes('ResizeObserver loop') || 
      args[0].includes('ResizeObserver was created') ||
      args[0].includes('undelivered notifications')
    )) {
      return handleResizeObserverError(args[0]);
    }
    
    // Pass through all other errors
    return originalError.apply(console, args);
  };
  
  // Add global error handler for uncaught errors
  window.addEventListener('error', (e) => {
    if (e.message && (
      e.message.includes('ResizeObserver loop') || 
      e.message.includes('undelivered notifications')
    )) {
      e.preventDefault();
      e.stopPropagation();
      handleResizeObserverError(e.message);
      return false;
    }
  }, true);
};

/**
 * Create a stable resize observer that handles errors gracefully
 */
export const createStableResizeObserver = (callback: ResizeObserverCallback) => {
  let isHandlingError = false;
  let lastCallTime = 0;
  const MIN_TIME_BETWEEN_CALLS = 100; // ms
  
  const wrappedCallback: ResizeObserverCallback = (entries, observer) => {
    // Throttle calls to avoid too many rapid updates
    const now = Date.now();
    if (now - lastCallTime < MIN_TIME_BETWEEN_CALLS) return;
    lastCallTime = now;
    
    try {
      if (!isHandlingError) {
        callback(entries, observer);
      }
    } catch (e) {
      isHandlingError = true;
      console.warn("Error in ResizeObserver callback, throttling to prevent loop", e);
      
      // Reset after a delay
      setTimeout(() => {
        isHandlingError = false;
      }, 1000);
    }
  };
  
  return new ResizeObserver(wrappedCallback);
};