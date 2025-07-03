import { useState, useEffect, useCallback } from 'react';
import { useReactFlow } from 'reactflow';
import { createStableResizeObserver } from '../utils/resizeObserverUtils';

type Dimensions = {
  width: number;
  height: number;
};

export function useFlowContainer(containerRef: React.RefObject<HTMLElement>) {
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0 });
  const reactFlowInstance = useReactFlow();

  // Function to update dimensions from the container element
  const updateDimensions = useCallback(() => {
    if (!containerRef.current) return;
    
    const { width, height } = containerRef.current.getBoundingClientRect();
    
    // Only update if significant changes
    setDimensions(prev => {
      if (
        Math.abs(prev.width - width) > 5 ||
        Math.abs(prev.height - height) > 5
      ) {
        return { width, height };
      }
      return prev;
    });
  }, [containerRef]);

  // Setup resize observer to track container size changes
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Initial update
    updateDimensions();
    
    // Create a stable resize observer
    const resizeObserver = createStableResizeObserver(() => {
      updateDimensions();
      
      // Apply fit view after dimensions update
      setTimeout(() => {
        if (reactFlowInstance && typeof reactFlowInstance.fitView === 'function') {
          try {
            reactFlowInstance.fitView({ 
              duration: 300,
              padding: 0.2,
              includeHiddenNodes: true
            });
          } catch (error) {
            console.warn('Error fitting flow view (suppressed)');
          }
        }
      }, 300);
    }, {
      throttleMs: 100,
      debounceMs: 300
    });
    
    // Start observing the container
    resizeObserver.observe(containerRef.current);
    
    // Add a mutation observer to track DOM changes
    const mutationObserver = new MutationObserver(() => {
      if (containerRef.current) {
        updateDimensions();
      }
    });
    
    mutationObserver.observe(containerRef.current, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
    
    // Also listen for window resize events
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, [containerRef, updateDimensions, reactFlowInstance]);
  
  return {
    dimensions,
    updateDimensions
  };
}