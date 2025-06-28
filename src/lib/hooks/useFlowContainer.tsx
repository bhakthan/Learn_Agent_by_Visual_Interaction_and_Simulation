import { useEffect, useRef } from 'react';
import { useReactFlow } from 'reactflow';

/**
 * Helper hook for optimizing React Flow container performance
 * and preventing ResizeObserver loop completed issues
 */
export function useFlowContainer<T extends HTMLElement = HTMLDivElement>(): React.RefObject<T> {
  const containerRef = useRef<T>(null);
  const { fitView } = useReactFlow();
  
  useEffect(() => {
    // Initial fit view with a small delay to ensure proper rendering
    const initialFitTimeout = setTimeout(() => {
      if (containerRef.current) {
        fitView({ duration: 200, padding: 0.1 });
      }
    }, 100);
    
    // Handle window resize efficiently to prevent excessive calculations
    let resizeTimeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (containerRef.current) {
          fitView({ duration: 50, padding: 0.1 });
        }
      }, 200);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Handle layout change events from the parent layout
    // This custom event should be dispatched when sidebar toggles, etc.
    const handleLayoutChange = () => {
      clearTimeout(resizeTimeout);
      // Delay more to allow animation to complete
      resizeTimeout = setTimeout(() => {
        if (containerRef.current) {
          fitView({ duration: 200, padding: 0.1 });
        }
      }, 300);
    };
    
    window.addEventListener('layout-change', handleLayoutChange);
    
    return () => {
      clearTimeout(initialFitTimeout);
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('layout-change', handleLayoutChange);
    };
  }, [fitView]);
  
  return containerRef;
}

export default useFlowContainer;