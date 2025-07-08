/**
 * Utilities to handle ResizeObserver errors and improve visualization stability
 */

/**
 * Set up error handling for ResizeObserver loops
 */
export const setupResizeObserverErrorHandling = () => {
  // Track error state
  let errorCount = 0;
  let lastErrorTime = 0;
  let recoveryScheduled = false;

  // Create window-level error handler
  const handleError = (event: ErrorEvent | Event) => {
    if (
      event instanceof ErrorEvent &&
      event.message &&
      (
        event.message.includes('ResizeObserver') ||
        event.message.includes('loop') ||
        event.message.includes('undelivered notifications')
      )
    ) {
      // Track error frequency
      const now = Date.now();
      if (now - lastErrorTime > 5000) {
        errorCount = 0;
      }
      
      errorCount++;
      lastErrorTime = now;
      
      // Apply recovery if errors are frequent
      if (errorCount > 2 && !recoveryScheduled) {
        recoveryScheduled = true;
        
        setTimeout(() => {
          // Force repaint with RAF for smoother handling
          requestAnimationFrame(() => {
            document.querySelectorAll('.react-flow, .react-flow__container').forEach(el => {
              if (el instanceof HTMLElement) {
                el.style.transform = 'translateZ(0)';
                el.style.contain = 'layout paint';
              }
            });
          });
          
          // Reset recovery state
          setTimeout(() => {
            recoveryScheduled = false;
          }, 2000);
        }, 200);
      }
      
      // Prevent error from propagating
      if (event.preventDefault) {
        event.preventDefault();
      }
      if (event.stopPropagation) {
        event.stopPropagation();
      }
      
      return false;
    }
  };

  // Add event listener
  window.addEventListener('error', handleError, true);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('error', handleError, true);
  };
};

/**
 * Disable problematic ResizeObservers if they're causing too many errors
 */
export const disableResizeObserverIfProblematic = () => {
  const errorCount = (window as any).__resizeObserverErrorCount || 0;
  
  // If we've seen multiple errors, try to disable the problematic observers
  if (errorCount > 3) {
    // Apply emergency fixes
    document.querySelectorAll('.react-flow').forEach(el => {
      if (el instanceof HTMLElement) {
        // Force explicit dimensions to prevent layout shifts
        if (!el.style.height || el.offsetHeight < 20) {
          el.style.height = '300px';
        }
        if (!el.style.width || el.offsetWidth < 20) {
          el.style.width = '100%';
        }
      }
    });
    
    // Reset error count to give it a fresh start
    (window as any).__resizeObserverErrorCount = 0;
  }
};

/**
 * Create a stable resize observer that won't trigger loops
 */
export const createStableResizeObserver = (callback: ResizeObserverCallback) => {
  // Track if we're currently processing to prevent loops
  let isProcessing = false;
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  const observer = new ResizeObserver((...args) => {
    // Prevent re-entrancy
    if (isProcessing) return;
    
    isProcessing = true;
    
    // Clear any pending timeout
    if (timeout) clearTimeout(timeout);
    
    // Debounce the callback
    timeout = setTimeout(() => {
      try {
        callback(...args);
      } catch (e) {
        console.warn('Error in resize observer callback', e);
      } finally {
        isProcessing = false;
      }
    }, 100);
  });
  
  return {
    observe: (target: Element) => observer.observe(target),
    unobserve: (target: Element) => observer.unobserve(target),
    disconnect: () => observer.disconnect()
  };
};