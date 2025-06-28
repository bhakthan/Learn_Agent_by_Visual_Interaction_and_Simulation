import { useMemo, useCallback } from 'react';
import { Node, Edge } from 'reactflow';

/**
 * Custom hook to optimize flow data processing for ReactFlow components
 * Provides memoized functions and calculations to prevent unnecessary re-renders
 */
export function useFlowOptimization(nodes: Node[], edges: Edge[]) {
  // Memoized filtered node types
  const nodeTypes = useMemo(() => {
    return Array.from(new Set(nodes.map(node => node.data?.nodeType))).filter(Boolean);
  }, [nodes]);
  
  // Memoized source-target connections
  const connections = useMemo(() => {
    return edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label
    }));
  }, [edges]);
  
  // Memoized edge points calculator with caching
  const edgePointsCache = useMemo(() => new Map<string, {
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
  }>(), []);
  
  const getEdgePoints = useCallback((edgeId: string) => {
    // Return from cache if exists to avoid recalculation
    if (edgePointsCache.has(edgeId)) {
      return edgePointsCache.get(edgeId);
    }
    
    const edge = edges.find(e => e.id === edgeId);
    if (!edge) return null;
    
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    
    if (!sourceNode || !targetNode) return null;
    
    // Default dimensions for nodes - adjust based on your actual node sizes
    const nodeWidth = 180;
    const nodeHeight = 80;
    
    // Calculate center points of nodes
    const sourceX = sourceNode.position.x + (nodeWidth / 2);
    const sourceY = sourceNode.position.y + (nodeHeight / 2);
    const targetX = targetNode.position.x;
    const targetY = targetNode.position.y + (nodeHeight / 2);
    
    const points = { sourceX, sourceY, targetX, targetY };
    
    // Store in cache for future lookups
    edgePointsCache.set(edgeId, points);
    
    return points;
  }, [nodes, edges, edgePointsCache]);
  
  // Clear cache when nodes/edges change significantly
  const clearCache = useCallback(() => {
    edgePointsCache.clear();
  }, [edgePointsCache]);
  
  // Helper to detect meaningful node changes
  const hasNodePositionsChanged = useCallback((prevNodes: Node[], currentNodes: Node[]) => {
    if (prevNodes.length !== currentNodes.length) return true;
    
    for (let i = 0; i < prevNodes.length; i++) {
      const prev = prevNodes[i];
      const current = currentNodes[i];
      
      if (prev.id !== current.id) return true;
      if (prev.position.x !== current.position.x) return true;
      if (prev.position.y !== current.position.y) return true;
    }
    
    return false;
  }, []);
  
  // Optimize edges for rendering
  const optimizedEdges = useMemo(() => {
    return edges.map(edge => ({
      ...edge,
      // Use type annotations for better performance
      type: edge.type || 'default',
      // Ensure animated is boolean
      animated: !!edge.animated
    }));
  }, [edges]);
  
  return {
    nodeTypes,
    connections,
    getEdgePoints,
    clearCache,
    hasNodePositionsChanged,
    optimizedEdges
  };
}