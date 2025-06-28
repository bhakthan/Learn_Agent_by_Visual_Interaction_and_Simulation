import { useCallback, useEffect, useRef, useState } from 'react';

interface ResizeObserverEntry {
  target: Element;
  contentRect: DOMRectReadOnly;
  borderBoxSize: ReadonlyArray<ResizeObserverSize>;
  contentBoxSize: ReadonlyArray<ResizeObserverSize>;
  devicePixelContentBoxSize: ReadonlyArray<ResizeObserverSize>;
}

interface ResizeObserverSize {
  inlineSize: number;
  blockSize: number;
}

type ResizeHandler = (entry: ResizeObserverEntry) => void;

/**
 * Custom hook that safely implements ResizeObserver with error handling
 * specifically designed for ReactFlow components
 */
export function useResizeObserver(onResize?: ResizeHandler) {
  const [entry, setEntry] = useState<ResizeObserverEntry | null>(null);
  const [observedNode, setObservedNode] = useState<Element | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const onResizeRef = useRef<ResizeHandler | undefined>(onResize);
  
  // Update ref when callback changes
  useEffect(() => {
    onResizeRef.current = onResize;
  }, [onResize]);
  
  // Throttle function to prevent excessive updates
  const throttleCallback = useCallback((callback: () => void) => {
    let running = false;
    return () => {
      if (running) return;
      running = true;
      requestAnimationFrame(() => {
        callback();
        running = false;
      });
    };
  }, []);
  
  // Create the node ref callback
  const ref = useCallback((node: Element | null) => {
    if (node === observedNode) return;
    
    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    
    setObservedNode(node);
    
    if (!node) return;
    
    // Use a delayed setup to avoid multiple synchronous observations
    setTimeout(() => {
      // Attempt to create a new observer with error handling
      try {
        // Create a more fault-tolerant observer
        const observer = new ResizeObserver(
          throttleCallback(() => {
            try {
              if (!node || !node.isConnected) return;
              
              // Get the dimensions using the safer getBoundingClientRect
              const rect = node.getBoundingClientRect();
              if (rect.width === 0 && rect.height === 0) return; // Skip empty elements
              
              // Create a simplified entry object
              const newEntry = {
                target: node,
                contentRect: rect,
                borderBoxSize: [{ inlineSize: rect.width, blockSize: rect.height }],
                contentBoxSize: [{ inlineSize: rect.width, blockSize: rect.height }],
                devicePixelContentBoxSize: [{ inlineSize: rect.width, blockSize: rect.height }],
              };
              
              // Update state and call callback
              setEntry(newEntry);
              
              if (onResizeRef.current) {
                onResizeRef.current(newEntry);
              }
            } catch (e) {
              // Silent error - don't crash the app
              console.error('ResizeObserver error handled (suppressed)');
            }
          })
        );
        
        // Start observing with a safer approach
        observer.observe(node, { box: 'border-box' });
        observerRef.current = observer;
      } catch (error) {
        // Fail gracefully
        console.error('Error setting up ResizeObserver (suppressed)');
      }
    }, 50); // Delay observer creation
  }, [throttleCallback, observedNode]);
  
  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);
  
  return { ref, entry };
}