import { Node, Edge } from 'reactflow';

/**
 * Utility functions to optimize ReactFlow performance by reducing unnecessary calculations and re-renders
 */

/**
 * Creates a node position cache to quickly determine if nodes have moved
 * @param nodes - Array of ReactFlow nodes
 * @returns A cache object with node positions
 */
export function createNodePositionCache(nodes: Node[]) {
  const cache: Record<string, { x: number; y: number }> = {};
  
  nodes.forEach(node => {
    cache[node.id] = { 
      x: node.position.x, 
      y: node.position.y 
    };
  });
  
  return cache;
}

/**
 * Checks if node positions have changed compared to the cached positions
 * @param nodes - Current array of nodes
 * @param cache - Node position cache from createNodePositionCache
 * @returns Boolean indicating if any node position changed
 */
export function haveNodePositionsChanged(
  nodes: Node[],
  cache: Record<string, { x: number; y: number }>
): boolean {
  for (const node of nodes) {
    const cached = cache[node.id];
    if (!cached) return true;
    
    if (node.position.x !== cached.x || node.position.y !== cached.y) {
      return true;
    }
  }
  
  return false;
}

/**
 * Create stable edge objects with proper types to prevent unnecessary re-renders
 * @param edges - Array of edges to optimize
 * @returns Array of optimized edges
 */
export function optimizeEdges<EdgeData = any>(edges: Edge<EdgeData>[]): Edge<EdgeData>[] {
  return edges.map(edge => ({
    ...edge,
    // Ensure edge type is defined
    type: edge.type || 'default',
    // Ensure animated is a boolean value
    animated: !!edge.animated,
    // Ensure label is a string if present
    ...(edge.label ? { label: String(edge.label) } : {})
  }));
}

/**
 * Calculate the bounds of a set of nodes
 * @param nodes - Array of nodes to calculate bounds for
 * @returns Object containing the bounds information
 */
export function calculateNodesBounds(nodes: Node[]) {
  if (!nodes.length) {
    return { x: 0, y: 0, width: 0, height: 0, center: { x: 0, y: 0 } };
  }
  
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  
  // Use approximate node dimensions if not provided
  const defaultNodeWidth = 180;
  const defaultNodeHeight = 80;
  
  nodes.forEach(node => {
    const nodeWidth = (node.width || defaultNodeWidth);
    const nodeHeight = (node.height || defaultNodeHeight);
    
    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x + nodeWidth);
    maxY = Math.max(maxY, node.position.y + nodeHeight);
  });
  
  const width = maxX - minX;
  const height = maxY - minY;
  
  return {
    x: minX,
    y: minY,
    width,
    height,
    center: {
      x: minX + width / 2,
      y: minY + height / 2
    }
  };
}

/**
 * Generate edge key for memoization based on source, target and other properties
 * @param edge - Edge to create key for
 * @returns String key for the edge
 */
export function getEdgeKey(edge: Edge): string {
  return `${edge.source}-${edge.sourceHandle || ''}-${edge.target}-${edge.targetHandle || ''}-${edge.type || 'default'}-${edge.animated ? 1 : 0}`;
}

/**
 * Creates a stable comparison key for a set of edges
 * @param edges - Array of edges
 * @returns String representing the edges for comparison
 */
export function createEdgesComparisonKey(edges: Edge[]): string {
  return edges
    .map(edge => getEdgeKey(edge))
    .sort()
    .join('|');
}