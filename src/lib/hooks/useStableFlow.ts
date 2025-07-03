import { useEffect, useCallback, useRef, useState } from 'react';
import { useReactFlow } from 'reactflow';
import { stabilizeReactFlow } from '../utils/stabilizeVisualization';
import { forceNodesVisible, fixReactFlowRendering } from '../utils/reactFlowFixUtils';

interface UseStableFlowOptions {
  fitViewOnResize?: boolean;
  fitViewPadding?: number;
  stabilizationDelay?: number;
}

/**
 * Custom hook for using ReactFlow with enhanced stability
 * Handles common issues like ResizeObserver errors and visibility problems
 */
export function useStableFlow({
  fitViewOnResize = true,
  fitViewPadding = 0.2,
  stabilizationDelay = 300
}: UseStableFlowOptions = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useReactFlow();
  const [isStabilized, setIsStabilized] = useState(false);
  
  // Function to fit view with proper error handling
  const fitView = useCallback(() => {
    if (reactFlowInstance && typeof reactFlowInstance.fitView === 'function') {
      try {
        reactFlowInstance.fitView({
          padding: fitViewPadding,
          includeHiddenNodes: false
        });
      } catch (e) {
        console.debug('Failed to fit view', e);
      }
    }
  }, [reactFlowInstance, fitViewPadding]);
  
  // Function to reset the flow
  const resetFlow = useCallback(() => {
    if (containerRef.current) {
      stabilizeReactFlow(containerRef.current);
    }
    
    // Schedule multiple attempts to ensure it works
    setTimeout(() => {
      if (reactFlowInstance) {
        fixReactFlowRendering(reactFlowInstance, fitViewPadding);
      }
    }, 100);
    
    setTimeout(() => {
      forceNodesVisible();
    }, 300);
  }, [reactFlowInstance, fitViewPadding]);
  
  // Apply initial stabilization and fit view
  useEffect(() => {
    if (!isStabilized && containerRef.current && reactFlowInstance) {
      // Apply stabilization after a delay to ensure proper loading
      const timer = setTimeout(() => {
        if (containerRef.current) {
          stabilizeReactFlow(containerRef.current);
        }
        
        // Make sure all nodes are visible
        forceNodesVisible();
        
        // Fit view to ensure everything is visible
        fitView();
        
        setIsStabilized(true);
      }, stabilizationDelay);
      
      return () => clearTimeout(timer);
    }
  }, [reactFlowInstance, isStabilized, fitView, stabilizationDelay]);
  
  // Handle window resize events
  useEffect(() => {
    if (!fitViewOnResize) return;
    
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    
    const handleResize = () => {
      if (resizeTimer) {
        clearTimeout(resizeTimer);
      }
      
      // Debounce resize events
      resizeTimer = setTimeout(() => {
        resetFlow();
        fitView();
      }, 200);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Also listen for layout updates that might be triggered by other components
    window.addEventListener('layout-update', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('layout-update', handleResize);
      if (resizeTimer) {
        clearTimeout(resizeTimer);
      }
    };
  }, [fitViewOnResize, resetFlow, fitView]);
  
  // Apply stabilization if React Flow instance changes
  useEffect(() => {
    if (reactFlowInstance) {
      const timer = setTimeout(() => {
        resetFlow();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [reactFlowInstance, resetFlow]);
  
  return {
    containerRef,
    reactFlowInstance,
    resetFlow,
    fitView,
    isStabilized
  };
}

export default useStableFlow;