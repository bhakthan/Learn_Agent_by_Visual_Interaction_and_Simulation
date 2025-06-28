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
  
  // Track if we're in a ResizeObserver callback to prevent loops
  let inResizeObserverCallback = false;
  let pendingResizeObserverErrors = 0;
  let lastResizeErrorTime = 0;
  
  // Add error event listener specifically for ResizeObserver errors
  window.addEventListener('error', (e) => {
    if (
      e.message === 'ResizeObserver loop limit exceeded' || 
      e.message.includes('ResizeObserver loop completed with undelivered notifications')
    ) {
      // Prevent the error from appearing in console
      e.stopImmediatePropagation();
      e.preventDefault();
      
      const now = Date.now();
      
      // Track how many errors we've suppressed in a row
      pendingResizeObserverErrors++;
      
      // If we're seeing a cascade of errors or frequent errors, add progressively longer delays
      if (pendingResizeObserverErrors > 3 || (now - lastResizeErrorTime < 300)) {
        pendingResizeObserverErrors = 0;
        lastResizeErrorTime = now;
        
        // Force a repaint with increasingly longer delays to break the cycle
        const delay = Math.min(pendingResizeObserverErrors * 50, 500);
        document.body.style.visibility = 'hidden';
        
        setTimeout(() => {
          document.body.style.visibility = '';
          
          // Schedule multiple RAF cycles to ensure layout is complete
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              // Empty function to force a complete layout cycle
            });
          });
        }, delay);
      }
      
      lastResizeErrorTime = now;
      return false;
    }
  }, true);

  // Patch ResizeObserver to throttle notifications if needed
  const OriginalResizeObserver = window.ResizeObserver;
  if (OriginalResizeObserver && typeof OriginalResizeObserver === 'function') {
    window.ResizeObserver = class EnhancedResizeObserver extends OriginalResizeObserver {
      private observerCallbackTimeout: ReturnType<typeof setTimeout> | null = null;
      private lastCallbackTime: number = 0;
      private pendingEntries: ResizeObserverEntry[] = [];
      private currentRAF: number | null = null;
      
      constructor(callback: ResizeObserverCallback) {
        // Create a wrapped callback with additional safety measures
        const safeCallback: ResizeObserverCallback = (entries, observer) => {
          const now = Date.now();
          
          // Update pending entries with latest values
          this.pendingEntries = entries;
          
          // If we're already in a callback or called recently, throttle
          if (inResizeObserverCallback || (now - this.lastCallbackTime < 50)) {
            // Cancel any existing timeouts/animations
            if (this.observerCallbackTimeout) {
              clearTimeout(this.observerCallbackTimeout);
            }
            
            if (this.currentRAF) {
              cancelAnimationFrame(this.currentRAF);
            }
            
            // Schedule for later with increasing delay based on frequency
            const delay = Math.min(100, Math.max(16, now - this.lastCallbackTime));
            
            this.observerCallbackTimeout = setTimeout(() => {
              // Use RAF to ensure we're in a good spot in the render cycle
              this.currentRAF = requestAnimationFrame(() => {
                try {
                  const entriesCopy = [...this.pendingEntries]; // Create a copy of entries
                  this.pendingEntries = []; // Clear pending entries
                  
                  inResizeObserverCallback = true;
                  this.lastCallbackTime = Date.now();
                  callback(entriesCopy, observer);
                } catch (error) {
                  // Silently handle errors in callback
                } finally {
                  inResizeObserverCallback = false;
                  this.currentRAF = null;
                  this.observerCallbackTimeout = null;
                }
              });
            }, delay);
            return;
          }
          
          try {
            inResizeObserverCallback = true;
            this.lastCallbackTime = now;
            callback(entries, observer);
          } catch (error) {
            // Silently handle errors in callback
          } finally {
            inResizeObserverCallback = false;
          }
        };
        
        super(safeCallback);
      }
      
      // Override disconnect to clean up resources
      disconnect() {
        if (this.observerCallbackTimeout) {
          clearTimeout(this.observerCallbackTimeout);
        }
        if (this.currentRAF) {
          cancelAnimationFrame(this.currentRAF);
        }
        super.disconnect();
      }
    } as any;

    // Copy over static properties
    Object.keys(OriginalResizeObserver).forEach(key => {
      (window.ResizeObserver as any)[key] = (OriginalResizeObserver as any)[key];
    });
  }
  
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
  let hasActiveResize = false;
  
  const debouncedCallback: ResizeObserverCallback = (entries, observer) => {
    // Store the latest entries
    latestEntries = entries;
    
    // Mark that we're in an active resize
    hasActiveResize = true;
    
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
          hasActiveResize = false;
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
  limit: number = 100
): ResizeObserver {
  let lastRun = 0;
  let rafId: number | null = null;
  let latestEntries: ResizeObserverEntry[] = [];
  let isProcessing = false;
  
  const throttledCallback: ResizeObserverCallback = (entries, observer) => {
    // Skip if already processing to avoid loops
    if (isProcessing) return;
    
    // Always store the latest entries
    latestEntries = entries;
    
    const now = Date.now();
    
    // If enough time has passed since last run
    if (now - lastRun >= limit) {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      
      isProcessing = true;
      
      rafId = requestAnimationFrame(() => {
        try {
          // Use double RAF for smoother transitions
          requestAnimationFrame(() => {
            try {
              callback(latestEntries, observer);
            } finally {
              lastRun = Date.now();
              isProcessing = false;
            }
          });
        } catch (error) {
          console.log('Resize observer error prevented:', error);
          isProcessing = false;
        } finally {
          rafId = null;
        }
      });
    }
  };
  
  return new ResizeObserver(throttledCallback);
}