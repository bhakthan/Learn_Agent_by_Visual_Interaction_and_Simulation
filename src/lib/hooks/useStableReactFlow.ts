/**
 * A hook for creating stable ReactFlow components that prevent ResizeObserver errors
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useReactFlow } from 'reactflow';
import { applyDomFixes, forceRenderStability, debounce } from '../utils/reactFlowOptimization';

interface UseStableReactFlowOptions {
  stabilityDelay?: number;
  fitViewOnResize?: boolean;
  fitViewPadding?: number;
  preventResizeErrors?: boolean;
  applyDomFixesOnMount?: boolean;
}

interface UseStableReactFlowResult {
  containerRef: React.RefObject<HTMLDivElement>;
  fitView: () => void;
  resetStability: () => void;
  applyStabilityFixes: () => void;
  isReady: boolean;
}

/**
 * A hook that provides stability enhancements for ReactFlow
 */
export function useStableReactFlow({
  stabilityDelay = 300,
  fitViewOnResize = true,
  fitViewPadding = 0.2,
  preventResizeErrors = true,
  applyDomFixesOnMount = true
}: UseStableReactFlowOptions = {}): UseStableReactFlowResult {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useReactFlow();
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  
  // State
  const [isReady, setIsReady] = useState(false);
  
  // Apply stability fixes to container
  const applyStabilityFixes = useCallback(() => {
    if (containerRef.current) {
      applyDomFixes(containerRef.current);
    }
    
    forceRenderStability(reactFlowInstance);
  }, [reactFlowInstance]);
  
  // Fit view with error handling
  const fitView = useCallback(() => {
    if (!reactFlowInstance) return;
    
    try {
      reactFlowInstance.fitView({
        padding: fitViewPadding,
        includeHiddenNodes: true,
        duration: 200
      });
    } catch (e) {
      console.debug('Error in fitView (suppressed)');
    }
  }, [reactFlowInstance, fitViewPadding]);
  
  // Reset stability - apply all fixes
  const resetStability = useCallback(() => {
    applyStabilityFixes();
    
    // Delayed fit view for better results
    setTimeout(() => {
      fitView();
    }, 100);
  }, [applyStabilityFixes, fitView]);
  
  // Setup resize observer with debounced handling to prevent loop errors
  useEffect(() => {
    if (!containerRef.current || !fitViewOnResize) return;
    
    const debouncedResize = debounce(() => {
      resetStability();
    }, 150);
    
    try {
      // Cleanup any existing observer
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      
      // Create a new observer with error handling
      resizeObserverRef.current = new ResizeObserver((entries) => {
        try {
          // Process entries with basic check
          if (entries.length > 0) {
            debouncedResize();
          }
        } catch (e) {
          // Silently handle errors
        }
      });
      
      // Start observing with a delayed start to prevent initial loops
      setTimeout(() => {
        if (containerRef.current && resizeObserverRef.current) {
          resizeObserverRef.current.observe(containerRef.current);
        }
      }, 100);
    } catch (e) {
      console.debug('Error setting up ResizeObserver (suppressed)');
    }
    
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [fitViewOnResize, resetStability]);
  
  // Apply stability fixes on mount
  useEffect(() => {
    if (!applyDomFixesOnMount) return;
    
    // Apply fixes multiple times with increasing delays
    const timers = [
      setTimeout(applyStabilityFixes, 100),
      setTimeout(() => {
        applyStabilityFixes();
        fitView();
      }, 500),
      setTimeout(() => {
        applyStabilityFixes();
        fitView();
        setIsReady(true);
      }, stabilityDelay)
    ];
    
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [applyStabilityFixes, fitView, applyDomFixesOnMount, stabilityDelay]);
  
  // Prevent ResizeObserver errors
  useEffect(() => {
    if (!preventResizeErrors) return;
    
    const handleError = (event: ErrorEvent) => {
      if (event.message && (
        event.message.includes('ResizeObserver loop') || 
        event.message.includes('ResizeObserver completed')
      )) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };
    
    window.addEventListener('error', handleError, true);
    
    return () => {
      window.removeEventListener('error', handleError, true);
    };
  }, [preventResizeErrors]);
  
  return {
    containerRef,
    fitView,
    resetStability,
    applyStabilityFixes,
    isReady
  };
}