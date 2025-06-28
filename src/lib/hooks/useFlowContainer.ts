import { useState, useEffect, useRef } from 'react';
import { setupSafeReactFlowResizeHandler } from '../utils/reactFlowUtils';

/**
 * Hook to safely handle ReactFlow container resizing
 * Helps prevent ResizeObserver errors and improves rendering
 * 
 * @returns Object with container ref and dimensions
 */
export function useFlowContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isReady, setIsReady] = useState(false);
  const resizeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Helper to measure dimensions safely
    const updateDimensions = () => {
      if (!containerRef.current) return;
      
      // Clear any pending updates
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      
      // Schedule update with slight delay to ensure measurements are accurate
      // and to avoid excessive updates during rapid resizing
      resizeTimeoutRef.current = setTimeout(() => {
        if (!containerRef.current) return;
        
        const { width, height } = containerRef.current.getBoundingClientRect();
        
        // Only update if dimensions have changed significantly
        setDimensions(prev => {
          const hasChanged = 
            Math.abs(prev.width - width) > 2 || 
            Math.abs(prev.height - height) > 2;
            
          return hasChanged ? { width, height } : prev;
        });
        
        // Mark as ready after initial dimension calculation
        if (!isReady && width > 0 && height > 0) {
          setIsReady(true);
        }
      }, 100);
    };
    
    // Set up safe resize handler
    const cleanup = setupSafeReactFlowResizeHandler(containerRef.current);
    
    // Setup event listener for the custom resize event
    const handleSafeResize = () => updateDimensions();
    containerRef.current.addEventListener('safe-flow-resize', handleSafeResize);
    
    // Do initial measurement
    updateDimensions();
    
    // Global resize events (with debounce)
    const handleWindowResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = setTimeout(updateDimensions, 100);
    };
    
    window.addEventListener('resize', handleWindowResize);
    
    // Cleanup
    return () => {
      if (cleanup) cleanup();
      if (containerRef.current) {
        containerRef.current.removeEventListener('safe-flow-resize', handleSafeResize);
      }
      window.removeEventListener('resize', handleWindowResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [isReady]);

  return {
    containerRef,
    dimensions,
    isReady
  };
}