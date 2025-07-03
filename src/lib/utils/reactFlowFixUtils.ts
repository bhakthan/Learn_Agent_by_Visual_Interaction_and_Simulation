import { Instance as ReactFlowInstance } from 'reactflow';

/**
 * Utilities for fixing common ReactFlow rendering issues
 */

// Function to set up optimized ReactFlow element properties
export function setupReactFlowErrorHandling() {
  // Wait for DOM to be loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReactFlowFixes);
  } else {
    initReactFlowFixes();
  }
}

/**
 * Initialize ReactFlow-specific fixes
 */
function initReactFlowFixes() {
  // Fix visibility of ReactFlow nodes and edges periodically
  const fixVisibility = () => {
    // Force nodes to be visible
    document.querySelectorAll('.react-flow__node').forEach(node => {
      if (node instanceof HTMLElement) {
        node.style.opacity = '1';
        node.style.visibility = 'visible';
        node.style.display = 'block';
      }
    });
    
    // Force edges to be visible
    document.querySelectorAll('.react-flow__edge').forEach(edge => {
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
  
  // Set up periodic visibility fixes
  setTimeout(fixVisibility, 1000);
  setTimeout(fixVisibility, 2500);
  setInterval(fixVisibility, 10000);
  
  // Add global event listener for layout updates
  window.addEventListener('layout-update', fixVisibility);
  window.addEventListener('content-resize', fixVisibility);
}

/**
 * Force nodes to be visible by applying direct styles
 */
export function forceNodesVisible() {
  // Force all nodes to be visible
  document.querySelectorAll('.react-flow__node').forEach(node => {
    if (node instanceof HTMLElement) {
      node.style.opacity = '1';
      node.style.visibility = 'visible';
      node.style.display = 'block';
      node.style.transform = 'translateZ(0)';
    }
  });
  
  // Force edges to be visible too
  document.querySelectorAll('.react-flow__edge').forEach(edge => {
    if (edge instanceof HTMLElement) {
      edge.style.opacity = '1';
      edge.style.visibility = 'visible';
    }
  });
}

/**
 * Fix ReactFlow rendering issues by applying optimizations and fitting view
 */
export function fixReactFlowRendering(instance: ReactFlowInstance, padding = 0.2) {
  try {
    // Force hardware acceleration on all ReactFlow elements
    document.querySelectorAll('.react-flow, .react-flow__viewport, .react-flow__container').forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.transform = 'translateZ(0)';
        el.style.backfaceVisibility = 'hidden';
        el.style.WebkitBackfaceVisibility = 'hidden';
      }
    });
    
    // Ensure all nodes are visible
    forceNodesVisible();
    
    // Fit view if possible
    if (instance && typeof instance.fitView === 'function') {
      setTimeout(() => {
        try {
          instance.fitView({
            padding,
            includeHiddenNodes: true
          });
        } catch (e) {
          console.warn('Error fitting view (suppressed):', e);
        }
      }, 100);
    }
    
    return true;
  } catch (e) {
    console.warn('Error fixing ReactFlow rendering (suppressed):', e);
    return false;
  }
}

/**
 * Perform a reset of ReactFlow rendering for a specific container
 * This can help when nodes/edges are not visible
 */
export function resetReactFlowRendering(containerRef: React.RefObject<HTMLElement>) {
  if (!containerRef.current) return;
  
  // Force hardware acceleration and visibility
  containerRef.current.style.transform = 'translateZ(0)';
  containerRef.current.style.backfaceVisibility = 'hidden';
  containerRef.current.style.WebkitBackfaceVisibility = 'hidden';
  
  // Find all ReactFlow elements within this container
  const reactFlowElements = containerRef.current.querySelectorAll('.react-flow, .react-flow__renderer, .react-flow__container');
  
  reactFlowElements.forEach(el => {
    if (el instanceof HTMLElement) {
      // Apply optimizations
      el.style.transform = 'translateZ(0)';
      el.style.willChange = 'transform';
      el.style.backfaceVisibility = 'hidden';
      
      // Add custom attribute to indicate processing
      el.setAttribute('data-flow-fixed', 'true');
    }
  });
  
  // Find all nodes and edges and ensure they're visible
  const nodes = containerRef.current.querySelectorAll('.react-flow__node');
  const edges = containerRef.current.querySelectorAll('.react-flow__edge');
  
  nodes.forEach(node => {
    if (node instanceof HTMLElement) {
      node.style.opacity = '1';
      node.style.visibility = 'visible';
      node.style.display = 'block';
    }
  });
  
  edges.forEach(edge => {
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
}

/**
 * Apply fit view with enhanced error handling
 */
export function safelyFitView(instance: ReactFlowInstance | null, options = { padding: 0.2 }) {
  if (!instance) return false;
  
  try {
    // Execute in next animation frame for better stability
    requestAnimationFrame(() => {
      if (instance && typeof instance.fitView === 'function') {
        instance.fitView({
          padding: options.padding,
          includeHiddenNodes: true
        });
      }
    });
    return true;
  } catch (error) {
    console.warn('Error fitting ReactFlow view (suppressed):', error);
    return false;
  }
}