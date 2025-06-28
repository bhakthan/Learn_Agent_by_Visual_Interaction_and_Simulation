import { useMemo } from 'react';
import { Node, Edge, XYPosition } from 'reactflow';

// Type definitions
interface FlowLayout {
  nodes: Node[];
  edges: Edge[];
}

interface FlowCalculationOptions {
  nodeWidth?: number;
  nodeHeight?: number;
  nodePadding?: number;
  direction?: 'horizontal' | 'vertical';
  spacing?: {
    horizontal?: number;
    vertical?: number;
  };
}

// Cache for flow calculations to prevent expensive recalculations
const flowLayoutCache = new Map<string, { layout: FlowLayout; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute cache lifetime

/**
 * Calculate ReactFlow node positions with auto-layout
 * This function can be expensive, so results are cached
 */
export function calculateFlowLayout(
  nodes: Node[],
  edges: Edge[],
  options: FlowCalculationOptions = {}
): FlowLayout {
  // Generate cache key based on input
  const cacheKey = JSON.stringify({
    nodeIds: nodes.map(node => node.id).sort(),
    edgeConnections: edges.map(edge => `${edge.source}-${edge.target}`).sort(),
    options
  });
  
  // Check cache
  const now = Date.now();
  const cached = flowLayoutCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.layout;
  }
  
  // Default options
  const {
    nodeWidth = 180,
    nodeHeight = 80,
    nodePadding = 40,
    direction = 'horizontal',
    spacing = { horizontal: 100, vertical: 80 }
  } = options;
  
  const hSpacing = spacing.horizontal ?? 100;
  const vSpacing = spacing.vertical ?? 80;
  
  // Create a copy of nodes for manipulation
  const calculatedNodes = [...nodes].map(node => ({ ...node }));
  
  // Build a graph representation
  const graph = new Map<string, { 
    node: Node; 
    level?: number; 
    position?: number;
    inEdges: Edge[];
    outEdges: Edge[];
  }>();
  
  // Initialize the graph with nodes
  calculatedNodes.forEach(node => {
    graph.set(node.id, { 
      node, 
      inEdges: [], 
      outEdges: [] 
    });
  });
  
  // Add edges to the graph
  edges.forEach(edge => {
    const sourceNode = graph.get(edge.source);
    const targetNode = graph.get(edge.target);
    
    if (sourceNode) sourceNode.outEdges.push(edge);
    if (targetNode) targetNode.inEdges.push(edge);
  });
  
  // Find root nodes (no incoming edges)
  const rootNodeIds = [...graph.keys()].filter(
    nodeId => graph.get(nodeId)?.inEdges.length === 0
  );
  
  // Calculate levels using BFS
  const queue = rootNodeIds.map(id => ({ id, level: 0 }));
  const visited = new Set<string>();
  
  while (queue.length > 0) {
    const { id, level } = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    
    const nodeData = graph.get(id);
    if (!nodeData) continue;
    
    nodeData.level = level;
    
    // Add child nodes to the queue
    nodeData.outEdges.forEach(edge => {
      queue.push({ id: edge.target, level: level + 1 });
    });
  }
  
  // Group nodes by level
  const nodesByLevel = new Map<number, string[]>();
  graph.forEach((data, nodeId) => {
    const level = data.level ?? 0;
    if (!nodesByLevel.has(level)) {
      nodesByLevel.set(level, []);
    }
    nodesByLevel.get(level)!.push(nodeId);
  });
  
  // Calculate positions for each level
  const levels = Array.from(nodesByLevel.keys()).sort((a, b) => a - b);
  
  levels.forEach(level => {
    const nodesInLevel = nodesByLevel.get(level) || [];
    
    // Assign position within level
    nodesInLevel.forEach((nodeId, position) => {
      const nodeData = graph.get(nodeId);
      if (nodeData) {
        nodeData.position = position;
      }
    });
    
    // Calculate coordinates
    nodesInLevel.forEach(nodeId => {
      const nodeData = graph.get(nodeId);
      if (!nodeData || nodeData.position === undefined) return;
      
      const node = nodeData.node;
      const position: XYPosition = { x: 0, y: 0 };
      
      if (direction === 'horizontal') {
        position.x = level * (nodeWidth + hSpacing);
        position.y = nodeData.position * (nodeHeight + vSpacing);
      } else {
        position.x = nodeData.position * (nodeWidth + hSpacing);
        position.y = level * (nodeHeight + vSpacing);
      }
      
      // Apply padding
      position.x += nodePadding;
      position.y += nodePadding;
      
      node.position = position;
    });
  });
  
  const result = {
    nodes: calculatedNodes,
    edges: edges
  };
  
  // Cache the result
  flowLayoutCache.set(cacheKey, {
    layout: result,
    timestamp: now
  });
  
  return result;
}

/**
 * React hook to memoize flow layout calculations
 * Only recalculates when inputs change significantly
 */
export function useFlowLayout(
  nodes: Node[],
  edges: Edge[],
  options?: FlowCalculationOptions
): FlowLayout {
  return useMemo(() => calculateFlowLayout(nodes, edges, options), [
    // Generate a stable dependency array based on node IDs and edge connections
    JSON.stringify(nodes.map(n => n.id).sort()),
    JSON.stringify(edges.map(e => `${e.source}-${e.target}`).sort()),
    JSON.stringify(options)
  ]);
}

/**
 * ResizeObserver utilities for ReactFlow components
 */

/**
 * Configure a safer ResizeObserver specifically for ReactFlow
 * Call this in your ReactFlow components to set up error-resistant resize handling
 */
export function setupSafeReactFlowResizeHandler(container: HTMLElement | null) {
  if (!container) return null;
  
  // Track resize state to prevent excessive updates
  let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
  let animationFrameId: number | null = null;
  let isResizing = false;
  
  // Create ResizeObserver with enhanced error handling
  const observer = new ResizeObserver(entries => {
    // Skip if we're already processing to avoid loops
    if (isResizing) return;
    
    isResizing = true;
    
    // Clear existing timeouts
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
    
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    
    // Debounce resize events
    resizeTimeout = setTimeout(() => {
      animationFrameId = requestAnimationFrame(() => {
        try {
          // Dispatch a custom event that can be handled by ReactFlow components
          // but with reduced frequency
          const event = new CustomEvent('safe-flow-resize', { detail: entries });
          container.dispatchEvent(event);
        } catch (error) {
          // Silently handle any errors
        } finally {
          // Reset flags after a short delay to prevent immediate re-triggering
          setTimeout(() => {
            isResizing = false;
            animationFrameId = null;
            resizeTimeout = null;
          }, 100);
        }
      });
    }, 250); // Substantial debounce to avoid rapid firing
  });
  
  // Start observing the container
  observer.observe(container);
  
  // Return a cleanup function that can be used in useEffect
  return () => {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    observer.disconnect();
  };
}

/**
 * Safely catch ResizeObserver errors specifically for ReactFlow components
 * This adds an additional layer of protection on top of global handling
 */
export function setupReactFlowErrorHandling() {
  // Only run in browser environment
  if (typeof window === 'undefined') return;
  
  // Only set up once
  if ((window as any).__reactFlowErrorHandlerAdded) return;
  
  // Flag ReactFlow errors differently to allow selective handling
  const originalHandleError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    if (typeof message === 'string' && message.includes('ResizeObserver')) {
      // Check if it's from a ReactFlow component
      if (source && (
        source.includes('react-flow') || 
        source.includes('reactflow') ||
        document.activeElement?.closest('.react-flow')
      )) {
        // Mark as ReactFlow error and suppress
        (error as any).__reactFlowError = true;
        return true; // Prevents default handling
      }
    }
    
    // Forward to original handler
    if (originalHandleError) {
      return originalHandleError.call(window, message, source, lineno, colno, error);
    }
    
    return false;
  };
  
  (window as any).__reactFlowErrorHandlerAdded = true;
}

/**
 * Get connected nodes from a given node
 */
export function getConnectedNodes(
  nodeId: string, 
  nodes: Node[], 
  edges: Edge[],
  direction: 'incoming' | 'outgoing' | 'both' = 'both'
): Node[] {
  const connectedNodeIds = new Set<string>();
  
  edges.forEach(edge => {
    if (direction === 'outgoing' || direction === 'both') {
      if (edge.source === nodeId) {
        connectedNodeIds.add(edge.target);
      }
    }
    
    if (direction === 'incoming' || direction === 'both') {
      if (edge.target === nodeId) {
        connectedNodeIds.add(edge.source);
      }
    }
  });
  
  // Return the connected nodes
  return nodes.filter(node => connectedNodeIds.has(node.id));
}

/**
 * Optimize the flow layout for display
 */
export function optimizeFlowLayout(
  nodes: Node[],
  options: {
    scale?: number;
    offsetX?: number;
    offsetY?: number;
  } = {}
): Node[] {
  const { scale = 1, offsetX = 0, offsetY = 0 } = options;
  
  // Create a copy of nodes with adjusted positions
  return nodes.map(node => ({
    ...node,
    position: {
      x: node.position.x * scale + offsetX,
      y: node.position.y * scale + offsetY
    }
  }));
}