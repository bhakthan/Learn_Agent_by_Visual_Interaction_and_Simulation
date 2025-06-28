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
  let isResizeThrottled = false;
  
  // More aggressive error handling for ResizeObserver
  const handleResizeObserverError = (e: ErrorEvent) => {
    if (
      e.message === 'ResizeObserver loop limit exceeded' || 
      e.message.includes('ResizeObserver loop completed with undelivered notifications') ||
      e.message.includes('ResizeObserver loop')
    ) {
      // Prevent the error from appearing in console
      e.stopImmediatePropagation();
      e.preventDefault();
      
      const now = Date.now();
      
      // If we're already throttled, just prevent the error
      if (isResizeThrottled) {
        return false;
      }
      
      // Track how many errors we've suppressed in a row
      pendingResizeObserverErrors++;
      
      // If we're seeing cascading errors, use more aggressive mitigation
      if (pendingResizeObserverErrors > 5 || (now - lastResizeErrorTime < 200)) {
        // Throttle all resize operations
        isResizeThrottled = true;
        
        // Reset counter to prevent escalation
        pendingResizeObserverErrors = 0;
        
        // Last resort: temporarily freeze all ResizeObservers
        if (!(window as any).__originalResizeObserverObserve && window.ResizeObserver) {
          try {
            // Backup original methods
            (window as any).__originalResizeObserverObserve = window.ResizeObserver.prototype.observe;
            (window as any).__originalResizeObserverUnobserve = window.ResizeObserver.prototype.unobserve;
            
            // Replace with no-op methods temporarily
            window.ResizeObserver.prototype.observe = function() { return; };
            window.ResizeObserver.prototype.unobserve = function() { return; };
            
            // Force a style recalculation to flush pending layout changes
            document.body.style.minHeight = document.body.style.minHeight;
            
            // Restore after a meaningful delay
            setTimeout(() => {
              try {
                if ((window as any).__originalResizeObserverObserve) {
                  window.ResizeObserver.prototype.observe = (window as any).__originalResizeObserverObserve;
                  window.ResizeObserver.prototype.unobserve = (window as any).__originalResizeObserverUnobserve;
                  delete (window as any).__originalResizeObserverObserve;
                  delete (window as any).__originalResizeObserverUnobserve;
                }
              } catch (err) {
                // Silent catch - worst case resizes won't work for a while
              } finally {
                isResizeThrottled = false;
              }
            }, 1500); // Increased delay to ensure all animations and transitions complete
          } catch (err) {
            // Silent catch - can't modify ResizeObserver prototype
            isResizeThrottled = false;
          }
        } else {
          // If we can't replace the methods, at least throttle for a while
          setTimeout(() => {
            isResizeThrottled = false;
          }, 1000);
        }
      } else {
        // Standard approach for infrequent errors
        lastResizeErrorTime = now;
        
        // Use RAF to break the loop without causing visible flicker
        requestAnimationFrame(() => {
          // Force a layout calculation
          document.body.getBoundingClientRect();
          
          // Schedule a second RAF to ensure we're in a new cycle
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              // Everything should be stable by now
            });
          });
        });
      }
      
      lastResizeErrorTime = now;
      return false;
    }
  };
  
  // Add the error handler
  window.addEventListener('error', handleResizeObserverError, true);

  // Patch ResizeObserver with a more resilient implementation
  if (window.ResizeObserver && !window.ResizeObserver.__patched) {
    // Store original constructor
    const OriginalResizeObserver = window.ResizeObserver;
    
    window.ResizeObserver = class SafeResizeObserver extends OriginalResizeObserver {
      private throttleTimeout: ReturnType<typeof setTimeout> | null = null;
      private lastProcessTime: number = 0;
      private pendingEntries: ResizeObserverEntry[] = [];
      private frameId: number | null = null;
      private observing: Set<Element> = new Set();
      private static THROTTLE_DELAY = 100; // ms
      
      constructor(originalCallback: ResizeObserverCallback) {
        // Wrap the callback with safety measures
        const safeCallback: ResizeObserverCallback = (entries, observer) => {
          const now = Date.now();
          
          // Add latest entries to pending entries
          this.pendingEntries = entries;
          
          // If called too frequently, throttle
          if (now - this.lastProcessTime < SafeResizeObserver.THROTTLE_DELAY) {
            // Clear existing timeout
            if (this.throttleTimeout) {
              clearTimeout(this.throttleTimeout);
            }
            if (this.frameId) {
              cancelAnimationFrame(this.frameId);
            }
            
            // Schedule for next safe time
            this.throttleTimeout = setTimeout(() => {
              this.frameId = requestAnimationFrame(() => {
                try {
                  this.lastProcessTime = Date.now();
                  originalCallback([...this.pendingEntries], observer);
                  this.pendingEntries = [];
                } catch (e) {
                  // Silent error
                }
                this.throttleTimeout = null;
                this.frameId = null;
              });
            }, SafeResizeObserver.THROTTLE_DELAY);
            return;
          }
          
          // Otherwise, execute normally
          this.lastProcessTime = now;
          try {
            originalCallback(entries, observer);
          } catch (e) {
            // Silent error
          }
        };
        
        super(safeCallback);
      }
      
      // Override observe to keep track of observed elements
      observe(target: Element, options?: ResizeObserverOptions): void {
        // Check if already observing to prevent duplicate observations
        if (this.observing.has(target)) return;
        
        this.observing.add(target);
        try {
          super.observe(target, options);
        } catch (e) {
          // Silent error
          this.observing.delete(target);
        }
      }
      
      // Override unobserve to update tracking set
      unobserve(target: Element): void {
        this.observing.delete(target);
        try {
          super.unobserve(target);
        } catch (e) {
          // Silent error
        }
      }
      
      // Override disconnect to clean up resources
      disconnect(): void {
        if (this.throttleTimeout) {
          clearTimeout(this.throttleTimeout);
          this.throttleTimeout = null;
        }
        if (this.frameId) {
          cancelAnimationFrame(this.frameId);
          this.frameId = null;
        }
        this.observing.clear();
        this.pendingEntries = [];
        try {
          super.disconnect();
        } catch (e) {
          // Silent error
        }
      }
    };
    
    // Copy static properties
    Object.keys(OriginalResizeObserver).forEach(key => {
      (window.ResizeObserver as any)[key] = (OriginalResizeObserver as any)[key];
    });
    
    // Mark as patched
    (window.ResizeObserver as any).__patched = true;
  }
  
  // Filter out ResizeObserver console errors
  const originalConsoleError = console.error;
  console.error = function(...args: any[]) {
    if (args.length > 0 && typeof args[0] === 'string') {
      const errorMsg = args[0];
      if (
        errorMsg.includes('ResizeObserver') || 
        errorMsg.includes('undelivered notifications')
      ) {
        return; // Suppress ResizeObserver related errors
      }
    }
    return originalConsoleError.apply(console, args);
  };
  
  // Mark as handled
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