import { useRef, useState, useEffect } from 'react';
import { createDebouncedResizeObserver } from '../utils/resizeObserverUtils';

interface ResizeObserverOptions {
  debounce?: number;
  skipInitialCallback?: boolean;
  onResize?: (dimensions: DOMRectReadOnly) => void;
}

/**
 * A hook to safely observe element resizing
 * 
 * @param options Configuration options
 * @returns [ref, dimensions, isReady]
 */
export function useResizeObserver<T extends HTMLElement = HTMLDivElement>(
  options: ResizeObserverOptions = {}
): [React.RefObject<T>, DOMRectReadOnly | undefined, boolean] {
  const {
    debounce = 300, // Increased default debounce
    skipInitialCallback = false,
    onResize
  } = options;
  
  const ref = useRef<T>(null);
  const [dimensions, setDimensions] = useState<DOMRectReadOnly>();
  const [isReady, setIsReady] = useState<boolean>(false);
  const skipNext = useRef<boolean>(skipInitialCallback);
  const observerRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    
    const currentElement = ref.current;
    
    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    
    try {
      // Create a debounced observer that won't trigger ResizeObserver loops
      observerRef.current = createDebouncedResizeObserver((entries) => {
        if (entries.length === 0 || !entries[0].contentRect) return;
        
        // Skip the initial callback if requested
        if (skipNext.current) {
          skipNext.current = false;
          return;
        }
        
        const newRect = entries[0].contentRect;
        
        // Only update dimensions if there's an actual change
        setDimensions(prev => {
          const hasChanged = !prev ||
            Math.abs(prev.width - newRect.width) > 2 || // Increased threshold
            Math.abs(prev.height - newRect.height) > 2;
          
          return hasChanged ? newRect : prev;
        });
        
        // Call the onResize callback if provided
        if (onResize) {
          onResize(newRect);
        }
        
        if (!isReady && newRect.width > 0 && newRect.height > 0) {
          setIsReady(true);
        }
      }, debounce);
      
      observerRef.current.observe(currentElement);
    } catch (error) {
      console.log('Safe resize observer error handled:', error);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [debounce, skipInitialCallback, onResize]);

  return [ref, dimensions, isReady];
}