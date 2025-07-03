/**
 * Utilities for stable ResizeObserver handling
 */

/**
 * Creates a stable resize observer that avoids common issues
 */
export function createStableResizeObserver(
  callback: (entries: ResizeObserverEntry[]) => void, 
  options: { 
    throttleMs?: number,
    debounceMs?: number,
    errorLimit?: number
  } = {}
): ResizeObserver {
  const { throttleMs = 100, debounceMs = 300, errorLimit = 3 } = options;
  
  // Keep track of the last time we processed a resize event
  let lastProcessTime = 0;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let errorCount = 0;
  
  // Create a function that handles both throttling and debouncing
  const processEntries = (entries: ResizeObserverEntry[]) => {
    // Throttle logic
    const now = Date.now();
    const timeSinceLast = now - lastProcessTime;
    
    if (timeSinceLast < throttleMs) {
      // Skip this update due to throttling
      return;
    }
    
    // Clear any existing debounce timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    
    // Set up debounce timer
    debounceTimer = setTimeout(() => {
      lastProcessTime = Date.now();
      
      try {
        callback(entries);
      } catch (error) {
        errorCount++;
        
        if (errorCount < errorLimit) {
          console.warn('Error in resize observer callback (suppressed):', error);
        }
      }
      
      debounceTimer = null;
    }, debounceMs);
  };
  
  // Create the actual observer with error handling
  try {
    return new ResizeObserver((entries) => {
      requestAnimationFrame(() => {
        processEntries(entries);
      });
    });
  } catch (error) {
    console.warn('Error creating ResizeObserver, providing fallback implementation');
    
    // Return a dummy observer that does nothing
    return {
      observe: () => {},
      unobserve: () => {},
      disconnect: () => {}
    } as ResizeObserver;
  }
}

/**
 * Setup improved error handling for ResizeObserver loops
 */
export function setupResizeObserverErrorHandling() {
  // Add global error handler for ResizeObserver errors
  const handleError = (event: ErrorEvent) => {
    if (event.message && (
      event.message.includes('ResizeObserver loop') || 
      event.message.includes('ResizeObserver completed with undelivered notifications')
    )) {
      // Prevent the error from propagating
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  };
  
  window.addEventListener('error', handleError, true);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('error', handleError, true);
  };
}

/**
 * Throttle resize observer updates to prevent excessive rendering
 */
export function throttleResizeObserver(callback: () => void, delay: number = 150) {
  let lastExecution = 0;
  
  return () => {
    const now = Date.now();
    const timeSinceLastExecution = now - lastExecution;
    
    if (timeSinceLastExecution >= delay) {
      lastExecution = now;
      callback();
    }
  };
}

/**
 * Disable problematic resize observers if they cause too many errors
 */
export function disableResizeObserverIfProblematic() {
  if (!window.__resizeObserverErrorCount) {
    window.__resizeObserverErrorCount = 0;
  }
  
  window.__resizeObserverErrorCount++;
  
  // If we're getting too many errors, try to fix the issue
  if (window.__resizeObserverErrorCount > 10) {
    // Apply fix for ReactFlow elements
    document.querySelectorAll('.react-flow__container, .react-flow__renderer, .react-flow').forEach(el => {
      if (el instanceof HTMLElement) {
        // Force hardware acceleration with better compositing
        el.style.transform = 'translateZ(0)';
        el.style.contain = 'layout paint';
        
        // Set explicit height to prevent layout shifts
        if (el.offsetHeight < 10) {
          el.style.height = '300px';
        }
      }
    });
    
    // Reset counter after applying fixes
    window.__resizeObserverErrorCount = 0;
  }
}

// Add type declaration for global variables
declare global {
  interface Window {
    __resizeObserverErrorCount?: number;
  }
}