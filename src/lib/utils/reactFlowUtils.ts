/**
 * Utility functions for handling ReactFlow-specific errors and optimizations
 */

/**
 * Sets up global error handling specifically for ReactFlow components
 */
export const setupReactFlowErrorHandling = () => {
  // Only run in browser environment
  if (typeof window === 'undefined') return;

  // Set up stable references for ReactFlow's built-in classes
  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      // Find ReactFlow elements
      const rfElements = document.querySelectorAll('.react-flow');
      
      // Apply performance optimizations to ReactFlow elements
      rfElements.forEach(el => {
        if (el instanceof HTMLElement) {
          // Force hardware acceleration
          el.style.transform = 'translateZ(0)';
          el.style.backfaceVisibility = 'hidden';
          
          // Ensure sensible minimums for dimensions
          if (!el.style.height || parseInt(el.style.height) < 100) {
            el.style.minHeight = '200px';
          }
          
          // Mark as optimized
          el.dataset.optimized = 'true';
        }
      });
    }, 500);
  });
  
  // Special handler for ReactFlow errors
  const originalConsoleWarn = console.warn;
  console.warn = function(msg, ...args) {
    // Suppress common ReactFlow warnings about pane ready
    if (
      typeof msg === 'string' && 
      (msg.includes('react-flow') || msg.includes('React Flow')) &&
      msg.includes('pane is not ready')
    ) {
      return; // Suppress warning
    }
    
    // Pass through all other warnings
    return originalConsoleWarn.apply(console, [msg, ...args]);
  };
};

/**
 * Trigger a recalculation of ReactFlow viewport
 * @param ref Ref to the ReactFlow container
 */
export const resetReactFlowRendering = (ref: React.RefObject<HTMLDivElement>) => {
  if (!ref.current) return;
  
  // Use requestAnimationFrame for smoother handling
  requestAnimationFrame(() => {
    // Force reflow with minimal DOM manipulation
    const container = ref.current;
    if (!container) return;
    
    // Cache current size
    const currentWidth = container.offsetWidth;
    const currentHeight = container.offsetHeight;
    
    // Dispatch custom event that components can listen for
    container.dispatchEvent(new CustomEvent('flow-rerender', { 
      bubbles: true,
      detail: { timestamp: Date.now(), width: currentWidth, height: currentHeight }
    }));
    
    // Dispatch a gentle resize event with RAF for smoother handling
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'));
    });
  });
};