/**
 * Utility functions to handle ResizeObserver errors
 * and improve stability of ReactFlow visualizations
 */

/**
 * Detect if ResizeObserver is causing issues and disable if needed
 * This function temporarily disables ReactFlow's internal ResizeObserver
 * when we detect frequent errors happening
 */
export function disableResizeObserverIfProblematic() {
  // Only run in browser environment
  if (typeof window === 'undefined') return;
  
  // Keep track of ResizeObserver error frequency
  const now = Date.now();
  const ERROR_THRESHOLD = 5; // Number of errors allowed in time window
  const ERROR_TIME_WINDOW = 2000; // Time window in milliseconds
  
  // Initialize counters if needed
  if (typeof (window as any).__resizeObserverErrorCount === 'undefined') {
    (window as any).__resizeObserverErrorCount = 0;
    (window as any).__lastResizeObserverError = now;
  }
  
  // Increment error counter
  (window as any).__resizeObserverErrorCount++;
  
  // Check if errors are too frequent
  if (now - (window as any).__lastResizeObserverError < ERROR_TIME_WINDOW && 
      (window as any).__resizeObserverErrorCount > ERROR_THRESHOLD) {
    
    // Too many errors in a short time, disable ReactFlow's ResizeObserver temporarily
    const reactFlowElements = document.querySelectorAll('.react-flow');
    reactFlowElements.forEach(el => {
      // Apply protective measures
      (el as HTMLElement).style.width = '100%';
      (el as HTMLElement).style.height = '100%';
      (el as HTMLElement).style.overflow = 'hidden';
      
      // Add a flag to indicate we've applied a fix
      el.setAttribute('data-resize-protected', 'true');
    });
    
    // Schedule a reset after things have calmed down
    setTimeout(() => {
      // Re-enable normal behavior
      reactFlowElements.forEach(el => {
        el.removeAttribute('data-resize-protected');
      });
      
      // Reset counters
      (window as any).__resizeObserverErrorCount = 0;
    }, 5000);
  }
  
  // Update last error time
  (window as any).__lastResizeObserverError = now;
}

/**
 * Set up global error handling for ResizeObserver errors
 * This prevents the app from crashing due to ResizeObserver loops
 */
export function setupResizeObserverErrorHandling() {
  // Only run in browser environment
  if (typeof window === 'undefined') return;
  
  // Prevent duplicate setup
  if ((window as any).__resizeObserverErrorHandlingSetup) return;
  
  // Keep track of recent errors to prevent spamming the console
  let recentResizeObserverErrors = 0;
  const MAX_ERRORS = 5;
  const ERROR_RESET_INTERVAL = 5000; // 5 seconds
  
  // Reset error counter periodically
  setInterval(() => {
    recentResizeObserverErrors = 0;
  }, ERROR_RESET_INTERVAL);
  
  // Create a more robust error handler for ResizeObserver loops
  const originalOnError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    // Check if this is a ResizeObserver error
    if (typeof message === 'string' && 
        (message.includes('ResizeObserver') || 
         message.includes('loop limit exceeded') ||
         message.includes('undelivered notifications'))) {
      
      // Increment error counter
      recentResizeObserverErrors++;
      
      // Call our utility to potentially disable problematic observers
      disableResizeObserverIfProblematic();
      
      // If we're seeing too many errors, try to fix the issue
      if (recentResizeObserverErrors > MAX_ERRORS) {
        // Force recalculation of layout with increasing delay to prevent cascading errors
        setTimeout(() => {
          // Notify ReactFlow components to update their layout
          window.dispatchEvent(new CustomEvent('flow-force-stabilize', {
            detail: { timestamp: Date.now() }
          }));
          
          // Standard resize event as fallback
          window.dispatchEvent(new Event('resize'));
        }, Math.min(200 * recentResizeObserverErrors, 1000));
        
        // Reset counter to avoid continuous recalculations
        recentResizeObserverErrors = 0;
      }
      
      // Always suppress ResizeObserver errors in the UI
      return true;
    }
    
    // Forward to original handler for other error types
    if (originalOnError) {
      return originalOnError.call(window, message, source, lineno, colno, error);
    }
    
    return false;
  };
  
  // Add a more robust error event listener specifically for ResizeObserver errors
  window.addEventListener('error', (event) => {
    if (event && event.message && (
      event.message.includes('ResizeObserver loop') || 
      event.message.includes('ResizeObserver completed with undelivered notifications') ||
      event.message.includes('undelivered notifications')
    )) {
      // Prevent the error from bubbling up
      event.preventDefault();
      event.stopPropagation();
      
      // Call our utility function
      disableResizeObserverIfProblematic();
      
      return false;
    }
  }, true); // Use capturing phase to catch the error as early as possible
  
  // Mark as set up to prevent duplicate initialization
  (window as any).__resizeObserverErrorHandlingSetup = true;
}

/**
 * Helper function to safely reset ReactFlow rendering
 * Use this when encountering rendering issues with ReactFlow
 * 
 * This function applies a sequence of stabilizing adjustments to ReactFlow components
 * when they encounter rendering issues or ResizeObserver errors
 * 
 * @param containerRef Reference to the container element that holds ReactFlow components
 */
export function resetReactFlowRendering(containerRef: React.RefObject<HTMLElement>) {
  if (!containerRef.current) return;
  
  // Create a more comprehensive reset strategy
  const applyReset = () => {
    try {
      // Force a reflow
      void containerRef.current?.offsetHeight;
      
      // Find all ReactFlow elements (there might be multiple in nested views)
      const flowElements = containerRef.current?.querySelectorAll('.react-flow, [data-reactflow]') || [];
      
      if (flowElements.length === 0) {
        // If no flow elements found, try again later
        setTimeout(applyReset, 100);
        return;
      }
      
      // Apply fixes to each ReactFlow instance
      flowElements.forEach(flowElement => {
        if (!flowElement) return;
        
        // Apply a sequence of stabilizing adjustments
        
        // 1. Ensure the element has a defined size
        if ((flowElement as HTMLElement).style.height === '') {
          (flowElement as HTMLElement).style.height = '100%';
        }
        
        // 2. Ensure smooth rendering
        (flowElement as HTMLElement).style.transform = 'translateZ(0)';
        (flowElement as HTMLElement).style.backfaceVisibility = 'hidden';
        (flowElement as HTMLElement).style.perspective = '1000px';
        
        // 3. Force proper layout containment
        (flowElement as HTMLElement).style.contain = 'layout size';
        
        // 4. Wait for style changes to apply
        setTimeout(() => {
          // 5. Trigger a layout recalculation
          const event = new CustomEvent('flow-reset', { bubbles: true });
          flowElement.dispatchEvent(event);
          
          // 6. Clear temporary styles after a delay
          setTimeout(() => {
            (flowElement as HTMLElement).style.transform = '';
            (flowElement as HTMLElement).style.backfaceVisibility = '';
            (flowElement as HTMLElement).style.perspective = '';
            (flowElement as HTMLElement).style.contain = '';
          }, 200);
        }, 50);
      });
      
      // Force global layout update as a fallback
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 250);
    } catch (error) {
      // Silent recovery if something goes wrong
      console.error('Error during ReactFlow reset (suppressed)');
    }
  };
  
  // Start the reset process
  applyReset();
}