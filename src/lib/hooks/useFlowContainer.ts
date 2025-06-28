import { useRef, useEffect } from 'react';

/**
 * Custom hook for optimizing ReactFlow container handling
 * This hook provides memoized dimensions and proper resize handling
 * using a ResizeObserver and layout optimization
 */
export function useFlowContainer<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const sizeCacheRef = useRef<{ width: number; height: number } | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingUpdateRef = useRef<boolean>(false);
  
  useEffect(() => {
    if (!ref.current) return;
    
    // Create a memoized resize observer to prevent excessive calculations
    const element = ref.current;
    let skipNextResize = false;
    
    // Define a function to safely dispatch resize events
    const safelyDispatchResizeEvent = (width: number, height: number) => {
      // Safely dispatch events only if we're not in the middle of layout operations
      try {
        if (pendingUpdateRef.current) return;
        
        pendingUpdateRef.current = true;
        
        // Cancel any pending animations and timeouts
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        
        // Use double RAF to ensure a clean render cycle
        rafIdRef.current = requestAnimationFrame(() => {
          rafIdRef.current = requestAnimationFrame(() => {
            try {
              // Dispatch a custom event that ReactFlow can listen to
              const event = new CustomEvent('flow-resize', { 
                detail: { width, height } 
              });
              window.dispatchEvent(event);
              
              // Add a small delay before allowing more updates
              timeoutRef.current = setTimeout(() => {
                pendingUpdateRef.current = false;
                timeoutRef.current = null;
              }, 150);
              
            } catch (error) {
              // Silently handle errors to prevent observer loop crashes
              pendingUpdateRef.current = false;
            }
            
            rafIdRef.current = null;
          });
        });
      } catch (error) {
        pendingUpdateRef.current = false;
      }
    };
    
    // Create observer with error handling
    observerRef.current = new ResizeObserver((entries) => {
      try {
        if (skipNextResize) {
          skipNextResize = false;
          return;
        }
        
        // Ignore observations if we're already handling an update
        if (pendingUpdateRef.current) return;
        
        // Get the first observation
        const observation = entries[0];
        if (!observation) return;
        
        // Extract box dimensions, preferring content box
        const box = observation.contentBoxSize?.[0] || observation.contentRect;
        const newWidth = Math.round(box.inlineSize || observation.contentRect.width);
        const newHeight = Math.round(box.blockSize || observation.contentRect.height);
        
        // Skip if no significant change (minimum 2px difference to avoid sub-pixel issues)
        if (sizeCacheRef.current && 
            Math.abs(sizeCacheRef.current.width - newWidth) < 2 && 
            Math.abs(sizeCacheRef.current.height - newHeight) < 2) {
          return;
        }
        
        // Update size cache
        sizeCacheRef.current = { width: newWidth, height: newHeight };
        
        // Debounce the resize event with significant delay to prevent loops
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        
        timeoutRef.current = setTimeout(() => {
          safelyDispatchResizeEvent(newWidth, newHeight);
        }, 200);
      } catch (error) {
        // Prevent observer errors from crashing the app
        console.log('Safely handled resize observer error');
      }
    });
    
    // Start observing the element
    observerRef.current.observe(element, { box: 'border-box' });
    
    // Cleanup on unmount
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = null;
    };
  }, []);
  
  return ref;
}