import { useEffect, useCallback, useRef } from 'react';
import { useReactFlow } from 'reactflow';
// Import from reactFlowUtils instead of reactFlowFixUtils
import { forceNodesVisible } from '../utils/reactFlowUtils';
// Import the fixReactFlowRendering from our fixed utility
import { fixReactFlowRendering } from '../utils/reactFlowUtils';

interface UseStableFlowOptions {
  fitViewOnResize?: boolean;
  fitViewPadding?: number;
  stabilizationDelay?: number;
}

/**
 * A simplified hook for using ReactFlow with enhanced stability
 */
export function useStableFlow({
  fitViewOnResize = true,
  fitViewPadding = 0.2,
  stabilizationDelay = 300
}: UseStableFlowOptions = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useReactFlow();
  
  // Function to fit view with proper error handling
  const fitView = useCallback(() => {
    if (reactFlowInstance && typeof reactFlowInstance.fitView === 'function') {
      try {
        reactFlowInstance.fitView({
          padding: fitViewPadding,
          includeHiddenNodes: true
        });
      } catch (e) {
        console.debug('Failed to fit view (suppressed)');
      }
    }
  }, [reactFlowInstance, fitViewPadding]);
  
  // Function to reset the flow
  const resetFlow = useCallback(() => {
    // Force nodes to be visible
    forceNodesVisible();
    
    // Schedule a fix after a short delay
    setTimeout(() => {
      if (reactFlowInstance && containerRef.current) {
        // Pass containerRef instead of reactFlowInstance
        fixReactFlowRendering(containerRef);
      }
    }, 100);
  }, [reactFlowInstance, fitViewPadding]);
  
  // Apply initial stabilization and fit view
  useEffect(() => {
    if (reactFlowInstance) {
      // Apply stabilization after a delay to ensure proper loading
      const timer = setTimeout(() => {
        // Force all nodes to be visible
        forceNodesVisible();
        
        // Fit view to ensure everything is visible
        fitView();
      }, stabilizationDelay);
      
      return () => clearTimeout(timer);
    }
  }, [reactFlowInstance, fitView, stabilizationDelay]);
  
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
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimer) {
        clearTimeout(resizeTimer);
      }
    };
  }, [fitViewOnResize, resetFlow, fitView]);
  
  return {
    containerRef,
    reactFlowInstance,
    resetFlow,
    fitView
  };
}

export default useStableFlow;