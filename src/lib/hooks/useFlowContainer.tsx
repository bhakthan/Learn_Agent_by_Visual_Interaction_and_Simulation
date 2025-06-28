import { useCallback, useEffect, useRef } from 'react';
import { useReactFlow } from 'reactflow';

/**
 * Hook to properly handle ReactFlow container resizing to avoid ResizeObserver errors
 */
export function useFlowContainer(containerRef: React.RefObject<HTMLDivElement>) {
  const prevSizeRef = useRef({ width: 0, height: 0 });
  const resizeTimeoutRef = useRef<number | null>(null);
  const reactFlow = useReactFlow();
  
  // Initialize a debounced resize handler
  const handleResize = useCallback(() => {
    if (!containerRef.current) return;
    
    // Get current size
    const { width, height } = containerRef.current.getBoundingClientRect();
    const prevSize = prevSizeRef.current;
    
    // Only update if size changed significantly (helps prevent ResizeObserver loops)
    const significantChange = 
      Math.abs(width - prevSize.width) > 5 || 
      Math.abs(height - prevSize.height) > 5;
      
    if (significantChange) {
      // Update previous size
      prevSizeRef.current = { width, height };
      
      // Clear any existing timeout
      if (resizeTimeoutRef.current !== null) {
        window.clearTimeout(resizeTimeoutRef.current);
      }
      
      // Safely update ReactFlow with debouncing
      resizeTimeoutRef.current = window.setTimeout(() => {
        try {
          // Use requestAnimationFrame to ensure DOM has stabilized
          requestAnimationFrame(() => {
            if (reactFlow && typeof reactFlow.fitView === 'function') {
              reactFlow.fitView({ padding: 0.2, duration: 200 });
            }
          });
        } catch (err) {
          console.error('Error updating flow view:', err);
        } finally {
          resizeTimeoutRef.current = null;
        }
      }, 250);
    }
  }, [containerRef, reactFlow]);
  
  // Set up resize observer with error handling
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Initialize with current size
    const { width, height } = containerRef.current.getBoundingClientRect();
    prevSizeRef.current = { width, height };
    
    // Try to use ResizeObserver if available
    let observer: ResizeObserver | null = null;
    
    try {
      observer = new ResizeObserver((entries) => {
        // Wrap in RAF to avoid loops
        requestAnimationFrame(() => {
          handleResize();
        });
      });
      
      observer.observe(containerRef.current);
    } catch (err) {
      // ResizeObserver failed or isn't available, fall back to window resize event
      console.warn('ResizeObserver error or unsupported, using window resize:', err);
      window.addEventListener('resize', handleResize);
    }
    
    // Also listen for custom events that might indicate a resize is needed
    window.addEventListener('flow-resize', handleResize);
    
    // Clean up
    return () => {
      if (observer) {
        if (containerRef.current) {
          observer.unobserve(containerRef.current);
        }
        observer.disconnect();
      }
      
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('flow-resize', handleResize);
      
      if (resizeTimeoutRef.current !== null) {
        window.clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [containerRef, handleResize]);
  
  // Return an object with functions to manually trigger a resize
  return {
    updateDimensions: handleResize,
    triggerResize: handleResize
  };
}