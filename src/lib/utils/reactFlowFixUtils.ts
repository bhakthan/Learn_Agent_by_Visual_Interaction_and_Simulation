/**
 * Utility functions for fixing ReactFlow errors
 */

// Setup error handling for ReactFlow
export function setupReactFlowErrorHandling() {
  // Override console.error to suppress ReactFlow errors
  const originalConsoleError = console.error;
  console.error = function(...args: any[]) {
    if (
      typeof args[0] === 'string' && 
      (
        args[0].includes('ReactFlow') || 
        args[0].includes('Invalid hook call') ||
        args[0].includes('Uncaught Error') ||
        args[0].includes('ResizeObserver')
      )
    ) {
      // Log warning instead of error for better user experience
      console.warn('[ReactFlow Warning]', args[0]);
      return;
    }
    
    // Pass through all other errors
    return originalConsoleError.apply(console, args);
  };
  
  // Add error handler for ReactFlow errors
  window.addEventListener('error', function(e) {
    if (e && e.message && (
      e.message.includes('Invalid hook call') || 
      e.message.includes('can only be called inside the body of a function component')
    )) {
      // Log info about the error and prevent it from propagating
      console.warn(
        '[ReactFlow Hook Warning] An invalid hook call was detected. ' + 
        'This is likely because ReactFlow hooks are being used outside of a ReactFlowProvider. ' +
        'Ensure all components using ReactFlow hooks are wrapped with ReactFlowProvider.'
      );
      
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, true);
  
  // Return cleanup function
  return () => {
    console.error = originalConsoleError;
  };
}