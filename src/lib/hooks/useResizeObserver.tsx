import { useEffect, useRef, useCallback } from 'react';

interface ResizeObserverOptions {
  onResize?: (entry: ResizeObserverEntry) => void;
  debounceMs?: number;
  disabled?: boolean;
}

/**
 * A hook for safely using ResizeObserver with built-in error handling
 * and protection against ResizeObserver loops
 */
export function useResizeObserver<T extends HTMLElement = HTMLElement>(
  options: ResizeObserverOptions = {}
) {
  const {
    onResize,
    debounceMs = 100,
    disabled = false
  } = options;
  
  const elementRef = useRef<T | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const lastSizeRef = useRef<{ width: number; height: number } | null>(null);
  const errorCountRef = useRef<number>(0);
  
  // Create a debounced resize handler
  const handleResize = useCallback((entries: ResizeObserverEntry[]) => {
    // Clear existing timeout
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Check if we have an entry for our element
    const entry = entries.find(e => e.target === elementRef.current);
    if (!entry) return;
    
    // Get current size
    const { width, height } = entry.contentRect;
    
    // Skip if size hasn't changed significantly
    if (lastSizeRef.current) {
      const { width: prevWidth, height: prevHeight } = lastSizeRef.current;
      const isSignificantChange = 
        Math.abs(width - prevWidth) > 2 || 
        Math.abs(height - prevHeight) > 2;
      
      if (!isSignificantChange) return;
    }
    
    // Set new size
    lastSizeRef.current = { width, height };
    
    // Debounce the callback
    timeoutRef.current = window.setTimeout(() => {
      // Call the callback in a requestAnimationFrame for smoother updates
      requestAnimationFrame(() => {
        if (onResize && entry) {
          onResize(entry);
        }
      });
      timeoutRef.current = null;
    }, debounceMs);
  }, [onResize, debounceMs]);
  
  // Set up the observer with error handling
  useEffect(() => {
    if (disabled || !elementRef.current) return;
    
    // Create an observer with error tracking
    try {
      observerRef.current = new ResizeObserver((entries) => {
        try {
          handleResize(entries);
        } catch (error) {
          errorCountRef.current += 1;
          console.warn('Error in ResizeObserver callback:', error);
          
          // If we get multiple errors, disable the observer temporarily
          if (errorCountRef.current > 3) {
            const observer = observerRef.current;
            if (observer && elementRef.current) {
              observer.unobserve(elementRef.current);
              
              // Try to re-observe after a delay
              setTimeout(() => {
                errorCountRef.current = 0;
                if (observer && elementRef.current && !disabled) {
                  observer.observe(elementRef.current);
                }
              }, 2000);
            }
          }
        }
      });
      
      // Start observing
      observerRef.current.observe(elementRef.current);
    } catch (error) {
      console.error('Error creating ResizeObserver:', error);
    }
    
    return () => {
      // Cleanup
      const observer = observerRef.current;
      if (observer) {
        observer.disconnect();
        observerRef.current = null;
      }
      
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [disabled, handleResize]);
  
  // Function to manually trigger a resize calculation
  const forceUpdate = useCallback(() => {
    if (!elementRef.current || !lastSizeRef.current) return;
    
    const { width, height } = elementRef.current.getBoundingClientRect();
    lastSizeRef.current = { width, height };
    
    if (onResize) {
      const entry = {
        target: elementRef.current,
        contentRect: { width, height } as DOMRectReadOnly,
        borderBoxSize: [] as ReadonlyArray<ResizeObserverSize>,
        contentBoxSize: [] as ReadonlyArray<ResizeObserverSize>
      } as ResizeObserverEntry;
      
      onResize(entry);
    }
  }, [onResize]);
  
  return { elementRef, forceUpdate };
}