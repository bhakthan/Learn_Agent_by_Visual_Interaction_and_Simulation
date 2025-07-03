/**
 * StableFlowUtils - Robust utilities for ReactFlow components
 * Provides enhanced stability for ReactFlow visualizations across the application
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Node, Edge, ReactFlowInstance, useReactFlow } from 'reactflow';
import { applyDomFixes } from '../reactFlowOptimization';

/**
 * Hook to create and maintain a stable flow container with reliable rendering
 */
export function useStableFlowContainer(options: {
  autoFitView?: boolean;
  stabilizationDelay?: number;
  autoResize?: boolean;
}) {
  const {
    autoFitView = true,
    stabilizationDelay = 500,
    autoResize = true
  } = options;

  // Container reference and ReactFlow instance
  const containerRef = useRef<HTMLDivElement>(null);
  const rfInstanceRef = useRef<ReactFlowInstance | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Set ReactFlow instance when available
  const onInit = useCallback((instance: ReactFlowInstance) => {
    rfInstanceRef.current = instance;
    setIsInitialized(true);
  }, []);

  // Apply stability fixes and fit view
  const stabilizeFlow = useCallback(() => {
    if (!containerRef.current) return;
    
    // Apply DOM fixes to ensure visibility
    applyDomFixes(containerRef.current);
    
    // Fit view if requested and instance available
    if (autoFitView && rfInstanceRef.current) {
      try {
        rfInstanceRef.current.fitView({
          padding: 0.2,
          includeHiddenNodes: true,
          duration: 200
        });
      } catch (error) {
        // Silent catch for fitView errors (common in ReactFlow)
      }
    }
  }, [autoFitView]);

  // Reset flow to stable state
  const resetFlow = useCallback(() => {
    if (!containerRef.current || !rfInstanceRef.current) return;
    
    // Apply full stabilization sequence
    const timers = [
      setTimeout(stabilizeFlow, 100),
      setTimeout(stabilizeFlow, 500),
      setTimeout(stabilizeFlow, 1000),
    ];
    
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [stabilizeFlow]);

  // Apply stability measures on mount and window resize
  useEffect(() => {
    // Initial stabilization
    const cleanup = resetFlow();
    
    // Handle window resize events
    const handleResize = () => {
      if (autoResize) {
        stabilizeFlow();
      }
    };
    
    // Apply with delay to ensure components are mounted
    const initialTimer = setTimeout(() => {
      stabilizeFlow();
    }, stabilizationDelay);
    
    // Listen for resize events
    if (autoResize) {
      window.addEventListener('resize', handleResize);
    }
    
    // Clean up
    return () => {
      if (cleanup) cleanup();
      clearTimeout(initialTimer);
      if (autoResize) {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, [stabilizeFlow, resetFlow, autoResize, stabilizationDelay]);

  // Manual fit view function for external use
  const fitView = useCallback(() => {
    if (rfInstanceRef.current) {
      try {
        rfInstanceRef.current.fitView({
          padding: 0.2,
          includeHiddenNodes: true,
          duration: 200
        });
      } catch (error) {
        // Silent catch
      }
    }
  }, []);

  return {
    containerRef,
    rfInstanceRef,
    isInitialized,
    onInit,
    stabilizeFlow,
    resetFlow,
    fitView
  };
}

/**
 * Creates enhanced nodes with stability optimizations
 */
export function createStableNodes<T = any>(nodes: Node<T>[]): Node<T>[] {
  if (!nodes || !Array.isArray(nodes)) return [];
  
  return nodes.map(node => ({
    ...node,
    // Enhanced stability properties
    style: {
      ...node.style,
      opacity: 1,
      visibility: 'visible',
      display: 'block',
      transform: 'translateZ(0)',
      backfaceVisibility: 'hidden',
      WebkitBackfaceVisibility: 'hidden',
      contain: 'layout',
      zIndex: 1,
    },
    // Default interaction settings
    draggable: node.draggable !== undefined ? node.draggable : true,
    selectable: node.selectable !== undefined ? node.selectable : true,
    connectable: node.connectable !== undefined ? node.connectable : false,
  }));
}

/**
 * Creates enhanced edges with stability optimizations
 */
export function createStableEdges<T = any>(edges: Edge<T>[]): Edge<T>[] {
  if (!edges || !Array.isArray(edges)) return [];
  
  return edges.map(edge => ({
    ...edge,
    // Enhanced visibility properties
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
 * Force renders all nodes in the flow to ensure visibility
 */
export function forceNodesVisible(reactFlowInstance: ReactFlowInstance | null) {
  if (!reactFlowInstance) return;
  
  try {
    // Update node internals to force rerender
    reactFlowInstance.getNodes().forEach(node => {
      reactFlowInstance.updateNodeInternals(node.id);
    });
    
    // Apply fit view to ensure everything is visible
    reactFlowInstance.fitView({
      padding: 0.2,
      includeHiddenNodes: true,
      duration: 200
    });
  } catch (error) {
    // Silent catch for ReactFlow errors
  }
}