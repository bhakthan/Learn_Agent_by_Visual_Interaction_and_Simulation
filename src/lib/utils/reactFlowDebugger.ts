/**
 * Debugging utilities for ReactFlow
 * These functions help diagnose and fix common issues with ReactFlow
 */

/**
 * Collect diagnostic information about ReactFlow instances
 */
export function diagnoseReactFlow() {
  // Get all ReactFlow containers
  const flowContainers = document.querySelectorAll('[data-flow-container], .react-flow');
  
  console.group('ReactFlow Diagnostics');
  console.log(`Found ${flowContainers.length} ReactFlow containers`);
  
  // Check for each container
  flowContainers.forEach((container, index) => {
    if (container instanceof HTMLElement) {
      const viewport = container.querySelector('.react-flow__viewport');
      const nodes = container.querySelectorAll('.react-flow__node');
      const edges = container.querySelectorAll('.react-flow__edge');
      
      console.group(`Flow Container #${index + 1}`);
      console.log('Container size:', `${container.offsetWidth}x${container.offsetHeight}`);
      console.log('Nodes found:', nodes.length);
      console.log('Edges found:', edges.length);
      console.log('Viewport found:', !!viewport);
      
      // Check for potential issues
      const issues = [];
      
      if (container.offsetWidth < 100 || container.offsetHeight < 100) {
        issues.push('Container may be too small');
      }
      
      if (nodes.length === 0) {
        issues.push('No nodes found');
      } else {
        // Check if nodes are visible
        const hiddenNodes = Array.from(nodes).filter(node => {
          if (node instanceof HTMLElement) {
            const style = window.getComputedStyle(node);
            return style.opacity === '0' || style.visibility === 'hidden' || style.display === 'none';
          }
          return false;
        });
        
        if (hiddenNodes.length > 0) {
          issues.push(`${hiddenNodes.length} nodes may be hidden`);
        }
      }
      
      if (issues.length > 0) {
        console.warn('Potential issues:', issues);
      } else {
        console.log('No obvious issues detected');
      }
      
      console.groupEnd();
    }
  });
  
  console.groupEnd();
}

/**
 * Force all ReactFlow elements to be visible
 */
export function fixReactFlowVisibility() {
  // Force all nodes to be visible
  document.querySelectorAll('.react-flow__node').forEach(node => {
    if (node instanceof HTMLElement) {
      node.style.opacity = '1';
      node.style.visibility = 'visible';
      node.style.display = 'block';
      node.style.transform = 'translateZ(0)';
      node.style.zIndex = '1';
    }
  });
  
  // Force all edges to be visible
  document.querySelectorAll('.react-flow__edge').forEach(edge => {
    if (edge instanceof HTMLElement) {
      edge.style.opacity = '1';
      edge.style.visibility = 'visible';
    }
  });
  
  // Fix edge paths
  document.querySelectorAll('.react-flow__edge-path').forEach(path => {
    if (path instanceof SVGElement) {
      path.style.strokeWidth = path.style.strokeWidth || '1.5px';
      path.style.opacity = '1';
      path.style.visibility = 'visible';
    }
  });
  
  console.log('ReactFlow visibility fixed');
}

/**
 * Print ReactFlow instance information
 */
export function getReactFlowStatus(reactFlowInstance: any) {
  if (!reactFlowInstance) {
    console.warn('ReactFlow instance not provided');
    return;
  }
  
  try {
    const nodes = reactFlowInstance.getNodes();
    const edges = reactFlowInstance.getEdges();
    const viewport = reactFlowInstance.getViewport();
    
    console.group('ReactFlow Status');
    console.log('Nodes:', nodes.length);
    console.log('Edges:', edges.length);
    console.log('Viewport:', viewport);
    console.groupEnd();
    
    return { nodes, edges, viewport };
  } catch (e) {
    console.error('Error getting ReactFlow status:', e);
  }
}

/**
 * Make all debugging functions available globally for console access
 */
export function exposeReactFlowDebugTools() {
  (window as any).reactFlowDebug = {
    diagnose: diagnoseReactFlow,
    fix: fixReactFlowVisibility,
    forceShow: () => window.forceShowReactFlowNodes()
  };
  
  console.log('ReactFlow debug tools available at window.reactFlowDebug');
}

export default {
  diagnoseReactFlow,
  fixReactFlowVisibility,
  getReactFlowStatus,
  exposeReactFlowDebugTools
};