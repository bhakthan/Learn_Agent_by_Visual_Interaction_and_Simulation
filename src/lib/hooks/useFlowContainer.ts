import { useEffect, useRef } from 'react';
import { createStableResizeObserver } from '../utils/resizeObserverUtils';

/**
 * Hook for better handling of ReactFlow container resizing with enhanced stability
 * 
 * @param options Optional configuration
 * @returns Container ref and utility methods
 */
export function useFlowContainer(options: { 
  fitViewOnResize?: boolean;
  autoResize?: boolean;
  debounce?: number;
  centerContent?: boolean;
} = {}) {
  const { 
    fitViewOnResize = true,
    autoResize = true, 
    debounce = 200,
    centerContent = true
  } = options;
  
  // Reference to the flow container
  const containerRef = useRef<HTMLDivElement>(null);
  // Reference to the ReactFlow instance
  const reactFlowInstanceRef = useRef<any>(null);
  // Track if we've applied initial stabilization
  const initializedRef = useRef<boolean>(false);
  
  // Utility to reset and stabilize ReactFlow rendering with improved reliability
  const resetReactFlowRendering = () => {
    // Skip if no container
    if (!containerRef.current) return;
    
    try {
      // Apply temporary styles that force a reflow
      const container = containerRef.current;
      
      // Use RAF for smoother rendering
      requestAnimationFrame(() => {
        // Hardware acceleration and rendering stability
        container.style.transform = 'translateZ(0)';
        container.style.webkitBackfaceVisibility = 'hidden';
        container.style.contain = 'layout paint';
        
        // Force reflow
        container.getBoundingClientRect();
        
        // Set explicit dimensions based on parent if needed
        const parent = container.parentElement;
        if (parent && (!container.style.height || parseInt(container.style.height) < 20)) {
          const height = Math.max(parent.offsetHeight, 300);
          container.style.height = `${height}px`;
        }
        
        // Apply stabilization to ReactFlow elements
        const flowElements = container.querySelectorAll('.react-flow__viewport, .react-flow__container');
        flowElements.forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.transform = 'translateZ(0)';
            el.style.contain = 'layout paint';
          }
        });
        
        // Trigger a smooth rendering update
        requestAnimationFrame(() => {
          // Trigger fitView on the ReactFlow instance with proper error handling
          if (reactFlowInstanceRef.current && fitViewOnResize) {
            try {
              if (typeof reactFlowInstanceRef.current.fitView === 'function') {
                reactFlowInstanceRef.current.fitView({
                  padding: 0.2,
                  includeHiddenNodes: false,
                  duration: 200
                });
              }
            } catch (e) {
              // Silently handle fitView errors
              console.warn('Error in fitView, using fallback resize', e);
              window.dispatchEvent(new Event('resize'));
            }
          }
          
          // Dispatch layout event
          window.dispatchEvent(new CustomEvent('flow-layout-updated', {
            detail: { containerId: container.id || 'flow-container' }
          }));
        });
      });
    } catch (e) {
      // Silently handle errors but dispatch resize as fallback
      window.dispatchEvent(new Event('resize'));
    }
  };
  
  // Set up resize handlers with improved stability
  useEffect(() => {
    if (!containerRef.current || !autoResize) return;
    
    // Create a safer resize handler with RAF-based debouncing
    let resizeTimeoutId: number | null = null;
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    
    const handleResize = () => {
      // Cancel any pending resize
      if (resizeTimeoutId !== null) {
        cancelAnimationFrame(resizeTimeoutId);
        resizeTimeoutId = null;
      }
      
      if (resizeTimer !== null) {
        clearTimeout(resizeTimer);
      }
      
      // Schedule new resize with RAF for better performance
      resizeTimeoutId = requestAnimationFrame(() => {
        resizeTimer = setTimeout(() => {
          resetReactFlowRendering();
          resizeTimeoutId = null;
        }, debounce);
      });
    };
    
    // Apply initial stabilization after a short delay
    if (!initializedRef.current) {
      const initTimer = setTimeout(() => {
        resetReactFlowRendering();
        initializedRef.current = true;
      }, 500);
      
      return () => {
        clearTimeout(initTimer);
      };
    }
    
    // Set up stable resize observer with error handling
    try {
      // Use our custom stable resize observer
      const observer = createStableResizeObserver(() => {
        handleResize();
      });
      
      observer.observe(containerRef.current);
      
      // Listen for explicit layout update requests
      const handleLayoutUpdate = () => handleResize();
      window.addEventListener('layout-update', handleLayoutUpdate);
      
      return () => {
        observer.disconnect();
        window.removeEventListener('layout-update', handleLayoutUpdate);
        
        if (resizeTimeoutId !== null) {
          cancelAnimationFrame(resizeTimeoutId);
        }
        
        if (resizeTimer !== null) {
          clearTimeout(resizeTimer);
        }
      };
    } catch (e) {
      // Fallback to window resize events
      console.warn('ResizeObserver failed, using window resize fallback', e);
      window.addEventListener('resize', handleResize);
      
      // Also listen for layout updates
      window.addEventListener('layout-update', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('layout-update', handleResize);
        
        if (resizeTimeoutId !== null) {
          cancelAnimationFrame(resizeTimeoutId);
        }
        
        if (resizeTimer !== null) {
          clearTimeout(resizeTimer);
        }
      };
    }
  }, [autoResize, debounce]);
  
  // Return the container ref and utils
  return {
    containerRef,
    setReactFlowInstance: (instance: any) => {
      reactFlowInstanceRef.current = instance;
      
      // Apply initial stabilization if instance changes
      if (instance && fitViewOnResize) {
        requestAnimationFrame(() => {
          try {
            if (typeof instance.fitView === 'function') {
              instance.fitView();
            }
          } catch (e) {
            // Silent handling
          }
        });
      }
    },
    resetRendering: resetReactFlowRendering,
    triggerResize: () => {
      resetReactFlowRendering();
    }
  };
}