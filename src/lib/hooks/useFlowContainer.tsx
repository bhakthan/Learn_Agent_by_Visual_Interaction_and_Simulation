import { useCallback, useEffect, useRef, useState } from 'react';
import { throttleResizeObserver } from '../utils/resizeObserverUtils';

/**
 * Hook to properly handle ReactFlow container resizing to avoid ResizeObserver errors
 */
export function useFlowContainer(containerRef: React.RefObject<HTMLDivElement>) {
  const prevSizeRef = useRef({ width: 0, height: 0 });
  const resizeTimeoutRef = useRef<number | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  // Initialize a debounced resize handler - no useReactFlow here
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
      setContainerSize({ width, height });
      
      // Clear any existing timeout
      if (resizeTimeoutRef.current !== null) {
        window.clearTimeout(resizeTimeoutRef.current);
      }
      
      // Safely update with debouncing
      resizeTimeoutRef.current = window.setTimeout(() => {
        try {
          // Use requestAnimationFrame to ensure DOM has stabilized
          window.requestAnimationFrame(() => {
            // Dispatch an event that components can listen for
            window.dispatchEvent(new CustomEvent('flow-resize', {
              detail: { width, height, timestamp: Date.now() }
            }));
          });
        } catch (err) {
          // Silent error - this is just for visualization optimization
        } finally {
          resizeTimeoutRef.current = null;
        }
      }, 250);
    }
  }, [containerRef]);

  // Throttled version of resize handler to prevent excessive calls
  const throttledResize = useCallback(throttleResizeObserver(handleResize, 100), [handleResize]);
  
  // Set up resize observer with error handling
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Initialize with current size
    const { width, height } = containerRef.current.getBoundingClientRect();
    prevSizeRef.current = { width, height };
    setContainerSize({ width, height });
    
    // Try to use ResizeObserver if available
    try {
      // Clean up any existing observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      
      // Create a new observer with RAF to avoid synchronous layout triggers
      observerRef.current = new ResizeObserver((entries) => {
        // Skip if entries are empty
        if (!entries.length) return;
        
        // Use requestAnimationFrame to avoid loops
        window.requestAnimationFrame(() => {
          throttledResize();
        });
      });
      
      observerRef.current.observe(containerRef.current);
    } catch (err) {
      // ResizeObserver failed or isn't available, fall back to window resize event
      window.addEventListener('resize', throttledResize);
    }
    
    // Also listen for custom events that might indicate a resize is needed
    window.addEventListener('flow-resize', throttledResize);
    window.addEventListener('flow-force-stabilize', throttledResize);
    
    // Clean up
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      
      window.removeEventListener('resize', throttledResize);
      window.removeEventListener('flow-resize', throttledResize);
      window.removeEventListener('flow-force-stabilize', throttledResize);
      
      if (resizeTimeoutRef.current !== null) {
        window.clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [containerRef, throttledResize]);
  
  // Return an object with functions to manually trigger a resize and the current size
  return {
    updateDimensions: handleResize,
    triggerResize: handleResize,
    containerSize
  };
}