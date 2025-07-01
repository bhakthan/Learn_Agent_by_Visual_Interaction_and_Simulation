/**
 * Setup error handling for ResizeObserver to prevent unhandled errors
 */
export const setupResizeObserverErrorHandling = () => {
  // Track errors to limit how often we apply fixes
  const errorCounts = {
    count: 0,
    lastError: 0,
    throttled: false,
    recovering: false
  };

  // Store original ResizeObserver to restore it later if needed
  const OriginalResizeObserver = window.ResizeObserver;
  
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
    
    // Apply fixes with progressive strategy based on error frequency
    if (errorCounts.count > 2 && !errorCounts.throttled) {
      errorCounts.throttled = true;
      
      // Apply immediate RAF for smoother handling
      requestAnimationFrame(() => {
        try {
          // Disable any active ResizeObservers temporarily
          if (errorCounts.count > 5 && !errorCounts.recovering) {
            errorCounts.recovering = true;
            
            // Force stabilize ReactFlow components
            document.querySelectorAll('.react-flow__viewport, .react-flow__container, .react-flow, [data-reactflow]').forEach(el => {
              if (el instanceof HTMLElement) {
                // Apply hardware acceleration and set explicit size
                el.style.transform = 'translateZ(0)';
                el.style.webkitBackfaceVisibility = 'hidden';
                el.style.contain = 'layout paint';
                
                // Ensure elements have valid dimensions to prevent ResizeObserver loops
                const parent = el.parentElement;
                if (parent && parent.offsetHeight > 20 && (!el.style.height || el.offsetHeight < 20)) {
                  el.style.height = `${parent.offsetHeight}px`;
                } else if (!el.style.height || el.offsetHeight < 20) {
                  el.style.height = '400px';
                }
              }
            });
            
            // Force layout recalculation with minimal reflow
            document.body.style.opacity = '0.99';
            setTimeout(() => {
              document.body.style.opacity = '1';
              
              // Reset recovery mode after delay
              setTimeout(() => {
                errorCounts.recovering = false;
              }, 2000);
            }, 50);
          }
          
          // Reset throttling after delay
          setTimeout(() => {
            errorCounts.throttled = false;
            errorCounts.count = Math.max(0, errorCounts.count - 2);
          }, 2000);
        } catch (e) {
          // Silent recovery with automatic reset
          setTimeout(() => {
            errorCounts.throttled = false;
            errorCounts.recovering = false;
          }, 3000);
        }
      });
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
      args[0].includes('undelivered notifications') ||
      args[0].includes('ResizeObserver completed') ||
      args[0].includes('ResizeObserver')
    )) {
      return handleResizeObserverError(args[0]);
    }
    
    // Pass through all other errors
    return originalError.apply(console, args);
  };
  
  // Add global error handler for uncaught errors with better matching
  window.addEventListener('error', (e) => {
    if (e.message && (
      e.message.includes('ResizeObserver loop') || 
      e.message.includes('ResizeObserver completed') ||
      e.message.includes('undelivered notifications') ||
      e.message.includes('ResizeObserver')
    )) {
      e.preventDefault();
      e.stopPropagation();
      handleResizeObserverError(e.message);
      return false;
    }
  }, true);
};

/**
 * Creates a stable resize observer that won't crash with loop errors
 */
export const createStableResizeObserver = (callback: ResizeObserverCallback): ResizeObserver => {
  let isHandlingResize = false;
  let lastCallTime = 0;
  const throttleTime = 150; // ms between calls
  let pendingEntries: ResizeObserverEntry[] = [];
  let rafId: number | null = null;
  
  // Create wrapper callback with enhanced stability
  const stableCallback: ResizeObserverCallback = (entries, observer) => {
    const now = Date.now();
    
    // Store entries for throttled processing
    pendingEntries = [...pendingEntries, ...entries];
    
    // Don't process if we're throttling or already handling
    if (isHandlingResize || now - lastCallTime < throttleTime) {
      if (!rafId) {
        // Schedule processing
        rafId = requestAnimationFrame(() => {
          rafId = null;
          processEntries();
        });
      }
      return;
    }
    
    processEntries();
  };
  
  const processEntries = () => {
    if (isHandlingResize || pendingEntries.length === 0) return;
    
    isHandlingResize = true;
    lastCallTime = Date.now();
    
    try {
      // Use the most recent entries and clear the queue
      const entriesToProcess = pendingEntries;
      pendingEntries = [];
      
      // Call the original callback
      callback(entriesToProcess, observer);
    } catch (err) {
      console.warn('Error in ResizeObserver callback', err);
    } finally {
      // Reset handling flag with a small delay to prevent rapid recalculations
      setTimeout(() => {
        isHandlingResize = false;
        
        // If we have more entries waiting, process them
        if (pendingEntries.length > 0) {
          requestAnimationFrame(() => processEntries());
        }
      }, 100);
    }
  };
  
  // Create observer with our stabilized callback
  const observer = new ResizeObserver(stableCallback);
  
  return observer;
};

/**
 * Utility to create a stable element resize handler with automatic cleanup
 */
export const useStableResizeObserver = (
  element: Element | null, 
  handler: (entry: ResizeObserverEntry) => void,
  options?: ResizeObserverOptions
): () => void => {
  if (!element) return () => {}; // No-op if no element
  
  // Create stable observer
  const observer = createStableResizeObserver((entries) => {
    // Only call handler for matching element
    const entry = entries.find(e => e.target === element);
    if (entry) {
      handler(entry);
    }
  });
  
  // Start observing
  observer.observe(element, options);
  
  // Return disconnect function for cleanup
  return () => observer.disconnect();
};

/**
 * Resets rendering for ReactFlow components to fix visual glitches
 */
export const resetReactFlowRendering = (containerRef: React.RefObject<HTMLElement>) => {
  if (!containerRef.current) return;
  
  // Use RAF for smoother handling
  requestAnimationFrame(() => {
    try {
      const container = containerRef.current;
      if (!container) return;
      
      // Temporarily force a reflow by toggling a style
      container.style.transform = 'translateZ(0)';
      
      // Schedule style removal after reflow
      requestAnimationFrame(() => {
        // Trigger another reflow
        container.style.opacity = '0.99';
        
        requestAnimationFrame(() => {
          // Clean up
          container.style.opacity = '';
          
          // Dispatch an event that can be listened for to handle post-render actions
          container.dispatchEvent(new CustomEvent('flow-render-reset', { 
            bubbles: true,
            detail: { timestamp: Date.now() }
          }));
        });
      });
    } catch (e) {
      // Silent recovery - don't break the app if this fails
    }
  });
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