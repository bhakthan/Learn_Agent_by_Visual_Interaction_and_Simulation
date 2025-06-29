import { RefObject } from 'react';

/**
 * Setup ReactFlow error handling
 */
export const setupReactFlowErrorHandling = () => {
  // Apply special handling for ReactFlow errors
  const originalError = console.error;
  
  console.error = function(...args: any[]) {
    // Ignore specific ReactFlow errors that aren't critical
    if (args[0] && typeof args[0] === 'string') {
      if (args[0].includes('react-flow') || 
          args[0].includes('ReactFlow') ||
          args[0].includes('Should have a queue') ||
          args[0].includes('invalid hook call')) {
        // Log the error but with reduced visibility
        return originalError.call(console, '%c[Flow Error Suppressed]', 'color: gray', ...args);
      }
    }
    return originalError.call(console, ...args);
  };
};

/**
 * Force reset ReactFlow rendering to fix layout issues
 * @param containerRef Reference to the container element
 */
export const resetReactFlowRendering = (containerRef: RefObject<HTMLElement>) => {
  if (!containerRef.current) return;
  
  try {
    // Force recalculation by applying small style changes
    const viewport = containerRef.current.querySelector('.react-flow__viewport');
    if (viewport instanceof HTMLElement) {
      const currentTransform = viewport.style.transform;
      viewport.style.transform = 'translate(0px, 0px) scale(0.99)';
      
      // Reset after a small delay
      setTimeout(() => {
        if (viewport) {
          viewport.style.transform = currentTransform;
        }
      }, 50);
    }
    
    // Dispatch resize event to force recalculation
    window.dispatchEvent(new Event('resize'));
  } catch (err) {
    console.warn('Error resetting ReactFlow:', err);
  }
};