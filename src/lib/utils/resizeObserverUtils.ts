/**
 * Utility functions to handle ResizeObserver errors
 * and improve stability of ReactFlow visualizations
 */

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
      
      // If we're seeing too many errors, try to fix the issue
      if (recentResizeObserverErrors > MAX_ERRORS) {
        // Force recalculation of layout
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 200);
        
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
  
  // Mark as set up to prevent duplicate initialization
  (window as any).__resizeObserverErrorHandlingSetup = true;
}

/**
 * Helper function to safely reset ReactFlow rendering
 * Use this when encountering rendering issues with ReactFlow
 */
export function resetReactFlowRendering(containerRef: React.RefObject<HTMLElement>) {
  if (!containerRef.current) return;
  
  // Force a reflow
  void containerRef.current.offsetHeight;
  
  // Apply special styles to trigger a fresh layout calculation
  const flowElement = containerRef.current.querySelector('.react-flow');
  if (flowElement) {
    // Force hardware acceleration to improve rendering performance
    (flowElement as HTMLElement).style.transform = 'translateZ(0)';
    
    // Create a new stacking context to isolate rendering
    (flowElement as HTMLElement).style.isolation = 'isolate';
    
    // Reset flow measurement - needs to happen in next tick
    setTimeout(() => {
      // Use a custom event to trigger a recalculation in ReactFlow
      const event = new CustomEvent('flow-reset');
      flowElement.dispatchEvent(event);
      
      // Clear any temporary styles
      (flowElement as HTMLElement).style.transform = '';
    }, 50);
  }
  
  // Force browser to recognize changes
  window.dispatchEvent(new Event('resize'));
}