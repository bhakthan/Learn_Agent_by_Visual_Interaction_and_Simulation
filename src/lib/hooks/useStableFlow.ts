import { useRef, useCallback, useEffect } from 'react';
import { useReactFlow } from 'reactflow';
import { createStableResizeDetector } from '../utils/resizeObserverUtil';

/**
 * Hook providing stability enhancements for ReactFlow
 * This helps prevent ResizeObserver loop errors
 * 
 * @param options Configuration options
 * @returns Helper functions and refs
 */
export function useStableFlow(options: {
  fitViewOnResize?: boolean;
  fitViewPadding?: number;
  fitViewDelay?: number;
  stabilizationDelay?: number;
  applyHardwareAcceleration?: boolean;
} = {}) {
  // Default options with sensible values
  const {
    fitViewOnResize = true,
    fitViewPadding = 0.2,
    fitViewDelay = 100,
    stabilizationDelay = 500,
    applyHardwareAcceleration = true
  } = options;
  
  // Container reference
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track stabilization state
  const stabilizationAppliedRef = useRef<boolean>(false);
  
  // Get ReactFlow instance (will be undefined if outside provider)
  let reactFlowInstance: ReturnType<typeof useReactFlow> | undefined;
  try {
    reactFlowInstance = useReactFlow();
  } catch (e) {
    // Handle gracefully if used outside ReactFlowProvider
    reactFlowInstance = undefined;
  }
  
  /**
   * Applies stabilization to ReactFlow DOM elements
   */
  const applyStabilization = useCallback(() => {
    if (!containerRef.current || stabilizationAppliedRef.current) return;
    
    // Use RAF for smoother execution
    requestAnimationFrame(() => {
      try {
        const container = containerRef.current;
        if (!container) return;
        
        // Apply hardware acceleration and stability CSS
        if (applyHardwareAcceleration) {
          container.style.transform = 'translateZ(0)';
          container.style.backfaceVisibility = 'hidden';
          container.style.webkitBackfaceVisibility = 'hidden';
          container.style.willChange = 'transform';
          container.style.contain = 'layout paint style';
        }
        
        // Find and optimize ReactFlow viewport elements
        const viewportElements = container.querySelectorAll('.react-flow__viewport');
        viewportElements.forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.transform = 'translateZ(0)';
            el.style.backfaceVisibility = 'hidden';
            el.style.willChange = 'transform';
          }
        });
        
        // Optimize edge rendering
        const edgeElements = container.querySelectorAll('.react-flow__edge');
        edgeElements.forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.contain = 'layout style';
          }
        });
        
        // Mark as stabilized
        stabilizationAppliedRef.current = true;
      } catch (e) {
        // Silent error handling
        console.debug('Flow stabilization error (suppressed)');
      }
    });
  }, [applyHardwareAcceleration]);
  
  /**
   * Handle view fitting for ReactFlow
   */
  const fitView = useCallback(() => {
    if (!reactFlowInstance || typeof reactFlowInstance.fitView !== 'function') return;
    
    // Use timeout to ensure nodes are properly positioned
    const timeoutId = setTimeout(() => {
      try {
        reactFlowInstance?.fitView({
          padding: fitViewPadding,
          includeHiddenNodes: false,
          duration: 200
        });
      } catch (e) {
        // Silent error handling
      }
    }, fitViewDelay);
    
    return () => clearTimeout(timeoutId);
  }, [reactFlowInstance, fitViewPadding, fitViewDelay]);
  
  /**
   * Reset and re-render the flow
   */
  const resetFlow = useCallback(() => {
    if (!containerRef.current) return;
    
    // Apply stabilization first
    applyStabilization();
    
    // Use RAF for smoother execution
    requestAnimationFrame(() => {
      // Fit view if enabled and instance exists
      if (fitViewOnResize) {
        fitView();
      }
      
      // Force a layout recalculation
      const container = containerRef.current;
      if (container) {
        // Trigger custom event for components to respond to
        container.dispatchEvent(
          new CustomEvent('flow-reset', { bubbles: true })
        );
      }
    });
  }, [applyStabilization, fitView, fitViewOnResize]);
  
  // Apply initial stabilization with a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      applyStabilization();
      
      // Initial fit view if enabled
      if (fitViewOnResize && reactFlowInstance) {
        fitView();
      }
    }, stabilizationDelay);
    
    return () => clearTimeout(timer);
  }, [applyStabilization, fitView, fitViewOnResize, reactFlowInstance, stabilizationDelay]);
  
  // Set up resize detection with our stable handler
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create a stable resize detector
    const cleanup = createStableResizeDetector(
      containerRef.current,
      () => {
        // Only trigger fit view, not full reset
        if (fitViewOnResize) {
          fitView();
        }
      },
      {
        throttle: 200,
        useRAF: true,
        disconnectOnError: true
      }
    );
    
    return cleanup;
  }, [fitView, fitViewOnResize]);
  
  return {
    containerRef,
    resetFlow,
    fitView,
    applyStabilization,
    reactFlowInstance
  };
}