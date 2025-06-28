import { useRef, useState, useEffect } from 'react';

/**
 * Custom hook for observing element size changes with memoization
 * 
 * @param debounceMs - Debounce delay in milliseconds
 * @returns [ref, dimensions, isResizing] - Ref to attach, current dimensions, resize state
 */
export function useResizeObserver<T extends HTMLElement>(
  debounceMs: number = 250
): [
  React.RefObject<T> | ((node: T | null) => void),
  { width: number; height: number },
  boolean
] {
  // Element reference
  const ref = useRef<T | null>(null);
  
  // State for dimensions and resize status
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isResizing, setIsResizing] = useState(false);
  
  // Refs for memoization and optimization
  const prevDimensionsRef = useRef({ width: 0, height: 0 });
  const resizeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const processingRef = useRef<boolean>(false);

  // Callback ref pattern for more flexibility
  const setRef = (node: T | null) => {
    if (ref.current === node) return; // Skip if unchanged
    
    // Clean up previous observer if exists
    if (observerRef.current && ref.current) {
      try {
        observerRef.current.unobserve(ref.current);
      } catch (error) {
        // Handle edge case of observer error
      }
    }
    
    ref.current = node;
    
    if (node) {
      // Initialize new observer if node exists
      try {
        const observer = new ResizeObserver((entries) => {
          try {
            // Ignore if already processing to avoid looping
            if (processingRef.current) return;
            
            const entry = entries[0];
            if (!entry) return;
            
            // Get content dimensions with rounding to avoid sub-pixel differences
            const width = Math.round(entry.contentRect.width);
            const height = Math.round(entry.contentRect.height);
            const prev = prevDimensionsRef.current;
            
            // Only update if dimensions have changed significantly (minimum 2px difference)
            if (Math.abs(width - prev.width) > 2 || Math.abs(height - prev.height) > 2) {
              // Mark as resizing and processing
              setIsResizing(true);
              processingRef.current = true;
              
              // Clear any pending timeout and animation frames
              if (resizeTimeoutRef.current) {
                clearTimeout(resizeTimeoutRef.current);
                resizeTimeoutRef.current = null;
              }
              
              if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
                rafIdRef.current = null;
              }
              
              // Set a timeout to update dimensions after debounce period
              resizeTimeoutRef.current = setTimeout(() => {
                // Use double RAF for smoother visual updates and to ensure a clean layout cycle
                rafIdRef.current = requestAnimationFrame(() => {
                  rafIdRef.current = requestAnimationFrame(() => {
                    try {
                      prevDimensionsRef.current = { width, height };
                      setDimensions({ width, height });
                      setIsResizing(false);
                    } finally {
                      // Always reset processing flag
                      processingRef.current = false;
                      rafIdRef.current = null;
                    }
                  });
                });
              }, debounceMs);
            }
          } catch (error) {
            // Reset flags in case of error
            processingRef.current = false;
            setIsResizing(false);
          }
        });
        
        // Start observing with border-box to include padding/border
        observer.observe(node, { box: 'border-box' });
        observerRef.current = observer;
      } catch (error) {
        // Fallback in case observer creation fails
        console.log('ResizeObserver creation failed, using fallback dimensions');
        setDimensions({
          width: node.offsetWidth,
          height: node.offsetHeight
        });
      }
    }
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (observerRef.current && ref.current) {
        try {
          observerRef.current.unobserve(ref.current);
          observerRef.current.disconnect();
        } catch (error) {
          // Handle edge case of observer error during cleanup
        }
      }
      processingRef.current = false;
    };
  }, []);
  
  return [setRef, dimensions, isResizing];
}