/**
 * Utilities for handling ResizeObserver-related issues
 */

/**
 * Setup error handling for ResizeObserver to prevent crashes
 */
export function setupResizeObserverErrorHandling() {
  // Track error frequency for adaptive handling
  let errorCount = 0;
  let lastErrorTime = 0;
  let recoveryScheduled = false;

  // Implement the error handler
  const handleResizeObserverError = () => {
    const now = Date.now();
    
    // Track error frequency
    if (now - lastErrorTime > 5000) {
      // Reset counter after 5 seconds of no errors
      errorCount = 1;
    } else {
      errorCount++;
    }
    
    lastErrorTime = now;
    
    // Apply increasingly aggressive fixes based on error frequency
    if (errorCount > 3 && !recoveryScheduled) {
      recoveryScheduled = true;
      
      // Apply stabilization with progressive delays
      const applyStabilization = (attempt = 1) => {
        setTimeout(() => {
          try {
            // Apply fixes to ReactFlow elements
            document.querySelectorAll('.react-flow, .react-flow__container, .react-flow__viewport').forEach(el => {
              if (el instanceof HTMLElement) {
                // Force hardware acceleration
                el.style.transform = 'translateZ(0)';
                el.style.backfaceVisibility = 'hidden';
                
                // Set explicit size when missing
                const parent = el.parentElement;
                if (parent && parent.offsetHeight > 10 && (!el.style.height || el.offsetHeight < 10)) {
                  el.style.height = `${parent.offsetHeight}px`;
                } else if (!el.style.height || el.offsetHeight < 10) {
                  el.style.height = '300px';
                }
              }
            });
            
            // Force layout recalculation
            document.body.style.opacity = '0.99';
            setTimeout(() => {
              document.body.style.opacity = '1';
            }, 50);
            
            // Reset state with exponential backoff for repeated errors
            setTimeout(() => {
              recoveryScheduled = false;
              
              // Reduce error count after successful recovery
              if (attempt >= 2) {
                errorCount = Math.max(0, errorCount - 2);
              }
            }, Math.min(1000 * attempt, 5000));
            
          } catch (e) {
            recoveryScheduled = false;
          }
        }, Math.min(200 * Math.pow(1.5, attempt), 2000));
      };
      
      applyStabilization();
    }
    
    return true;
  };

  // Override console.error to intercept ResizeObserver messages
  const originalConsoleError = console.error;
  console.error = function(msg: any, ...args: any[]) {
    if (typeof msg === 'string' && 
        (msg.includes('ResizeObserver loop') || 
        msg.includes('ResizeObserver was created') ||
        msg.includes('undelivered notifications') ||
        msg.includes('ResizeObserver completed'))) {
      handleResizeObserverError();
      return;
    }
    
    return originalConsoleError.apply(console, [msg, ...args]);
  };

  // Add global error handler for ResizeObserver errors
  window.addEventListener('error', function(e) {
    if (e && e.message && (
      e.message.includes('ResizeObserver loop') || 
      e.message.includes('ResizeObserver completed') ||
      e.message.includes('undelivered notifications')
    )) {
      e.preventDefault();
      e.stopPropagation();
      handleResizeObserverError();
      return false;
    }
  }, true);
}

/**
 * Creates a stable resize observer that handles errors and prevents loops
 */
export function createStableResizeObserver(
  callback: ResizeObserverCallback,
  options: { debounce?: number; disabled?: boolean } = {}
): ResizeObserver {
  const { debounce = 200, disabled = false } = options;
  
  if (disabled) {
    // Return a no-op observer when disabled
    return {
      observe: () => {},
      unobserve: () => {},
      disconnect: () => {}
    } as ResizeObserver;
  }
  
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let entries: ResizeObserverEntry[] = [];
  let isProcessing = false;
  let lastProcessTime = 0;
  
  const safeCallback: ResizeObserverCallback = (newEntries, observer) => {
    try {
      // Reset state if significant time has passed
      const now = Date.now();
      if (now - lastProcessTime > 5000) {
        entries = [];
        if (timeout) clearTimeout(timeout);
        timeout = null;
        isProcessing = false;
      }
      
      // If already processing, just store entries
      if (isProcessing) {
        entries = [...entries, ...newEntries];
        return;
      }
      
      // Store entries for batched processing
      entries = [...entries, ...newEntries];
      
      // Clear existing timeout
      if (timeout) clearTimeout(timeout);
      
      // Set processing flag to avoid concurrent processing
      isProcessing = true;
      
      // Debounce processing
      timeout = setTimeout(() => {
        try {
          // Process in animation frame for smoother handling
          requestAnimationFrame(() => {
            try {
              callback(entries, observer);
            } catch (error) {
              console.warn('Error in ResizeObserver callback', error);
            } finally {
              // Reset state
              entries = [];
              isProcessing = false;
              lastProcessTime = Date.now();
              timeout = null;
            }
          });
        } catch (error) {
          // Reset state on error
          isProcessing = false;
          entries = [];
        }
      }, debounce);
      
    } catch (error) {
      // Reset on unexpected error
      isProcessing = false;
      entries = [];
      if (timeout) clearTimeout(timeout);
    }
  };

  // Create the observer with our safe callback
  try {
    return new ResizeObserver(safeCallback);
  } catch (error) {
    // Fallback to a no-op observer
    console.warn('Failed to create ResizeObserver, using no-op fallback');
    return {
      observe: () => {},
      unobserve: () => {},
      disconnect: () => {}
    } as ResizeObserver;
  }
}

/**
 * Disables problematic ResizeObserver instances if too many errors occur
 */
export function disableResizeObserverIfProblematic() {
  // Track problematic observers (simplified implementation)
  const errorCount = (window as any).__resizeObserverErrorCount || 0;
  (window as any).__resizeObserverErrorCount = errorCount + 1;
  
  // Disable if too many errors
  if (errorCount > 10) {
    console.warn('Too many ResizeObserver errors, applying emergency fixes');
    
    // Apply global flag to signal components to stop using ResizeObserver
    (window as any).__disableResizeObservers = true;
    
    // Fix layout issues by directly setting explicit heights
    document.querySelectorAll('.react-flow, .react-flow__container, .react-flow__viewport').forEach(el => {
      if (el instanceof HTMLElement) {
        const parent = el.parentElement;
        if (parent && parent.offsetHeight > 10) {
          el.style.height = `${parent.offsetHeight}px`;
        }
      }
    });
  }
}