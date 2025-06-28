import { useEffect, useRef } from 'react';

/**
 * Hook for better handling of ReactFlow container resizing
 * 
 * @param options Optional configuration
 * @returns Container ref and utility methods
 */
export function useFlowContainer(options: { 
  fitViewOnResize?: boolean;
  autoResize?: boolean;
  debounce?: number;
} = {}) {
  const { 
    fitViewOnResize = true,
    autoResize = true, 
    debounce = 200
  } = options;
  
  // Reference to the flow container
  const containerRef = useRef<HTMLDivElement>(null);
  // Reference to the ReactFlow instance
  const reactFlowInstanceRef = useRef<any>(null);
  
  // Utility to reset and stabilize ReactFlow rendering
  const resetReactFlowRendering = () => {
    // Skip if no container
    if (!containerRef.current) return;
    
    try {
      // Apply temporary styles that force a reflow
      const container = containerRef.current;
      
      // Use hardware acceleration
      container.style.transform = 'translateZ(0)';
      
      // Force reflow
      container.getBoundingClientRect();
      
      // Set explicit dimensions based on parent if needed
      const parent = container.parentElement;
      if (parent && !container.style.height) {
        container.style.height = `${parent.offsetHeight}px`;
      }
      
      // Trigger fitView on the ReactFlow instance if available
      if (reactFlowInstanceRef.current && fitViewOnResize) {
        setTimeout(() => {
          try {
            reactFlowInstanceRef.current.fitView?.();
          } catch (e) {
            // Silently handle errors
          }
        }, 50);
      }
      
      // Dispatch a resize event as a fallback
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    } catch (e) {
      // Silently handle errors
    }
  };
  
  // Set up resize handlers
  useEffect(() => {
    if (!containerRef.current || !autoResize) return;
    
    // Create a safer resize handler with debouncing
    let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
    
    const handleResize = () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      
      resizeTimeout = setTimeout(() => {
        resetReactFlowRendering();
      }, debounce);
    };
    
    // Set up resize observer if available
    try {
      // Only use ResizeObserver if not problematic
      if (!(window as any).__disableResizeObservers) {
        const observer = new ResizeObserver(() => {
          handleResize();
        });
        
        observer.observe(containerRef.current);
        
        return () => {
          observer.disconnect();
          if (resizeTimeout) clearTimeout(resizeTimeout);
        };
      }
    } catch (e) {
      // Fallback to window resize events
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        if (resizeTimeout) clearTimeout(resizeTimeout);
      };
    }
  }, [autoResize, debounce]);
  
  // Return the container ref and utils
  return {
    containerRef,
    setReactFlowInstance: (instance: any) => {
      reactFlowInstanceRef.current = instance;
    },
    resetRendering: resetReactFlowRendering
  };
}