/**
 * Custom hook for creating stable ReactFlow instances with optimized rendering
 */
import { useEffect, useRef, useState } from 'react';
import { ReactFlowInstance } from 'reactflow';
import { optimizeReactFlowContainer } from '../utils/optimizeReactFlow';
import { resetReactFlowRendering } from '../utils/visualizationUtils';
import { throttleResizeObserver } from '../utils/resizeObserverUtils';

/**
 * Options for the useStableReactFlow hook
 */
interface UseStableReactFlowOptions {
  /** Auto fit view on size changes */
  fitViewOnResize?: boolean;
  /** How long to debounce resize events */
  debounceTime?: number;
  /** Apply hardware acceleration */
  hardwareAcceleration?: boolean;
  /** Aggressive optimization for problematic environments */
  aggressiveOptimization?: boolean;
}

/**
 * Hook for creating stable ReactFlow instances with optimizations
 * @param options Configuration options
 */
export function useStableReactFlow(options: UseStableReactFlowOptions = {}) {
  const {
    fitViewOnResize = true,
    debounceTime = 200,
    hardwareAcceleration = true,
    aggressiveOptimization = false
  } = options;
  
  // Reference to ReactFlow container and instance
  const containerRef = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  
  // Debounced resize handler
  const handleResize = useRef(() => {
    if (containerRef.current) {
      resetReactFlowRendering(containerRef);
      
      // Apply fitView if needed
      if (fitViewOnResize && reactFlowInstance) {
        requestAnimationFrame(() => {
          try {
            reactFlowInstance.fitView({
              padding: 0.1,
              includeHiddenNodes: false,
              duration: 200
            });
          } catch (e) {
            console.warn('Error in fitView', e);
          }
        });
      }
    }
  });
  
  // Set up optimized rendering with ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    
    let cleanup: (() => void) | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let resizeTimeout: number | undefined;
    
    // Apply container optimizations
    cleanup = optimizeReactFlowContainer(containerRef.current);
    
    // Apply hardware acceleration if enabled
    if (hardwareAcceleration && containerRef.current) {
      containerRef.current.style.transform = 'translateZ(0)';
      containerRef.current.style.contain = 'layout paint';
      
      // Apply more aggressive optimizations if needed
      if (aggressiveOptimization) {
        containerRef.current.style.willChange = 'transform';
        containerRef.current.style.isolation = 'isolate';
      }
    }
    
    // Initial stabilization
    setTimeout(() => {
      if (containerRef.current) {
        resetReactFlowRendering(containerRef);
      }
    }, 300);
    
    // Create stable resize observer
    try {
      resizeObserver = new ResizeObserver(throttleResizeObserver(() => {
        if (resizeTimeout) {
          window.cancelAnimationFrame(resizeTimeout);
        }
        
        // Debounce resize with RAF for smoother handling
        resizeTimeout = window.requestAnimationFrame(() => {
          setTimeout(() => {
            handleResize.current();
          }, debounceTime);
        });
      }));
      
      // Start observing
      resizeObserver.observe(containerRef.current);
    } catch (e) {
      console.warn('Failed to create ResizeObserver, falling back to window resize events', e);
      
      // Fallback to window resize events
      const windowResizeHandler = () => {
        if (resizeTimeout) {
          window.cancelAnimationFrame(resizeTimeout);
        }
        
        resizeTimeout = window.requestAnimationFrame(() => {
          setTimeout(() => {
            handleResize.current();
          }, debounceTime);
        });
      };
      
      window.addEventListener('resize', windowResizeHandler);
      
      // Update cleanup to include window event
      const originalCleanup = cleanup;
      cleanup = () => {
        if (originalCleanup) originalCleanup();
        window.removeEventListener('resize', windowResizeHandler);
      };
    }
    
    // Listen for layout events
    const layoutUpdateHandler = () => handleResize.current();
    window.addEventListener('layout-update', layoutUpdateHandler);
    
    return () => {
      // Clean up all resources
      if (cleanup) cleanup();
      
      if (resizeObserver) {
        try {
          resizeObserver.disconnect();
        } catch (e) {
          // Silent handling
        }
      }
      
      if (resizeTimeout) {
        window.cancelAnimationFrame(resizeTimeout);
      }
      
      window.removeEventListener('layout-update', layoutUpdateHandler);
    };
  }, [debounceTime, fitViewOnResize, hardwareAcceleration, aggressiveOptimization]);
  
  // Update instance reference and apply optimizations
  const onInit = (instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
    
    // Apply initial fitView
    if (fitViewOnResize) {
      setTimeout(() => {
        try {
          instance.fitView({
            padding: 0.1,
            includeHiddenNodes: false,
            duration: 200
          });
        } catch (e) {
          // Silent handling
        }
      }, 100);
    }
  };
  
  return {
    containerRef,
    reactFlowInstance,
    onInit,
    resetView: () => handleResize.current()
  };
}