import { Node, Edge, Viewport } from 'reactflow';

/**
 * Utilities for adaptive node positioning to prevent layout shifts
 */

// Default spacing between nodes
const DEFAULT_NODE_SPACING = 150;

// Calculate optimal node positions based on viewport size and node count
export function calculateAdaptivePositions<T = any>(
  nodes: Node<T>[],
  containerWidth: number,
  containerHeight: number,
  options: {
    padding?: number;
    spacing?: number;
    nodeWidth?: number;
    nodeHeight?: number;
    preserveRelativePositions?: boolean;
  } = {}
): Node<T>[] {
  // Default options
  const {
    padding = 50,
    spacing = DEFAULT_NODE_SPACING,
    nodeWidth = 200,
    nodeHeight = 100,
    preserveRelativePositions = true
  } = options;
  
  // If no nodes, return empty array
  if (!nodes.length) return [];
  
  // If preserve relative positions and we have existing positions
  if (preserveRelativePositions && nodes.every(node => node.position.x !== undefined && node.position.y !== undefined)) {
    // Find min and max positions
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    
    nodes.forEach(node => {
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + (node.width || nodeWidth));
      maxY = Math.max(maxY, node.position.y + (node.height || nodeHeight));
    });
    
    // Calculate current bounds
    const currentWidth = maxX - minX;
    const currentHeight = maxY - minY;
    
    // Calculate scale factors to fit within container
    const availableWidth = containerWidth - (padding * 2);
    const availableHeight = containerHeight - (padding * 2);
    
    const scaleX = currentWidth > availableWidth ? availableWidth / currentWidth : 1;
    const scaleY = currentHeight > availableHeight ? availableHeight / currentHeight : 1;
    
    // Use the smaller scale to maintain aspect ratio
    const scale = Math.min(scaleX, scaleY, 1); // Don't scale up if not needed
    
    // Calculate offset to center
    const offsetX = (containerWidth - (currentWidth * scale)) / 2 - (minX * scale);
    const offsetY = (containerHeight - (currentHeight * scale)) / 2 - (minY * scale);
    
    // Apply scaling and offset to all nodes
    return nodes.map(node => ({
      ...node,
      position: {
        x: node.position.x * scale + offsetX,
        y: node.position.y * scale + offsetY
      }
    }));
  }
  
  // Otherwise, calculate positions using automatic layout
  // Determine grid dimensions based on number of nodes
  const nodeCount = nodes.length;
  let cols = Math.ceil(Math.sqrt(nodeCount));
  let rows = Math.ceil(nodeCount / cols);
  
  // Adjust if the container is very wide or very narrow
  const aspectRatio = containerWidth / containerHeight;
  if (aspectRatio > 1.5) { // Wide container
    cols = Math.ceil(Math.sqrt(nodeCount * aspectRatio));
    rows = Math.ceil(nodeCount / cols);
  } else if (aspectRatio < 0.67) { // Tall container
    rows = Math.ceil(Math.sqrt(nodeCount / aspectRatio));
    cols = Math.ceil(nodeCount / rows);
  }
  
  // Calculate spacing to fill the container
  const availableWidth = containerWidth - (padding * 2);
  const availableHeight = containerHeight - (padding * 2);
  
  const horizontalSpacing = Math.min(spacing, availableWidth / cols);
  const verticalSpacing = Math.min(spacing, availableHeight / rows);
  
  // Create new positioned nodes
  return nodes.map((node, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    
    // Calculate position
    const x = padding + col * horizontalSpacing;
    const y = padding + row * verticalSpacing;
    
    return {
      ...node,
      position: { x, y }
    };
  });
}

/**
 * Optimize edge paths for the current layout
 */
export function optimizeEdgePaths<T = any>(
  nodes: Node<T>[],
  edges: Edge[],
  options: {
    avoidOverlap?: boolean;
    smoothFactor?: number;
  } = {}
): Edge[] {
  const { avoidOverlap = true, smoothFactor = 0.5 } = options;
  
  // Create position lookup by node id
  const nodePositions: Record<string, { x: number; y: number; width?: number; height?: number }> = {};
  nodes.forEach(node => {
    nodePositions[node.id] = {
      x: node.position.x,
      y: node.position.y,
      width: node.width,
      height: node.height
    };
  });
  
  // Optimize each edge
  return edges.map(edge => {
    // If source or target node doesn't exist, return edge unchanged
    if (!nodePositions[edge.source] || !nodePositions[edge.target]) {
      return edge;
    }
    
    // Get source and target positions
    const source = nodePositions[edge.source];
    const target = nodePositions[edge.target];
    
    // If avoidOverlap is enabled and we have nodes in between
    if (avoidOverlap) {
      // Calculate center points
      const sourceCenter = {
        x: source.x + (source.width || 0) / 2,
        y: source.y + (source.height || 0) / 2
      };
      const targetCenter = {
        x: target.x + (target.width || 0) / 2,
        y: target.y + (target.height || 0) / 2
      };
      
      // Find if there are nodes between source and target
      const nodesInBetween = Object.entries(nodePositions)
        .filter(([id]) => id !== edge.source && id !== edge.target)
        .filter(([_, pos]) => {
          const nodeCenter = {
            x: pos.x + (pos.width || 0) / 2,
            y: pos.y + (pos.height || 0) / 2
          };
          
          // Check if node is in the bounding box between source and target
          const minX = Math.min(sourceCenter.x, targetCenter.x);
          const maxX = Math.max(sourceCenter.x, targetCenter.x);
          const minY = Math.min(sourceCenter.y, targetCenter.y);
          const maxY = Math.max(sourceCenter.y, targetCenter.y);
          
          return (
            nodeCenter.x > minX - 10 &&
            nodeCenter.x < maxX + 10 &&
            nodeCenter.y > minY - 10 &&
            nodeCenter.y < maxY + 10
          );
        });
      
      // If nodes are in between, add a curve to the edge
      if (nodesInBetween.length > 0) {
        return {
          ...edge,
          type: 'smoothstep', // Use smoothstep for nice curves
          animated: edge.animated, // Keep animation if it exists
        };
      }
    }
    
    // For direct connections, keep it simple
    return edge;
  });
}

/**
 * Determine optimal zoom level based on node count and container size
 */
export function calculateOptimalZoom(
  nodes: Node[],
  containerWidth: number,
  containerHeight: number,
  options: {
    padding?: number;
    minZoom?: number;
    maxZoom?: number;
  } = {}
): number {
  const { padding = 50, minZoom = 0.5, maxZoom = 2 } = options;
  
  if (!nodes.length) return 1;
  
  // Find the bounding box of all nodes
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  
  nodes.forEach(node => {
    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x + (node.width || 200));
    maxY = Math.max(maxY, node.position.y + (node.height || 100));
  });
  
  // Calculate the content dimensions
  const contentWidth = maxX - minX + (padding * 2);
  const contentHeight = maxY - minY + (padding * 2);
  
  // Calculate zoom factors for width and height
  const zoomX = containerWidth / contentWidth;
  const zoomY = containerHeight / contentHeight;
  
  // Use the smaller zoom factor to ensure everything fits
  let zoom = Math.min(zoomX, zoomY);
  
  // Clamp to min/max zoom
  zoom = Math.min(Math.max(zoom, minZoom), maxZoom);
  
  return zoom;
}

/**
 * Calculate optimal viewport to show all nodes
 */
export function calculateOptimalViewport(
  nodes: Node[],
  containerWidth: number,
  containerHeight: number,
  options: {
    padding?: number;
    minZoom?: number;
    maxZoom?: number;
  } = {}
): Viewport {
  if (!nodes.length) {
    return { x: 0, y: 0, zoom: 1 };
  }
  
  const { padding = 50 } = options;
  
  // Find the bounding box of all nodes
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  
  nodes.forEach(node => {
    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x + (node.width || 200));
    maxY = Math.max(maxY, node.position.y + (node.height || 100));
  });
  
  // Calculate optimal zoom
  const zoom = calculateOptimalZoom(nodes, containerWidth, containerHeight, options);
  
  // Calculate the center of the content
  const contentCenterX = (minX + maxX) / 2;
  const contentCenterY = (minY + maxY) / 2;
  
  // Calculate viewport position to center the content
  const x = (containerWidth / 2) - (contentCenterX * zoom);
  const y = (containerHeight / 2) - (contentCenterY * zoom);
  
  return { x, y, zoom };
}

/**
 * Adjust layout when container size changes
 */
export function adaptLayoutToContainerSize(
  nodes: Node[],
  edges: Edge[],
  containerWidth: number,
  containerHeight: number,
  options = {}
) {
  // First adjust node positions
  const adaptedNodes = calculateAdaptivePositions(nodes, containerWidth, containerHeight, options);
  
  // Then optimize edge paths for the new layout
  const adaptedEdges = optimizeEdgePaths(adaptedNodes, edges, options);
  
  // Return both
  return { nodes: adaptedNodes, edges: adaptedEdges };
}

/**
 * Class to manage adaptive node positioning with memory of previous layouts
 */
export class AdaptiveLayoutManager {
  private originalLayout: { nodes: Node[]; edges: Edge[] } | null = null;
  private currentLayout: { nodes: Node[]; edges: Edge[] } | null = null;
  private previousContainerSize: { width: number; height: number } | null = null;
  
  /**
   * Store original layout for reference
   */
  setOriginalLayout(nodes: Node[], edges: Edge[]) {
    // Deep clone to avoid reference issues
    this.originalLayout = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges))
    };
    
    // Initialize current layout
    this.currentLayout = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges))
    };
  }
  
  /**
   * Update layout when container size changes
   */
  updateLayout(
    containerWidth: number,
    containerHeight: number,
    options = {}
  ) {
    // Skip if no layout stored or no change in container size
    if (!this.currentLayout) return null;
    
    if (
      this.previousContainerSize &&
      Math.abs(this.previousContainerSize.width - containerWidth) < 10 &&
      Math.abs(this.previousContainerSize.height - containerHeight) < 10
    ) {
      return this.currentLayout;
    }
    
    // Update container size
    this.previousContainerSize = { width: containerWidth, height: containerHeight };
    
    // Adapt layout to new container size
    const { nodes, edges } = adaptLayoutToContainerSize(
      this.currentLayout.nodes,
      this.currentLayout.edges,
      containerWidth,
      containerHeight,
      options
    );
    
    // Update current layout
    this.currentLayout = { nodes, edges };
    
    return this.currentLayout;
  }
  
  /**
   * Reset to original layout
   */
  resetLayout() {
    if (this.originalLayout) {
      this.currentLayout = {
        nodes: JSON.parse(JSON.stringify(this.originalLayout.nodes)),
        edges: JSON.parse(JSON.stringify(this.originalLayout.edges))
      };
    }
    return this.currentLayout;
  }
  
  /**
   * Get current layout
   */
  getCurrentLayout() {
    return this.currentLayout;
  }
}