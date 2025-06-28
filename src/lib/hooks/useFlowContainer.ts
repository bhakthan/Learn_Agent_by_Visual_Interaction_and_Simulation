import { useRef, useEffect } from 'react';

/**
 * Custom hook for optimizing ReactFlow container handling
 * This hook provides memoized dimensions and proper resize handling
 * using a ResizeObserver and layout optimization
 */
export function useFlowContainer<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const sizeCacheRef = useRef<{ width: number; height: number } | null>(null);
  
  useEffect(() => {
    if (!ref.current) return;
    
    // Create a memoized resize observer to prevent excessive calculations
    const element = ref.current;
    let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
    let skipNextResize = false;
    
    const resizeObserver = new ResizeObserver((entries) => {
      if (skipNextResize) {
        skipNextResize = false;
        return;
      }
      
      // Get the first observation
      const observation = entries[0];
      if (!observation) return;
      
      // Extract box dimensions, preferring content box
      const box = observation.contentBoxSize?.[0] || observation.contentRect;
      const newWidth = box.inlineSize || observation.contentRect.width;
      const newHeight = box.blockSize || observation.contentRect.height;
      
      // Skip if no change
      if (sizeCacheRef.current && 
          sizeCacheRef.current.width === newWidth && 
          sizeCacheRef.current.height === newHeight) {
        return;
      }
      
      // Update size cache
      sizeCacheRef.current = { width: newWidth, height: newHeight };
      
      // Debounce the resize event to prevent layout thrashing
      if (resizeTimeout) clearTimeout(resizeTimeout);
      
      resizeTimeout = setTimeout(() => {
        // Use requestAnimationFrame for smoother visual updates
        requestAnimationFrame(() => {
          // Dispatch a custom event that ReactFlow can listen to
          const event = new CustomEvent('flow-resize', { 
            detail: { width: newWidth, height: newHeight } 
          });
          window.dispatchEvent(event);
          
          // Notify any other interested components
          document.dispatchEvent(new CustomEvent('layout-update'));
          
          resizeTimeout = null;
        });
      }, 100); // Small debounce interval for responsive but not overly eager updates
    });
    
    // Start observing the element
    resizeObserver.observe(element);
    
    // Cleanup on unmount
    return () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeObserver.disconnect();
    };
  }, []);
  
  return ref;
}