/**
 * Global Flow Handlers
 * 
 * This utility provides global handlers for ReactFlow components and methods.
 * It helps manage common errors and provides fallback methods for flow operations.
 */

/**
 * Global fitView function that can be used as a fallback
 */
export const globalFitView = () => {
  try {
    // Try to find ReactFlow instances in the document
    const flowContainers = document.querySelectorAll('.react-flow');
    
    flowContainers.forEach(container => {
      // Check if there's an instance attached
      const instance = (container as any)._reactFlowInstance;
      if (instance && typeof instance.fitView === 'function') {
        instance.fitView({
          padding: 0.2,
          includeHiddenNodes: true,
          duration: 800
        });
      }
    });
  } catch (error) {
    console.warn('Global fitView fallback error (suppressed)');
  }
};

/**
 * Setup global handlers for ReactFlow
 */
export function setupGlobalFlowHandlers() {
  if (typeof window === 'undefined') return;
  
  // Add global fitView handler
  (window as any).fitView = globalFitView;
  
  // Add event listener for custom flow events
  window.addEventListener('flow-force-fitview', () => {
    globalFitView();
  });
  
  // Add handler to monitor ReactFlow errors
  const originalConsoleError = console.error;
  console.error = function(msg: any, ...args: any[]) {
    // Check for ReactFlow errors
    if (typeof msg === 'string' && 
        (msg.includes('fitView') || 
         msg.includes('ReactFlow') || 
         msg.includes('react-flow'))) {
      // Log a simplified message and trigger recovery
      console.warn('ReactFlow error detected, attempting recovery');
      setTimeout(globalFitView, 100);
      return;
    }
    
    // Pass through all other errors
    return originalConsoleError.apply(console, [msg, ...args]);
  };
  
  return {
    cleanup: () => {
      // Restore original console.error
      console.error = originalConsoleError;
      
      // Remove event listener
      window.removeEventListener('flow-force-fitview', globalFitView);
      
      // Clean up global handler
      delete (window as any).fitView;
    }
  };
}