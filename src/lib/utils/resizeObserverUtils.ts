/**
 * Comprehensive ResizeObserver error handling utilities
 * These utilities help prevent and handle ResizeObserver loop errors
 */

/**
 * Sets up global error handling specifically for ResizeObserver errors
 * Call this once in your app root component
 */
export function setupResizeObserverErrorHandling() {
  // Only run in browser environment
  if (typeof window === 'undefined') return;
  
  // Only set up once
  if ((window as any).__resizeObserverErrorHandlingSetup) return;
  
  // Prevent console flood from ResizeObserver errors
  const originalConsoleError = console.error;
  console.error = function(msg, ...args) {
    // Skip ResizeObserver loop errors
    if (typeof msg === 'string' && 
        (msg.includes('ResizeObserver loop') || 
         msg.includes('ResizeObserver was created') ||
         msg.includes('undelivered notifications') ||
         msg.includes('exceeded') ||
         msg.includes('ResizeObserver'))) {
      
      // Track errors and implement backoff strategy
      trackResizeObserverError();
      return;
    }
    
    // Pass through all other errors
    return originalConsoleError.apply(console, [msg, ...args]);
  };
  
  // Error count and recovery state tracking
  (window as any).__resizeObserverErrorCount = 0;
  (window as any).__resizeObserverLastErrorTime = 0;
  (window as any).__resizeObserverRecoveryInProgress = false;
  
  // Improved error tracking with adaptive backoff
  function trackResizeObserverError() {
    const now = Date.now();
    
    // Reset count if it's been a while since last error
    if (now - (window as any).__resizeObserverLastErrorTime > 5000) {
      (window as any).__resizeObserverErrorCount = 0;
    }
    
    (window as any).__resizeObserverErrorCount++;
    (window as any).__resizeObserverLastErrorTime = now;
    
    // Apply recovery measures if errors are increasing
    if ((window as any).__resizeObserverErrorCount > 3 && 
        !(window as any).__resizeObserverRecoveryInProgress) {
      applyResizeObserverRecovery();
    }
  }
  
  // Apply progressive recovery measures for ResizeObserver issues
  function applyResizeObserverRecovery() {
    (window as any).__resizeObserverRecoveryInProgress = true;
    
    // Implement exponential backoff for successive recovery attempts
    const attemptRecovery = (attempt = 1) => {
      setTimeout(() => {
        // Apply fixes to problematic elements
        applyResizeObserverFixes();
        
        // Conditionally continue recovery attempts
        if (attempt < 3) {
          attemptRecovery(attempt + 1);
        } else {
          // Reset recovery state after some time
          setTimeout(() => {
            (window as any).__resizeObserverRecoveryInProgress = false;
            (window as any).__resizeObserverErrorCount = 0;
          }, 5000);
        }
      }, Math.min(500 * Math.pow(2, attempt - 1), 5000));
    };
    
    attemptRecovery();
  }
  
  // Improves stability of elements likely causing ResizeObserver issues
  function applyResizeObserverFixes() {
    try {
      // Fix ReactFlow components which commonly cause these issues
      document.querySelectorAll('.react-flow, .react-flow__pane, .react-flow__viewport').forEach(element => {
        if (element && element instanceof HTMLElement) {
          // Force hardware acceleration
          element.style.transform = 'translateZ(0)';
          element.style.contain = 'paint';
          element.style.willChange = 'transform';
          
          // Ensure elements have explicit dimensions
          if (element.offsetHeight < 10) {
            element.style.minHeight = '200px';
          }
        }
      });

      // Apply specific fixes to Chart containers
      document.querySelectorAll('[data-visualization], [data-chart], canvas, svg').forEach(element => {
        if (element && element instanceof HTMLElement) {
          // Ensure chart containers have stable dimensions
          if (element.offsetHeight < 10) {
            element.style.minHeight = '150px';
          }
          
          // Force hardware acceleration on visualization elements
          element.style.transform = 'translateZ(0)';
        }
      });

      // Apply stability fixes to scrollable areas that might cause problems
      document.querySelectorAll('.scroll-area, [data-scroll], .overflow-auto, .overflow-y-auto').forEach(element => {
        if (element && element instanceof HTMLElement) {
          // Force hardware acceleration on scrollable areas
          element.style.transform = 'translateZ(0)';
        }
      });
      
      // Force a reflow
      document.body.getBoundingClientRect();
      
      // Signal that layout should be recalculated
      window.dispatchEvent(new Event('resize'));
    } catch (e) {
      // Silent error - don't make things worse
    }
  }
  
  // Global error handler for unhandled ResizeObserver errors
  window.addEventListener('error', function(e) {
    if (e && e.message && e.message.includes('ResizeObserver')) {
      e.preventDefault();
      e.stopPropagation();
      trackResizeObserverError();
      return true;
    }
  }, true);
  
  // Mark as set up
  (window as any).__resizeObserverErrorHandlingSetup = true;
}

/**
 * Creates a buffered ResizeObserver that's less likely to cause loop errors
 * Use this instead of directly creating ResizeObserver instances
 */
export function createStableResizeObserver(callback: ResizeObserverCallback): ResizeObserver {
  // Track state to prevent loops
  let isProcessing = false;
  let queuedEntries: ResizeObserverEntry[] = [];
  let frameId: number | null = null;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  // Create actual observer with buffering
  const observer = new ResizeObserver((entries) => {
    // Save entries
    queuedEntries = [...queuedEntries, ...entries];
    
    // If already processing, just queue the entries
    if (isProcessing) return;
    
    // Set processing flag
    isProcessing = true;
    
    // Clear any pending timeouts/frames
    if (frameId !== null) {
      cancelAnimationFrame(frameId);
    }
    
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer);
    }
    
    // Debounce processing with increasing delay based on queue size
    const delayFactor = Math.min(queuedEntries.length, 5);
    debounceTimer = setTimeout(() => {
      frameId = requestAnimationFrame(() => {
        try {
          // Make a copy of entries and clear queue
          const entriesToProcess = [...queuedEntries];
          queuedEntries = [];
          
          // Call the actual callback
          callback(entriesToProcess);
        } catch (e) {
          // Silently handle errors to prevent bubbling
          console.warn('Error in ResizeObserver callback (suppressed)', e);
        } finally {
          // Reset state after delay to prevent immediate re-triggering
          setTimeout(() => {
            isProcessing = false;
          }, 100);
        }
      });
    }, 50 * delayFactor);
  });
  
  return observer;
}

/**
 * Disables problematic ResizeObservers if they're causing issues
 * Call this when ResizeObserver errors are detected
 */
export function disableResizeObserverIfProblematic() {
  try {
    // Get all elements with ResizeObserver-related dataset
    const observers = Array.from(document.querySelectorAll('[data-resize-observer]'));
    
    if (observers.length > 0) {
      // Attempt to find problematic observers
      observers.forEach(element => {
        if (element instanceof HTMLElement) {
          const observerId = element.dataset.resizeObserver;
          
          // Check if this observer is marked as problematic
          if (observerId && (window as any).__problematicObserverIds?.includes(observerId)) {
            // Disable by marking with data attribute
            element.dataset.resizeObserverDisabled = 'true';
            
            // Apply fixed dimensions if possible
            if (element.offsetHeight > 0) {
              element.style.height = `${element.offsetHeight}px`;
            }
            if (element.offsetWidth > 0) {
              element.style.width = `${element.offsetWidth}px`;
            }
          }
        }
      });
    }
    
    // Try to find ReactFlow elements which are common culprits
    document.querySelectorAll('.react-flow, .react-flow__viewport').forEach(el => {
      if (el instanceof HTMLElement) {
        // Apply stability fixes
        el.style.contain = 'paint';
        el.style.transform = 'translateZ(0)';
        
        // Set stable dimensions
        const parent = el.parentElement;
        if (parent && parent.offsetHeight > 0) {
          el.style.height = `${parent.offsetHeight}px`;
        } else if (el.offsetHeight > 0) {
          el.style.height = `${el.offsetHeight}px`;
        } else {
          el.style.height = '300px';
        }
      }
    });
  } catch (e) {
    // Silently fail
  }
}

/**
 * Monitors for rapid ResizeObserver errors and applies more aggressive fixes
 */
export function monitorResizeObserverErrors() {
  if (typeof window === 'undefined') return;
  
  // Track error frequency
  let errorCount = 0;
  let lastErrorTime = 0;
  
  // Override error handling
  const originalOnError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    if (typeof message === 'string' && message.includes('ResizeObserver')) {
      const now = Date.now();
      
      // Reset count if it's been a while
      if (now - lastErrorTime > 5000) {
        errorCount = 0;
      }
      
      errorCount++;
      lastErrorTime = now;
      
      // Apply more aggressive fixes if errors are frequent
      if (errorCount > 3) {
        applyAggressiveResizeObserverFixes();
      }
      
      // Prevent error from propagating
      return true;
    }
    
    // Pass through to original handler
    if (originalOnError) {
      return originalOnError.call(this, message, source, lineno, colno, error);
    }
    
    return false;
  };
}

/**
 * Apply more aggressive fixes for persistent ResizeObserver errors
 */
function applyAggressiveResizeObserverFixes() {
  try {
    // Mark body to prevent multiple fixes
    if (document.body.hasAttribute('data-ro-fixed')) {
      return;
    }
    document.body.setAttribute('data-ro-fixed', 'true');
    
    // Apply extreme stabilization to ReactFlow
    document.querySelectorAll('.react-flow, .react-flow__renderer, .react-flow__viewport, .react-flow__pane').forEach(el => {
      if (el instanceof HTMLElement) {
        // Force GPU acceleration and compositing
        el.style.transform = 'translateZ(0)';
        el.style.backfaceVisibility = 'hidden';
        el.style.perspective = '1000px';
        el.style.willChange = 'transform';
        el.style.contain = 'strict';
        
        // Apply fixed dimensions based on current size
        const parent = el.parentElement;
        if (parent && parent.offsetHeight > 0) {
          el.style.height = `${parent.offsetHeight}px`;
        } else if (el.offsetHeight > 0) {
          el.style.height = `${Math.max(el.offsetHeight, 300)}px`;
        } else {
          el.style.height = '300px';
        }
      }
    });
    
    // Apply fixes to all scrollable containers
    document.querySelectorAll('.overflow-auto, .overflow-y-auto, .overflow-x-auto').forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.transform = 'translateZ(0)';
        el.style.contain = 'paint';
      }
    });
    
    // Fix specific visualization components
    document.querySelectorAll('[data-visualization], [data-flow], canvas, svg').forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.transform = 'translateZ(0)';
        
        // Fix dimensions if needed
        if (el.offsetHeight < 10) {
          el.style.minHeight = '200px';
        }
      }
    });
    
    // Force a layout recalculation
    document.body.style.opacity = '0.99';
    setTimeout(() => {
      document.body.style.opacity = '1';
    }, 50);
    
    // Remove the mark after a delay to allow future fixes if needed
    setTimeout(() => {
      document.body.removeAttribute('data-ro-fixed');
    }, 10000);
  } catch (e) {
    // Silent fail
  }
}

/**
 * React hook for safely using ResizeObserver
 * @param callback Function to call when resize happens
 * @param element Element or ref object to observe
 */
export function useStableResizeObserver(
  callback: ResizeObserverCallback,
  element: HTMLElement | null | { current: HTMLElement | null }
) {
  // Get the element from a ref if needed
  const resolvedElement = element && 'current' in element ? element.current : element;
  
  // Do nothing if no element
  if (!resolvedElement) return;
  
  // Create a stable observer
  const observer = createStableResizeObserver(callback);
  
  // Start observing
  observer.observe(resolvedElement);
  
  // Return disconnect function for cleanup
  return () => {
    observer.disconnect();
  };
}