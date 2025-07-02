/**
 * Utility functions to help stabilize ReactFlow visualizations
 * and prevent ResizeObserver loop errors
 */

/**
 * Applies stability optimizations to ReactFlow components
 * @param container - The container element
 */
export function stabilizeReactFlow(container: HTMLElement | null): void {
  if (!container) return;
  
  // Use RAF for smoother execution
  requestAnimationFrame(() => {
    try {
      // Force hardware acceleration and stability CSS
      container.style.transform = 'translateZ(0)';
      container.style.backfaceVisibility = 'hidden';
      container.style.webkitBackfaceVisibility = 'hidden';
      container.style.contain = 'layout paint style';
      
      // Apply to ReactFlow elements
      const flowElements = container.querySelectorAll('.react-flow, .react-flow__viewport, .react-flow__container');
      flowElements.forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.transform = 'translateZ(0)';
          el.style.backfaceVisibility = 'hidden';
          el.style.webkitBackfaceVisibility = 'hidden';
          el.style.contain = 'layout paint';
        }
      });
      
      // Stabilize edges
      const edgeElements = container.querySelectorAll('.react-flow__edge');
      edgeElements.forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.contain = 'layout style';
        }
      });
      
      // Optimize node rendering
      const nodeElements = container.querySelectorAll('.react-flow__node');
      nodeElements.forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.transform = 'translateZ(0)';
          el.style.backfaceVisibility = 'hidden';
        }
      });
      
      // Force a layout recalculation
      container.getBoundingClientRect();
      
      // Dispatch custom event
      container.dispatchEvent(new CustomEvent('flow-stabilized', { bubbles: true }));
    } catch (e) {
      // Silent error handling
      console.debug('Flow stabilization error (suppressed)');
    }
  });
}

/**
 * Prevents ResizeObserver errors from reaching the console
 */
export function setupErrorSuppression(): () => void {
  // Store original console methods
  const originalConsoleError = console.error;
  
  // Override console.error to filter ResizeObserver errors
  console.error = function(msg: any, ...args: any[]) {
    // Filter out ResizeObserver errors
    if (
      typeof msg === 'string' && 
      (msg.includes('ResizeObserver loop') || 
       msg.includes('ResizeObserver was created') || 
       msg.includes('undelivered notifications'))
    ) {
      // Just ignore these errors
      return;
    }
    
    // Pass through other errors
    return originalConsoleError.apply(console, [msg, ...args]);
  };
  
  // Return cleanup function
  return () => {
    console.error = originalConsoleError;
  };
}

/**
 * Applies an emergency fix to handle severe ResizeObserver loop errors
 * @param recentErrorCount - Number of errors in quick succession
 */
export function emergencyResizeObserverFix(recentErrorCount = 0): void {
  // Only apply drastic fixes if we're seeing many errors
  if (recentErrorCount < 3) return;
  
  // Attempt to find and fix all ReactFlow elements
  requestAnimationFrame(() => {
    try {
      const reactFlowElements = document.querySelectorAll('.react-flow, .react-flow__container, .react-flow__viewport');
      
      reactFlowElements.forEach(el => {
        if (el instanceof HTMLElement) {
          // Apply more aggressive fixes
          el.style.transform = 'translateZ(0)';
          el.style.contain = 'layout paint';
          el.style.overflowY = 'hidden'; // Temporarily freeze scrolling
          
          // Set explicit dimensions to prevent resize loops
          const parent = el.parentElement;
          if (parent && parent.offsetHeight > 0) {
            el.style.height = `${parent.offsetHeight}px`;
          } else {
            el.style.height = '400px';
          }
        }
      });
      
      // Disable animations temporarily
      document.querySelectorAll('.react-flow__edge-path').forEach(el => {
        if (el instanceof SVGElement) {
          el.style.animation = 'none';
        }
      });
      
      // Reset after a delay
      setTimeout(() => {
        document.querySelectorAll('.react-flow__viewport').forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.overflowY = '';
          }
        });
      }, 1000);
      
      // Dispatch global event that our components can listen for
      window.dispatchEvent(new CustomEvent('flow-emergency-stabilize', {
        detail: { timestamp: Date.now() }
      }));
    } catch (e) {
      // Silent catch - this is a recovery function
    }
  });
}