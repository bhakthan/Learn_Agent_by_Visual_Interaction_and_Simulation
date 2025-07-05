/**
 * StableFlowUtils - Utilities for creating stable ReactFlow visualizations
 * 
 * This file contains various utilities to create stable, reliable ReactFlow visualizations
 * with proper rendering, positioning, and error handling.
 */
import { Node, Edge, useReactFlow } from 'reactflow';
import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Creates stable nodes that are less prone to rendering issues
 */
export function createStableNodes(nodes: Node[]): Node[] {
  if (!nodes || !Array.isArray(nodes)) return [];
  
  return nodes.map(node => ({
    ...node,
    // Ensure node has required properties for stable rendering
    style: {
      ...node.style,
      opacity: 1,
      visibility: 'visible',
      transform: 'translateZ(0)',
      backfaceVisibility: 'hidden',
      WebkitBackfaceVisibility: 'hidden',
      contain: 'layout',
      zIndex: 1,
    },
    // Ensure node has proper position - preserve original positions including (0,0)
    position: {
      x: node.position?.x !== undefined ? node.position.x : 0,
      y: node.position?.y !== undefined ? node.position.y : 0
    },
    // Add additional props for stability
    data: {
      ...node.data,
      stableRendering: true,
    }
  }));
}

/**
 * Creates stable edges that are less prone to rendering issues
 */
export function createStableEdges(edges: Edge[]): Edge[] {
  if (!edges || !Array.isArray(edges)) return [];
  
  return edges.map(edge => ({
    ...edge,
    // Add styling for visibility
    style: {
      ...edge.style,
      opacity: 1,
      visibility: 'visible',
      strokeWidth: edge.style?.strokeWidth || 1.5,
    }
  }));
}

/**
 * Custom hook to handle flow container with improved stability
 */
export function useStableFlowContainer(options?: {
  autoFitView?: boolean;
  stabilizationDelay?: number;
  minHeight?: string | number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useReactFlow();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isStabilized, setIsStabilized] = useState(false);
  
  const fitView = useCallback(() => {
    if (!reactFlowInstance) return;
    
    try {
      reactFlowInstance.fitView({
        padding: 0.2,
        minZoom: 0.5,
        maxZoom: 2,
        duration: 800
      });
    } catch (error) {
      console.warn('Error fitting view (suppressed)');
    }
  }, [reactFlowInstance]);
  
  // Reset the flow visualization
  const resetFlow = useCallback(() => {
    if (!containerRef.current) return;
    
    // Force a re-render of the flow container
    const element = containerRef.current;
    
    // Apply stability fixes
    const applyStabilityFixes = () => {
      if (!element) return;
      
      // Force hardware acceleration
      element.style.transform = 'translateZ(0)';
      element.style.backfaceVisibility = 'hidden';
      element.style.webkitBackfaceVisibility = 'hidden';
      element.style.contain = 'layout';
      
      // Make nodes and edges visible
      element.querySelectorAll('.react-flow__node, .react-flow__edge').forEach((el) => {
        if (el instanceof HTMLElement) {
          el.style.opacity = '1';
          el.style.visibility = 'visible';
          if (el.classList.contains('react-flow__node')) {
            el.style.display = 'block';
          }
        }
      });
      
      // Fix edge paths
      element.querySelectorAll('.react-flow__edge-path').forEach((path) => {
        if (path instanceof SVGElement) {
          path.style.strokeWidth = '1.5px';
          path.style.opacity = '1';
          path.style.visibility = 'visible';
        }
      });
    };
    
    // Apply fixes multiple times with increasing delays
    applyStabilityFixes();
    setTimeout(applyStabilityFixes, 100);
    setTimeout(applyStabilityFixes, 500);
    
    // Don't call fitView as it causes clustering
    // setTimeout(fitView, 200);
    
  }, []);
  
  // Watch for container size changes
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateDimensions = () => {
      if (!containerRef.current) return;
      
      const { width, height } = containerRef.current.getBoundingClientRect();
      
      if (width > 0 && height > 0) {
        setDimensions({ width, height });
        
        // Only fit view if dimensions are non-zero
        if (options?.autoFitView && !isStabilized) {
          setTimeout(fitView, 100);
          setIsStabilized(true);
        }
      }
    };
    
    // Initial update
    updateDimensions();
    
    // Create ResizeObserver with error handling
    try {
      const resizeObserver = new ResizeObserver((entries) => {
        if (entries.length > 0) {
          requestAnimationFrame(updateDimensions);
        }
      });
      
      resizeObserver.observe(containerRef.current);
      
      return () => {
        resizeObserver.disconnect();
      };
    } catch (error) {
      // Fallback to window resize event if ResizeObserver fails
      window.addEventListener('resize', updateDimensions);
      return () => {
        window.removeEventListener('resize', updateDimensions);
      };
    }
  }, [options?.autoFitView, isStabilized, fitView]);
  
  // Apply stabilization
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Only apply basic stabilization without calling resetFlow
    const applyStabilization = () => {
      if (!containerRef.current) return;
      
      // Apply basic stability fixes without fitView
      const element = containerRef.current;
      element.style.transform = 'translateZ(0)';
      element.style.backfaceVisibility = 'hidden';
      element.style.webkitBackfaceVisibility = 'hidden';
      element.style.contain = 'layout';
      
      // Make nodes and edges visible
      element.querySelectorAll('.react-flow__node, .react-flow__edge').forEach((el) => {
        if (el instanceof HTMLElement) {
          el.style.opacity = '1';
          el.style.visibility = 'visible';
          if (el.classList.contains('react-flow__node')) {
            el.style.display = 'block';
          }
        }
      });
      
      // Fix edge paths
      element.querySelectorAll('.react-flow__edge-path').forEach((path) => {
        if (path instanceof SVGElement) {
          path.style.strokeWidth = '1.5px';
          path.style.opacity = '1';
          path.style.visibility = 'visible';
        }
      });
    };
    
    // Apply stability fixes with delay
    const stabilizationDelay = options?.stabilizationDelay || 200;
    const timer = setTimeout(applyStabilization, stabilizationDelay);
    
    return () => {
      clearTimeout(timer);
    };
  }, [options?.stabilizationDelay]);
  
  return {
    containerRef,
    dimensions,
    resetFlow,
    fitView,
    isStabilized,
    updateDimensions: resetFlow // Alias for backward compatibility
  };
}

/**
 * Utility to fix common ReactFlow rendering issues
 */
export function fixReactFlowRendering(containerElement: HTMLElement | null) {
  if (!containerElement) return;
  
  // Apply rendering fixes to the container
  containerElement.style.transform = 'translateZ(0)';
  containerElement.style.backfaceVisibility = 'hidden';
  containerElement.style.webkitBackfaceVisibility = 'hidden';
  containerElement.style.contain = 'layout';
  
  // Apply fixes to nodes
  const nodes = containerElement.querySelectorAll('.react-flow__node');
  nodes.forEach((node) => {
    if (node instanceof HTMLElement) {
      node.style.opacity = '1';
      node.style.visibility = 'visible';
      node.style.display = 'block';
      node.style.transform = 'translateZ(0)';
    }
  });
  
  // Apply fixes to edges
  const edges = containerElement.querySelectorAll('.react-flow__edge');
  edges.forEach((edge) => {
    if (edge instanceof HTMLElement) {
      edge.style.opacity = '1';
      edge.style.visibility = 'visible';
    }
    
    // Fix edge paths
    const paths = edge.querySelectorAll('.react-flow__edge-path');
    paths.forEach((path) => {
      if (path instanceof SVGElement) {
        path.style.strokeWidth = '1.5px';
        path.style.opacity = '1';
        path.style.visibility = 'visible';
      }
    });
  });
}

// Export an alias for backward compatibility with the original hook name
export const useFlowContainer = useStableFlowContainer;