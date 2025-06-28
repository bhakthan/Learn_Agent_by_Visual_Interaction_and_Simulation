import { useRef, useState, useEffect } from 'react';

/**
 * Custom hook for observing element size changes with memoization
 * 
 * @param debounceMs - Debounce delay in milliseconds
 * @returns [ref, dimensions, isResizing] - Ref to attach, current dimensions, resize state
 */
export function useResizeObserver<T extends HTMLElement>(
  debounceMs: number = 100
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
  const observerRef = useRef<ResizeObserver | null>(null);

  // Callback ref pattern for more flexibility
  const setRef = (node: T | null) => {
    if (ref.current === node) return; // Skip if unchanged
    
    // Clean up previous observer if exists
    if (observerRef.current && ref.current) {
      observerRef.current.unobserve(ref.current);
    }
    
    ref.current = node;
    
    if (node) {
      // Initialize new observer if node exists
      const observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry) return;
        
        // Get content dimensions
        const { width, height } = entry.contentRect;
        const prev = prevDimensionsRef.current;
        
        // Only update if dimensions have changed significantly (avoid sub-pixel changes)
        if (Math.abs(width - prev.width) > 1 || Math.abs(height - prev.height) > 1) {
          // Mark as resizing
          setIsResizing(true);
          
          // Clear any pending timeout
          if (resizeTimeoutRef.current) {
            clearTimeout(resizeTimeoutRef.current);
          }
          
          // Set a timeout to update dimensions after debounce period
          resizeTimeoutRef.current = setTimeout(() => {
            // Use RAF for visual smoothness
            requestAnimationFrame(() => {
              prevDimensionsRef.current = { width, height };
              setDimensions({ width, height });
              setIsResizing(false);
            });
          }, debounceMs);
        }
      });
      
      // Start observing
      observer.observe(node);
      observerRef.current = observer;
    }
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      if (observerRef.current && ref.current) {
        observerRef.current.unobserve(ref.current);
        observerRef.current.disconnect();
      }
    };
  }, []);
  
  return [setRef, dimensions, isResizing];
}