/**
 * Comprehensive optimization utility for ReactFlow
 * Combines all optimization techniques in one place
 */

import { setupReactFlowErrorHandling } from './reactFlowFixUtils';
import { setupResizeObserverErrorHandling } from './resizeObserverUtils';
import { monitorReactFlowErrors } from './monitorReactFlowErrors';
import { disableResizeObserverIfProblematic } from './disableResizeObserver';

/**
 * Configure all ReactFlow optimizations
 * @param options Configuration options
 */
export const optimizeReactFlow = (options: {
  monitorErrors?: boolean;
  stabilizeOnResize?: boolean;
  disableProblematicObservers?: boolean;
} = {}) => {
  const {
    monitorErrors = true,
    stabilizeOnResize = true,
    disableProblematicObservers = true
  } = options;
  
  // Set up all error handling mechanisms
  setupResizeObserverErrorHandling();
  setupReactFlowErrorHandling();
  
  // Additional monitoring if requested
  if (monitorErrors) {
    monitorReactFlowErrors();
  }
  
  // Handle window events
  const handleVisibilityChange = () => {
    if (!document.hidden && stabilizeOnResize) {
      // Force layout recalculation when tab becomes visible
      requestAnimationFrame(() => {
        document.body.style.opacity = '0.99';
        requestAnimationFrame(() => {
          document.body.style.opacity = '1';
        });
      });
    }
  };
  
  // Apply adaptive optimizations
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Add class to body for CSS optimization hooks
  document.body.classList.add('reactflow-optimized');
  
  // Handle severe errors
  if (disableProblematicObservers) {
    window.addEventListener('error', (e) => {
      if (e.message && (
        e.message.includes('ResizeObserver loop') ||
        e.message.includes('Maximum update depth exceeded') ||
        (e.message.includes('ResizeObserver') && e.message.includes('notifications'))
      )) {
        e.preventDefault();
        e.stopPropagation();
        
        // Apply aggressive recovery for severe errors
        disableResizeObserverIfProblematic();
        
        return false;
      }
    }, true);
  }
  
  // Return cleanup function
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
};

/**
 * Apply optimizations to a specific ReactFlow container
 * @param container DOM element containing ReactFlow
 */
export const optimizeReactFlowContainer = (container: HTMLElement) => {
  // Add optimization classes and attributes
  container.classList.add('reactflow-container-optimized');
  container.setAttribute('data-reactflow-optimized', 'true');
  
  // Apply rendering optimizations
  container.style.transform = 'translateZ(0)';
  container.style.backfaceVisibility = 'hidden';
  container.style.webkitBackfaceVisibility = 'hidden';
  
  // Ensure explicit dimensions
  if (!container.style.height || parseInt(container.style.height) < 20) {
    container.style.height = '400px';
  }
  
  // Optimize internal elements
  const viewport = container.querySelector('.react-flow__viewport');
  if (viewport instanceof HTMLElement) {
    viewport.style.transform = 'translateZ(0)';
    viewport.style.backfaceVisibility = 'hidden';
    viewport.style.webkitBackfaceVisibility = 'hidden';
  }
  
  // Add observer for container size changes
  const observer = new ResizeObserver((entries) => {
    // Use RAF to smooth the response
    requestAnimationFrame(() => {
      // Force recalculation on resize
      const reactFlowInstance = (container as any).__rf;
      if (reactFlowInstance && typeof reactFlowInstance.fitView === 'function') {
        try {
          reactFlowInstance.fitView();
        } catch (e) {
          // Silent handling
        }
      }
    });
  });
  
  try {
    observer.observe(container);
  } catch (e) {
    // Silent handling if ResizeObserver is problematic
  }
  
  // Return cleanup function
  return () => {
    try {
      observer.disconnect();
    } catch (e) {
      // Silent cleanup
    }
  };
};