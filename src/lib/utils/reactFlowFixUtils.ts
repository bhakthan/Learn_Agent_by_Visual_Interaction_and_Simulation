/**
 * Utility functions to fix common ReactFlow issues
 */

/**
 * Forces nodes to be visible by setting explicit styles
 * @param selector CSS selector for ReactFlow nodes
 * @param maxAttempts Max number of attempts to find and fix nodes
 */
export function forceNodesVisible(selector = '.react-flow__node', maxAttempts = 1) {
  // Use setTimeout to ensure DOM is ready
  setTimeout(() => {
    try {
      // Find all nodes matching the selector
      const nodes = document.querySelectorAll(selector);
      
      // Apply visibility fixes to each node
      nodes.forEach(node => {
        if (node instanceof HTMLElement) {
          node.style.opacity = '1';
          node.style.visibility = 'visible';
          node.style.display = 'block';
          node.style.transform = 'translateZ(0)';
        }
      });
      
      // Also force edges to be visible
      const edges = document.querySelectorAll('.react-flow__edge');
      edges.forEach(edge => {
        if (edge instanceof HTMLElement) {
          edge.style.opacity = '1';
          edge.style.visibility = 'visible';
        }
      });
      
      // Force edge paths to be visible
      const edgePaths = document.querySelectorAll('.react-flow__edge-path');
      edgePaths.forEach(path => {
        if (path instanceof SVGElement) {
          path.style.stroke = path.style.stroke || 'currentColor';
          path.style.strokeWidth = path.style.strokeWidth || '1.5';
          path.style.opacity = '1';
          path.style.visibility = 'visible';
        }
      });
    } catch (e) {
      console.debug('Error in forceNodesVisible (suppressed)', e);
    }
  }, 100);
}

/**
 * Fix ReactFlow rendering issues by applying various workarounds
 * @param reactFlowInstance The ReactFlow instance to fix
 * @param padding Padding for fitView operations
 */
export function fixReactFlowRendering(reactFlowInstance: any, padding = 0.2) {
  if (!reactFlowInstance) return;
  
  try {
    // Force a fitView operation
    if (typeof reactFlowInstance.fitView === 'function') {
      reactFlowInstance.fitView({ padding });
    }
    
    // Force nodes to be visible
    forceNodesVisible();
    
    // Re-render the flow
    if (typeof reactFlowInstance.updateNodeInternals === 'function') {
      const nodeIds = reactFlowInstance.getNodes().map((n: any) => n.id);
      nodeIds.forEach((id: string) => {
        try {
          reactFlowInstance.updateNodeInternals(id);
        } catch (e) {
          // Silently ignore individual node errors
        }
      });
    }
  } catch (e) {
    console.debug('Error in fixReactFlowRendering (suppressed)', e);
  }
}

/**
 * Setup error handling for ReactFlow
 */
export function setupReactFlowErrorHandling() {
  // Add global handler for ResizeObserver loop errors
  window.addEventListener('error', function(e) {
    if (e && e.message && (
      e.message.includes('ResizeObserver loop') || 
      e.message.includes('ResizeObserver completed')
    )) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, true);
  
  // Return cleanup function
  return () => {};
}

export default { forceNodesVisible, fixReactFlowRendering, setupReactFlowErrorHandling };