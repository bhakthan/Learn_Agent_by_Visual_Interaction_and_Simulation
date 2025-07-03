/**
 * Utilities to handle and prevent ResizeObserver loop errors
 */

/**
 * Debounce function to limit execution frequency
 */
function debounce(func: Function, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: any[]) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Apply ResizeObserver error suppression
 * Returns a cleanup function to restore original error handlers
 */
export function setupResizeObserverErrorHandling() {
  // Store original console error method
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
  
  // Add global error handler for ResizeObserver errors
  const errorHandler = (e: ErrorEvent) => {
    if (e.message && e.message.includes('ResizeObserver')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };
  
  window.addEventListener('error', errorHandler, true);
  
  // Return cleanup function
  return () => {
    console.error = originalConsoleError;
    window.removeEventListener('error', errorHandler, true);
  };
}

/**
 * Disable problematic ResizeObservers after too many errors
 */
export function disableResizeObserverIfProblematic() {
  // This is a last-resort fix when all else fails
  try {
    // Find all ReactFlow elements
    const flowElements = document.querySelectorAll('.react-flow, .react-flow__container');
    flowElements.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.overflow = 'hidden'; // Temporarily freeze scrolling
        el.style.height = el.offsetHeight + 'px'; // Fix height
        el.style.width = el.offsetWidth + 'px'; // Fix width
        
        // Reset after a delay
        setTimeout(() => {
          el.style.overflow = '';
        }, 1000);
      }
    });
  } catch (e) {
    // Silent recovery
  }
}

export default { setupResizeObserverErrorHandling, disableResizeObserverIfProblematic };