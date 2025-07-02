/**
 * Utility functions for handling ResizeObserver-related errors and optimizations
 */

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
  
  // Create a stable version of ResizeObserver that suppresses errors
  const createStableResizeObserver = (callback: ResizeObserverCallback): ResizeObserver => {
    try {
      return new ResizeObserver((entries, observer) => {
        try {
          callback(entries, observer);
        } catch (e) {
          console.error('Error in ResizeObserver callback:', e);
        }
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
  
  // Improved throttling function for resize events
  const throttle = (fn: Function, delay: number) => {
    let lastCall = 0;
    let timeout: number | null = null;
    
    return (...args: any[]) => {
      const now = Date.now();
      
      if (now - lastCall < delay) {
        if (timeout) clearTimeout(timeout);
        timeout = window.setTimeout(() => {
          lastCall = now;
          fn(...args);
        }, delay);
      } else {
        lastCall = now;
        fn(...args);
      }
    };
  };
  
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
        const stabilizeFlow = throttle(() => {
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
        }, 500);
        
        // Apply stabilization
        stabilizeFlow();
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

/**
 * Disables problematic ResizeObserver instances if they're causing repeated errors
 */
export const disableResizeObserverIfProblematic = () => {
  // Apply only in emergency situations - this is a last resort
  const rfElements = document.querySelectorAll('.react-flow, [data-flow], .flow-container');
  
  rfElements.forEach(el => {
    if (el instanceof HTMLElement) {
      // Mark as having problematic observers
      el.dataset.observerDisabled = 'true';
      
      // Force stable dimensions
      el.style.height = `${el.offsetHeight || 400}px`;
      el.style.width = `${el.offsetWidth || 600}px`;
      el.style.overflow = 'visible';
      
      // Apply containment optimizations
      el.style.contain = 'layout size';
      el.style.willChange = 'transform';
    }
  });
  
  // Force a reflow
  document.body.style.opacity = '0.99';
  setTimeout(() => {
    document.body.style.opacity = '1';
  }, 0);
};