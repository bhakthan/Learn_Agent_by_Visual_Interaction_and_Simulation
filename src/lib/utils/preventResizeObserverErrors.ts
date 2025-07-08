/**
 * Utility to apply global optimizations to prevent ReactFlow and ResizeObserver errors
 */

export const applyReactFlowGlobalOptimizations = () => {
  // Block error propagation for ResizeObserver errors
  const originalConsoleError = console.error;
  console.error = function(...args: any[]) {
    const errorMessage = args[0];
    
    // Check if it's a ResizeObserver error
    if (
      typeof errorMessage === 'string' && (
        errorMessage.includes('ResizeObserver loop') ||
        errorMessage.includes('ResizeObserver was created') ||
        errorMessage.includes('undelivered notifications')
      )
    ) {
      // Suppress the error
      return;
    }
    
    // Check if it's a ReactFlow-related error
    if (
      typeof errorMessage === 'string' && (
        errorMessage.includes('zustand provider') ||
        errorMessage.includes('[React Flow]')
      )
    ) {
      // Suppress in production, show simplified in development
      if (process.env.NODE_ENV !== 'development') {
        return;
      }
      return originalConsoleError.call(console, '[ReactFlow Error Suppressed]');
    }
    
    // Pass through other errors
    originalConsoleError.apply(console, args);
  };
  
  // Add a global style to ensure React Flow visualizations are properly visible
  const style = document.createElement('style');
  style.innerHTML = `
    .react-flow__node {
      opacity: 1 !important;
      visibility: visible !important;
      display: block !important;
      z-index: 1;
      transform: translateZ(0);
    }
    
    .react-flow__edge-path {
      stroke-width: 1.5px !important;
      opacity: 1 !important;
      visibility: visible !important;
    }
    
    .react-flow__viewport {
      transform: translate(0px, 0px) scale(1) !important;
    }
    
    .react-flow {
      min-height: 200px;
    }
  `;
  document.head.appendChild(style);
  
  // Add mutation observer to clean unwanted text nodes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach((node) => {
          // Check if this is a text node under a react-flow element
          if (node.nodeType === Node.TEXT_NODE && 
              node.parentElement && 
              (
                node.parentElement.classList.contains('react-flow') ||
                node.parentElement.classList.contains('react-flow__viewport')
              ) &&
              node.textContent && 
              node.textContent.trim()) {
            // Clear problematic text content
            node.textContent = '';
          }
        });
      }
    });
  });
  
  // Start observing
  observer.observe(document.body, { childList: true, subtree: true });
  
  return () => {
    // Cleanup
    console.error = originalConsoleError;
    observer.disconnect();
  };
};