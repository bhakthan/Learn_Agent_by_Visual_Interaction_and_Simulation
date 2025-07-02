/**
 * Utility functions to fix common ReactFlow issues
 * These functions help ensure that nodes and edges remain visible
 */

/**
 * Forces all ReactFlow nodes to be visible
 * @param containerSelector - CSS selector for the ReactFlow container
 * @param attempts - Number of attempts to try (retries with delays)
 */
export function forceNodesVisible(containerSelector = '.react-flow', attempts = 3) {
  let currentAttempt = 0;
  
  const tryFixingNodes = () => {
    const container = document.querySelector(containerSelector);
    if (!container) {
      if (currentAttempt < attempts) {
        currentAttempt++;
        setTimeout(tryFixingNodes, 100 * currentAttempt);
      }
      return;
    }
    
    // Force all nodes to be visible
    const nodes = container.querySelectorAll('.react-flow__node');
    nodes.forEach(node => {
      if (node instanceof HTMLElement) {
        node.style.opacity = '1';
        node.style.visibility = 'visible';
        node.style.display = 'block';
        node.style.transform = 'translateZ(0)';
      }
    });
    
    // Force all edges to be visible
    const edges = container.querySelectorAll('.react-flow__edge');
    edges.forEach(edge => {
      if (edge instanceof HTMLElement) {
        edge.style.opacity = '1';
        edge.style.visibility = 'visible';
      }
      
      // Ensure edge paths are visible
      const paths = edge.querySelectorAll('path');
      paths.forEach(path => {
        path.setAttribute('stroke-width', '1.5');
        path.setAttribute('opacity', '1');
        path.setAttribute('visibility', 'visible');
      });
    });
  };
  
  // Initial attempt
  tryFixingNodes();
  
  // Schedule repeated attempts
  for (let i = 1; i <= attempts; i++) {
    setTimeout(tryFixingNodes, 200 * i);
  }
}

/**
 * Fixes ReactFlow rendering issues by forcing a reflow
 * @param instance - ReactFlow instance
 * @param padding - Padding for fitView
 */
export function fixReactFlowRendering(instance: any, padding = 0.2) {
  if (!instance || typeof instance.fitView !== 'function') return;
  
  // Apply initial fit view
  instance.fitView({ padding });
  
  // Use RAF to smooth out the operation
  requestAnimationFrame(() => {
    try {
      // Force a reflow by accessing offsetHeight
      const container = document.querySelector('.react-flow');
      if (container instanceof HTMLElement) {
        container.style.opacity = '1';
        container.style.visibility = 'visible';
        
        // Force reflow
        void container.offsetHeight;
        
        // Apply fit view again after reflow
        setTimeout(() => {
          if (instance && typeof instance.fitView === 'function') {
            instance.fitView({ padding });
          }
        }, 50);
      }
    } catch (e) {
      console.debug('Error fixing ReactFlow rendering', e);
    }
  });
}

/**
 * Add this function to the window to enable direct debugging
 */
if (typeof window !== 'undefined') {
  (window as any).fixReactFlowVisibility = forceNodesVisible;
}