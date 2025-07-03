/**
 * Flow Visualizer Utilities
 * 
 * Helper functions for flow visualization components across the application
 */
import React, { useRef, useCallback } from 'react';
import { Node, Edge } from 'reactflow';

/**
 * Helper function to get the fitView function from a StandardFlowVisualizerWithProvider instance
 */
export const getFitViewFunction = (ref: React.MutableRefObject<any>) => {
  return () => {
    // Try multiple approaches to get the fitView function
    try {
      if (ref.current && typeof ref.current.fitView === 'function') {
        ref.current.fitView();
      } else if (ref.current && ref.current.container && 
                typeof ref.current.container.fitView === 'function') {
        ref.current.container.fitView();
      } else {
        // Fallback to global function if available
        const containerElement = ref.current instanceof HTMLElement ? ref.current : 
          (ref.current && ref.current.container instanceof HTMLElement) ? 
          ref.current.container : document.querySelector('.react-flow');
          
        if (containerElement instanceof HTMLElement) {
          // Use the ReactFlow instance if available via data attribute
          const flowInstance = (containerElement as any)._reactFlowInstance;
          if (flowInstance && typeof flowInstance.fitView === 'function') {
            flowInstance.fitView({
              padding: 0.2,
              includeHiddenNodes: true,
              duration: 800
            });
          }
        }
      }
    } catch (error) {
      console.warn('Error using fitView (suppressed):', error);
    }
  };
};

/**
 * Helper hook to use flow visualization with proper ref handling
 */
export const useFlowVisualizer = () => {
  const flowRef = useRef<any>(null);
  
  const fitView = useCallback(() => {
    getFitViewFunction(flowRef)();
  }, []);
  
  const resetFlow = useCallback(() => {
    try {
      // Reset flow container if possible
      if (flowRef.current && typeof flowRef.current.resetFlow === 'function') {
        flowRef.current.resetFlow();
      } 
      
      // Try to fit view regardless
      setTimeout(fitView, 100);
    } catch (error) {
      console.warn('Error resetting flow (suppressed)');
    }
  }, [fitView]);
  
  return {
    flowRef,
    fitView,
    resetFlow
  };
};

/**
 * Ensure nodes and edges are properly formatted for stable rendering
 */
export const prepareFlowElements = (nodes: Node[], edges: Edge[]) => {
  // Prepare nodes with stable rendering properties
  const preparedNodes = nodes.map(node => ({
    ...node,
    style: {
      ...node.style,
      opacity: 1,
      visibility: 'visible',
      transform: 'translateZ(0)',
      backfaceVisibility: 'hidden',
      WebkitBackfaceVisibility: 'hidden',
      zIndex: 1,
      position: 'absolute',
      display: 'block'
    }
  }));
  
  // Prepare edges with stable rendering properties
  const preparedEdges = edges.map(edge => ({
    ...edge,
    style: {
      ...edge.style,
      opacity: 1,
      visibility: 'visible',
      strokeWidth: edge.style?.strokeWidth || 1.5
    }
  }));
  
  return { nodes: preparedNodes, edges: preparedEdges };
};

/**
 * Create a safe fitView function that won't throw errors
 */
export const createSafeFitView = (reactFlowInstance: any) => {
  return () => {
    if (!reactFlowInstance) return;
    
    try {
      reactFlowInstance.fitView({
        padding: 0.2,
        includeHiddenNodes: true,
        duration: 800
      });
    } catch (error) {
      console.warn('Error fitting view (suppressed)');
    }
  };
};