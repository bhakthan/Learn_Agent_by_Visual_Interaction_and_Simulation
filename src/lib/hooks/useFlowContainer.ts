import { useCallback, useEffect, useState } from 'react';
import { createStableResizeObserver } from '../utils/resizeObserverUtils';

/**
 * Hook for safely managing ReactFlow container dimensions
 * Helps prevent the common ResizeObserver loop errors
 */
export function useFlowContainer(containerRef: React.RefObject<HTMLElement>) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Create a stable resize handler
  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      const { offsetWidth, offsetHeight } = containerRef.current;
      
      // Only update if values are valid and different
      if (offsetWidth > 0 && offsetHeight > 0 && 
          (dimensions.width !== offsetWidth || dimensions.height !== offsetHeight)) {
        setDimensions({ width: offsetWidth, height: offsetHeight });
      }
    }
  }, [containerRef, dimensions]);
  
  // Initialize with stable render cycle
  useEffect(() => {
    // Set a small delay to ensure component is fully rendered
    const initTimer = setTimeout(() => {
      updateDimensions();
      setIsInitialized(true);
    }, 100);
    
    return () => clearTimeout(initTimer);
  }, [updateDimensions]);
  
  // Set up resize observer with error prevention
  useEffect(() => {
    if (!containerRef.current || !isInitialized) return;
    
    // Track recovery status
    let recoveryAttempted = false;
    let observerActive = true;
    
    // Create a buffered resize observer
    const observer = createStableResizeObserver(() => {
      if (observerActive) {
        updateDimensions();
      }
    });
    
    try {
      // Start observing with error handling
      observer.observe(containerRef.current);
      
      // Create a recovery function for errors
      const recover = () => {
        if (recoveryAttempted || !observerActive) return;
        recoveryAttempted = true;
        
        try {
          // Temporarily disable observer
          observerActive = false;
          observer.disconnect();
          
          // Apply fixes directly to the container
          if (containerRef.current) {
            containerRef.current.style.transform = 'translateZ(0)';
            containerRef.current.style.contain = 'paint';
            
            // Set stable dimensions if needed
            if (containerRef.current.offsetHeight < 10) {
              containerRef.current.style.minHeight = '300px';
            }
            
            // Force reflow
            containerRef.current.getBoundingClientRect();
          }
          
          // Re-enable after delay
          setTimeout(() => {
            if (containerRef.current) {
              observerActive = true;
              observer.observe(containerRef.current);
              updateDimensions();
            }
          }, 500);
        } catch (e) {
          // Silent fail
        }
      };
      
      // Set up automatic recovery
      const errorHandler = (event: ErrorEvent) => {
        if (event.message?.includes('ResizeObserver')) {
          event.preventDefault();
          recover();
          return true;
        }
      };
      
      window.addEventListener('error', errorHandler);
      
      // Clean up observer and listener
      return () => {
        window.removeEventListener('error', errorHandler);
        observer.disconnect();
        observerActive = false;
      };
    } catch (error) {
      // Fallback if observer fails
      console.warn('ResizeObserver setup failed (handled)', error);
      
      // Use less frequent polling as fallback
      const intervalId = setInterval(updateDimensions, 1000);
      return () => clearInterval(intervalId);
    }
  }, [containerRef, updateDimensions, isInitialized]);
  
  // Create a function to force refresh dimensions
  const resetReactFlowRendering = useCallback(() => {
    if (!containerRef.current) return;
    
    // Apply optimizations
    containerRef.current.style.transform = 'translateZ(0)';
    containerRef.current.style.contain = 'paint';
    
    // Force browser recalculation
    window.requestAnimationFrame(() => {
      updateDimensions();
      
      // Trigger React Flow internal resize handling
      window.dispatchEvent(new Event('resize'));
    });
  }, [containerRef, updateDimensions]);
  
  return { dimensions, updateDimensions, resetReactFlowRendering };
}