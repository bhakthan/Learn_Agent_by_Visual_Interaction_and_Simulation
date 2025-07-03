/**
 * Global utility to prevent ResizeObserver errors
 * This should be imported and called once in your application's main entry point
 */

/**
 * Prevent ResizeObserver loop errors from crashing the application
 */
export function preventResizeObserverErrors() {
  // Store original console.error to restore later if needed
  const originalConsoleError = console.error;

  // Override console.error to filter ResizeObserver errors
  console.error = function(msg: any, ...args: any[]) {
    // Check if message contains ResizeObserver error text
    if (
      (typeof msg === 'string' && (
        msg.includes('ResizeObserver loop') ||
        msg.includes('ResizeObserver was created') ||
        msg.includes('undelivered notifications') ||
        msg.includes('ResizeObserver completed')
      )) ||
      // Also check for error objects
      (msg instanceof Error && 
        msg.message && (
          msg.message.includes('ResizeObserver loop') ||
          msg.message.includes('ResizeObserver was created') ||
          msg.message.includes('undelivered notifications') ||
          msg.message.includes('ResizeObserver completed')
        )
      )
    ) {
      // For development, show a minimal notice but don't break the console
      if (process.env.NODE_ENV === 'development') {
        console.debug('[React Flow] ResizeObserver error suppressed');
      }
      return;
    }

    // Pass through all other errors
    originalConsoleError.apply(console, [msg, ...args]);
  };

  // Add global error handler for ResizeObserver errors
  window.addEventListener('error', (event) => {
    if (
      event.message && (
        event.message.includes('ResizeObserver loop') ||
        event.message.includes('ResizeObserver completed with undelivered notifications') ||
        event.message.includes('ResizeObserver') ||
        event.message.includes('undelivered notifications')
      )
    ) {
      // Prevent the error from propagating
      event.preventDefault();
      event.stopPropagation();
      
      return false;
    }
  }, true);

  // Return function to restore original behavior if needed
  return () => {
    console.error = originalConsoleError;
  };
}

/**
 * Apply global optimizations for ReactFlow
 */
export function applyReactFlowGlobalOptimizations() {
  // Prevent ResizeObserver errors
  preventResizeObserverErrors();
  
  // Make window.requestAnimationFrame more reliable for ReactFlow
  const originalRAF = window.requestAnimationFrame;
  window.requestAnimationFrame = function(callback) {
    // If the callback is related to rendering React Flow, wrap it for stability
    return originalRAF.call(window, (timestamp) => {
      try {
        callback(timestamp);
      } catch (err) {
        console.debug('[React Flow] Animation frame error suppressed', err);
      }
    });
  };
  
  // Add global function to force-show ReactFlow nodes
  window.forceShowReactFlowNodes = function() {
    document.querySelectorAll('.react-flow__node').forEach(node => {
      if (node instanceof HTMLElement) {
        node.style.opacity = '1';
        node.style.visibility = 'visible';
        node.style.display = 'block';
        node.style.transform = 'translateZ(0)';
      }
    });
    
    document.querySelectorAll('.react-flow__edge').forEach(edge => {
      if (edge instanceof HTMLElement) {
        edge.style.opacity = '1';
        edge.style.visibility = 'visible';
      }
    });
    
    console.log('ReactFlow node visibility forced');
  };
  
  // Return cleanup function
  return () => {
    window.requestAnimationFrame = originalRAF;
    delete (window as any).forceShowReactFlowNodes;
  };
}

// Add type definitions for the global function
declare global {
  interface Window {
    forceShowReactFlowNodes: () => void;
  }
}

export default applyReactFlowGlobalOptimizations;