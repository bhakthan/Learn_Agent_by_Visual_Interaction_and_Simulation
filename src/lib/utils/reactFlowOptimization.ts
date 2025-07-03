/**
 * Comprehensive ReactFlow optimization utilities
 * This module contains utilities to ensure stable ReactFlow rendering across the application
 */
import type { Node, Edge, ReactFlowInstance } from 'reactflow';

/**
 * Optimize ReactFlow node rendering
 * Ensures all nodes have consistent visibility and style properties
 */
export function optimizeNodes<T = any>(nodes: Node<T>[]): Node<T>[] {
  if (!nodes || !Array.isArray(nodes)) return [];
  
  return nodes.map(node => ({
    ...node,
    // Ensure node is visible
    style: {
      ...node.style,
      opacity: 1,
      visibility: 'visible',
      display: 'block',
      transform: 'translateZ(0)',
      backfaceVisibility: 'hidden',
      WebkitBackfaceVisibility: 'hidden',
      contain: 'layout',
    },
    // Set default interaction properties
    draggable: node.draggable !== undefined ? node.draggable : true,
    selectable: node.selectable !== undefined ? node.selectable : true,
    connectable: node.connectable !== undefined ? node.connectable : false,
  }));
}

/**
 * Optimize ReactFlow edge rendering
 * Ensures all edges have consistent visibility and style properties
 */
export function optimizeEdges<T = any>(edges: Edge<T>[]): Edge<T>[] {
  if (!edges || !Array.isArray(edges)) return [];
  
  return edges.map(edge => ({
    ...edge,
    // Ensure edge is visible
    style: {
      ...edge.style,
      opacity: 1,
      visibility: 'visible',
      strokeWidth: edge.style?.strokeWidth || 1.5,
    },
    // Ensure animated property is explicitly set
    animated: edge.animated !== undefined ? edge.animated : false,
  }));
}

/**
 * Force render stability in ReactFlow
 * @param reactFlowInstance The ReactFlow instance to optimize
 * @param nodeIds Optional array of node IDs to update
 */
export function forceRenderStability(
  reactFlowInstance: ReactFlowInstance | null | undefined,
  nodeIds?: string[]
): void {
  if (!reactFlowInstance) return;
  
  try {
    // Force a delayed fitView for better layout
    setTimeout(() => {
      try {
        if (typeof reactFlowInstance.fitView === 'function') {
          reactFlowInstance.fitView({
            padding: 0.2,
            includeHiddenNodes: true,
            duration: 200
          });
        }
      } catch (e) {
        // Silently ignore fitView errors
      }
    }, 200);
    
    // Update node internals to force rerender
    if (typeof reactFlowInstance.updateNodeInternals === 'function') {
      // If specific node IDs are provided, only update those
      const idsToUpdate = nodeIds || 
        (reactFlowInstance.getNodes ? reactFlowInstance.getNodes().map(n => n.id) : []);
      
      idsToUpdate.forEach(id => {
        try {
          reactFlowInstance.updateNodeInternals(id);
        } catch (e) {
          // Silently ignore individual node errors
        }
      });
    }
  } catch (e) {
    console.debug('Error in forceRenderStability (suppressed)');
  }
}

/**
 * Apply fixes to ReactFlow DOM elements
 * @param containerElement The container element to fix
 */
export function applyDomFixes(containerElement: HTMLElement | null): void {
  if (!containerElement) return;
  
  try {
    // Force visibility on ReactFlow elements
    const flowElements = containerElement.querySelectorAll('.react-flow, .react-flow__viewport');
    flowElements.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.transform = 'translateZ(0)';
        el.style.visibility = 'visible';
        el.style.opacity = '1';
        el.style.contain = 'layout';
        
        // Ensure viewport has explicit positioning
        if (el.classList.contains('react-flow__viewport')) {
          el.style.position = 'absolute';
          el.style.left = '0';
          el.style.top = '0';
          el.style.width = '100%';
          el.style.height = '100%';
          el.style.transformOrigin = '0 0';
        }
      }
    });
    
    // Force nodes to be visible
    const nodes = containerElement.querySelectorAll('.react-flow__node');
    nodes.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.opacity = '1';
        el.style.visibility = 'visible';
        el.style.transform = 'translateZ(0)';
        el.style.contain = 'layout';
        el.style.zIndex = '1';
      }
    });
    
    // Force edges to be visible
    const edges = containerElement.querySelectorAll('.react-flow__edge');
    edges.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.opacity = '1';
        el.style.visibility = 'visible';
      }
    });
    
    // Ensure edge paths are visible
    const edgePaths = containerElement.querySelectorAll('.react-flow__edge-path');
    edgePaths.forEach(path => {
      if (path instanceof SVGElement) {
        path.style.strokeWidth = path.style.strokeWidth || '1.5px';
        path.style.opacity = '1';
        path.style.visibility = 'visible';
      }
    });
  } catch (e) {
    console.debug('Error applying DOM fixes (suppressed)');
  }
}

/**
 * Create a debounced function
 * @param fn Function to debounce
 * @param delay Delay in milliseconds
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T, 
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return function(...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * A safe way to update ReactFlow nodes with proper memoization
 * @param setNodes The React state setter for nodes
 * @param nodeId The ID of the node to update
 * @param updater Function that returns the updates to apply
 */
export function safeUpdateNode<T = any>(
  setNodes: React.Dispatch<React.SetStateAction<Node<T>[]>>,
  nodeId: string,
  updater: (node: Node<T>) => Partial<Node<T>>
): void {
  setNodes(nodes => {
    return nodes.map(node => {
      if (node.id !== nodeId) return node;
      return {
        ...node,
        ...updater(node)
      };
    });
  });
}