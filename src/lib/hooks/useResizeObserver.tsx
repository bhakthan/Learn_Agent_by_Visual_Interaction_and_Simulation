import { useEffect, useRef, useCallback } from 'react';
import { createStableResizeObserver } from '../utils/resizeObserverUtils';

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
  const frameRef = useRef<number | null>(null);
  
  // Create a debounced resize handler
  const handleResize = useCallback((entries: ResizeObserverEntry[]) => {
    // Clear existing timeout
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Cancel any pending animation frame
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
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
      // Use requestAnimationFrame for smoother updates
      frameRef.current = window.requestAnimationFrame(() => {
        if (onResize && entry) {
          try {
            onResize(entry);
          } catch (error) {
            // Silent catch to prevent cascading errors
          }
        }
        frameRef.current = null;
      });
      timeoutRef.current = null;
    }, debounceMs);
  }, [onResize, debounceMs]);
  
  // Set up the observer with error handling
  useEffect(() => {
    if (disabled || !elementRef.current) return;
    
    // Create an observer with our stable wrapper
    observerRef.current = createStableResizeObserver((entries) => {
      handleResize(entries);
    });
    
    // Start observing
    if (observerRef.current && elementRef.current) {
      observerRef.current.observe(elementRef.current);
    }
    
    return () => {
      // Cleanup
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [disabled, handleResize]);
  
  // Function to manually trigger a resize calculation
  const forceUpdate = useCallback(() => {
    if (!elementRef.current) return;
    
    const { width, height } = elementRef.current.getBoundingClientRect();
    lastSizeRef.current = { width, height };
    
    if (onResize) {
      // Use requestAnimationFrame for smoother updates
      frameRef.current = window.requestAnimationFrame(() => {
        if (elementRef.current && onResize) {
          const entry = {
            target: elementRef.current,
            contentRect: { width, height } as DOMRectReadOnly,
            borderBoxSize: [] as ReadonlyArray<ResizeObserverSize>,
            contentBoxSize: [] as ReadonlyArray<ResizeObserverSize>
          } as ResizeObserverEntry;
          
          try {
            onResize(entry);
          } catch (error) {
            // Silent catch to prevent cascading errors
          }
        }
        frameRef.current = null;
      });
    }
  }, [onResize]);
  
  return { elementRef, forceUpdate };
}