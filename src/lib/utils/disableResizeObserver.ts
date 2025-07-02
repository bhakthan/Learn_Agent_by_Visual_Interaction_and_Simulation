/**
 * Function to fix problematic resize observers
 * This is a last resort for fixing React Flow issues
 */
export const disableResizeObserverIfProblematic = () => {
  if (typeof window === 'undefined') return;
  
  // Only apply when we're seeing persistent errors
  const errorCount = (window as any).__resizeObserverErrorCount || 0;
  if (errorCount < 3) return;
  
  // Track if we've already applied the fix
  if ((window as any).__resizeObserverFixed) return;
  (window as any).__resizeObserverFixed = true;
  
  // Find ReactFlow elements
  const reactFlowElements = document.querySelectorAll('.react-flow, .react-flow__viewport, .react-flow__renderer');
  
  reactFlowElements.forEach(el => {
    if (el instanceof HTMLElement) {
      try {
        // Apply optimizations to reduce resize observer activity
        el.style.transform = 'translateZ(0)';
        el.style.contain = 'paint layout';
        el.style.willChange = 'transform';
        
        // Set explicit dimensions to reduce size changes
        if (!el.style.height || el.offsetHeight < 50) {
          const container = el.closest('[data-flow-container]') || el.parentElement;
          if (container) {
            el.style.height = `${Math.max(300, container.offsetHeight)}px`;
          } else {
            el.style.height = '400px';
          }
        }
      } catch (e) {
        // Silent catch - this is a recovery function
      }
    }
  });
  
  // Apply a more drastic fix after multiple errors
  if (errorCount > 5) {
    try {
      // Force all animations to complete
      document.querySelectorAll('.react-flow__edge-path').forEach(el => {
        if (el instanceof SVGElement) {
          el.style.animation = 'none';
        }
      });
      
      // Force a reflow
      document.body.style.opacity = '0.99';
      setTimeout(() => {
        document.body.style.opacity = '1';
      }, 0);
    } catch (e) {
      // Silent catch - this is a recovery function
    }
  }
};