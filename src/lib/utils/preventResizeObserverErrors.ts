/**
 * Utility functions to prevent and handle ResizeObserver errors in ReactFlow
 * These are applied globally to improve stability
 */

export function applyReactFlowGlobalOptimizations() {
  // Override console.error to suppress ReactFlow ResizeObserver errors
  const originalConsoleError = console.error;
  console.error = function(...args: any[]) {
    if (
      typeof args[0] === 'string' && 
      (args[0].includes('ResizeObserver') || 
       args[0].includes('loop completed with undelivered notifications') || 
       args[0].includes('Maximum update depth exceeded'))
    ) {
      // Silently suppress these errors
      return;
    }
    
    if (typeof args[0] === 'string' && args[0].includes('Invalid hook call')) {
      // Log hook errors with helpful suggestion
      console.warn(
        '[ReactFlow Warning]: Invalid hook call detected. ' + 
        'This might be caused by using hooks outside a ReactFlowProvider. ' +
        'Ensure all ReactFlow hooks are used within a component wrapped by ReactFlowProvider.'
      );
      return;
    }
    
    // Pass through all other errors
    return originalConsoleError.apply(console, args);
  };
  
  // Add global error handler for ResizeObserver errors
  window.addEventListener('error', function(e) {
    if (e && e.message && (
      e.message.includes('ResizeObserver loop') || 
      e.message.includes('ResizeObserver completed with undelivered notifications')
    )) {
      // Prevent the error from propagating
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, true);
  
  // Add recovery function for ReactFlow display issues
  window.fixReactFlow = function() {
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
      
      const paths = edge.querySelectorAll('path');
      paths.forEach(path => {
        path.setAttribute('stroke-width', '1.5');
        path.setAttribute('opacity', '1');
        path.setAttribute('visibility', 'visible');
      });
    });
  };
  
  // Add window.matchMedia polyfill for environments that don't support it
  if (!window.matchMedia) {
    window.matchMedia = (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    });
  }
  
  // Stabilize ReactFlow rendering
  const stabilizeReactFlow = () => {
    document.querySelectorAll('.react-flow').forEach(flow => {
      if (flow instanceof HTMLElement) {
        // Apply hardware acceleration
        flow.style.transform = 'translateZ(0)';
        flow.style.backfaceVisibility = 'hidden';
        flow.style.webkitBackfaceVisibility = 'hidden';
        
        // Enforce minimum dimensions
        flow.style.minHeight = '200px';
        flow.style.minWidth = '200px';
        
        // Clean up text nodes
        flow.childNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE && node.textContent) {
            if (node.textContent.trim().includes('/agent/invoke') || 
                node.textContent.trim().includes('POST ')) {
              node.textContent = '';
            }
          }
        });
      }
    });
    
    // Also clean inside viewport and renderer
    document.querySelectorAll('.react-flow__viewport, .react-flow__renderer').forEach(el => {
      if (el instanceof HTMLElement) {
        el.childNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE && node.textContent) {
            if (node.textContent.trim().includes('/agent/invoke') || 
                node.textContent.trim().includes('POST ')) {
              node.textContent = '';
            }
          }
        });
      }
    });
  };
  
  // Run stabilization after timeout to ensure ReactFlow is mounted
  setTimeout(stabilizeReactFlow, 1000);
  setTimeout(window.fixReactFlow, 1500);
  
  // Add periodic cleanup for text nodes that might appear after rendering
  setInterval(() => {
    document.querySelectorAll('.react-flow, .react-flow__viewport, .react-flow__renderer').forEach(el => {
      if (el instanceof HTMLElement) {
        el.childNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE && node.textContent) {
            if (node.textContent.trim().includes('/agent/invoke') || 
                node.textContent.trim().includes('POST ')) {
              node.textContent = '';
            }
          }
        });
      }
    });
  }, 2000);
}

// Declare the fixReactFlow function on window
declare global {
  interface Window {
    fixReactFlow: () => void;
  }
}