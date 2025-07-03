/**
 * Utilities to fix common ReactFlow rendering issues
 */

import { Node, Edge } from 'reactflow';

/**
 * Force all nodes to be visible
 * @param nodes ReactFlow nodes
 * @returns Updated nodes with visibility styles
 */
export function forceNodesVisible(nodes: Node[]): Node[] {
  return nodes.map(node => ({
    ...node,
    style: {
      ...(node.style || {}),
      visibility: 'visible',
      opacity: 1,
      display: 'block',
      transform: 'translateZ(0)',
      backfaceVisibility: 'hidden',
    }
  }));
}

/**
 * Force edges to be visible
 * @param edges ReactFlow edges
 * @returns Updated edges with visibility styles
 */
export function forceEdgesVisible(edges: Edge[]): Edge[] {
  return edges.map(edge => ({
    ...edge,
    style: {
      ...(edge.style || {}),
      visibility: 'visible',
      opacity: 1
    }
  }));
}

/**
 * Fix ReactFlow rendering issues
 * @param containerRef Reference to the ReactFlow container
 */
export function fixReactFlowRendering(containerRef: React.RefObject<HTMLDivElement>) {
  if (!containerRef.current) return;
  
  // Force all ReactFlow elements to be visible
  const reactFlowViewport = containerRef.current.querySelector('.react-flow__viewport');
  if (reactFlowViewport instanceof HTMLElement) {
    reactFlowViewport.style.transform = 'translateZ(0)';
    reactFlowViewport.style.backfaceVisibility = 'hidden';
    reactFlowViewport.style.webkitBackfaceVisibility = 'hidden';
  }
  
  // Fix nodes visibility
  const nodes = containerRef.current.querySelectorAll('.react-flow__node');
  nodes.forEach(node => {
    if (node instanceof HTMLElement) {
      node.style.visibility = 'visible';
      node.style.opacity = '1';
      node.style.display = 'block';
      node.style.transform = 'translateZ(0)';
    }
  });
  
  // Fix edges visibility
  const edges = containerRef.current.querySelectorAll('.react-flow__edge');
  edges.forEach(edge => {
    if (edge instanceof HTMLElement) {
      edge.style.visibility = 'visible';
      edge.style.opacity = '1';
      
      // Fix edge paths
      const paths = edge.querySelectorAll('path');
      paths.forEach(path => {
        path.setAttribute('stroke-width', '1.5');
        path.setAttribute('opacity', '1');
        path.setAttribute('visibility', 'visible');
      });
    }
  });
  
  // Force reflow for reactflow
  const reactFlowContainer = containerRef.current.querySelector('.react-flow');
  if (reactFlowContainer instanceof HTMLElement) {
    // Force recalculation
    const displayStyle = reactFlowContainer.style.display;
    reactFlowContainer.style.display = 'none';
    void reactFlowContainer.offsetHeight;
    reactFlowContainer.style.display = displayStyle;
  }
}

/**
 * Reset ReactFlow rendering to fix layout issues
 * @param containerRef Reference to the ReactFlow container
 */
export function resetReactFlowRendering(containerRef: React.RefObject<HTMLDivElement>) {
  if (!containerRef.current) return;
  
  // First fix visibility issues
  fixReactFlowRendering(containerRef);
  
  // Then trigger additional fixes
  setTimeout(() => {
    // Trigger resize event to force ReactFlow to recalculate layout
    window.dispatchEvent(new Event('resize'));
    
    // Force hardware acceleration on container
    containerRef.current!.style.transform = 'translateZ(0)';
    containerRef.current!.style.backfaceVisibility = 'hidden';
    containerRef.current!.style.webkitBackfaceVisibility = 'hidden';
    
    // Apply additional fixes to ReactFlow elements
    fixReactFlowRendering(containerRef);
  }, 50);
}

export default {
  forceNodesVisible,
  forceEdgesVisible,
  fixReactFlowRendering,
  resetReactFlowRendering
};