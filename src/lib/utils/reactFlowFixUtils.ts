/**
 * Utility functions to prevent and fix ReactFlow errors
 */

/**
 * Set up global error handling for ReactFlow-specific errors
 */
export const setupReactFlowErrorHandling = () => {
  // The original console.error
  const originalConsoleError = console.error;
  
  // Override console.error to filter out known React Flow errors
  console.error = function(...args: any[]) {
    // Check if the error message contains ReactFlow specific errors
    if (
      args[0] && typeof args[0] === 'string' &&
      (
        args[0].includes('zustand provider') ||
        args[0].includes('ReactFlow') ||
        args[0].includes('react-flow') ||
        args[0].includes('ResizeObserver') ||
        args[0].includes('loop completed with undelivered notifications')
      )
    ) {
      // Suppress known ReactFlow errors in production
      if (process.env.NODE_ENV !== 'development') {
        return;
      }
      
      // In development, show a condensed version
      return originalConsoleError.call(
        console,
        '%c[ReactFlow Warning Suppressed]',
        'color: gray',
        args[0].substring(0, 100) + '...'
      );
    }
    
    // Pass through all other errors
    return originalConsoleError.apply(console, args);
  };
  
  return () => {
    // Restore original console.error if needed
    console.error = originalConsoleError;
  };
};

/**
 * Fix common ReactFlow rendering issues by ensuring nodes are visible
 */
export const fixReactFlowRendering = (containerRef: React.RefObject<HTMLElement>) => {
  if (!containerRef.current) return;
  
  // Force container to have proper dimensions if they're missing
  const container = containerRef.current;
  if (container.offsetHeight < 10) {
    container.style.height = '300px';
  }
  
  if (container.offsetWidth < 10) {
    container.style.width = '100%';
  }
  
  // Apply hardware acceleration to improve rendering
  container.style.transform = 'translateZ(0)';
  container.style.backfaceVisibility = 'hidden';
  container.style.webkitBackfaceVisibility = 'hidden';
  
  // Find any ReactFlow nodes and make them visible
  const nodes = container.querySelectorAll('.react-flow__node');
  nodes.forEach((node: Element) => {
    if (node instanceof HTMLElement) {
      node.style.opacity = '1';
      node.style.visibility = 'visible';
      node.style.display = 'block';
    }
  });
  
  // Find any edges and make them visible
  const edges = container.querySelectorAll('.react-flow__edge-path');
  edges.forEach((edge: Element) => {
    if (edge instanceof SVGElement) {
      edge.setAttribute('opacity', '1');
      edge.setAttribute('visibility', 'visible');
      edge.setAttribute('stroke-width', '1.5');
    }
  });
  
  // Remove any text nodes that might be interfering
  Array.from(container.childNodes).forEach(node => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent && node.textContent.trim()) {
      node.textContent = '';
    }
  });
};

/**
 * Ensure ReactFlow nodes are properly positioned and visible
 */
export const forceNodesVisible = (reactFlowInstance: any) => {
  if (!reactFlowInstance) return;
  
  setTimeout(() => {
    try {
      // Try to fit the view to make all nodes visible
      if (reactFlowInstance.fitView && typeof reactFlowInstance.fitView === 'function') {
        reactFlowInstance.fitView({ padding: 0.2, includeHiddenNodes: true });
      }
    } catch (e) {
      console.warn('Failed to fit view in ReactFlow', e);
    }
  }, 100);
};