/**
 * Utility functions to improve ReactFlow rendering stability and prevent ResizeObserver errors
 */

/**
 * Sets up error handling specifically for ReactFlow components
 */
export function setupReactFlowErrorHandling() {
  // Create a debounced event dispatcher to prevent multiple recalculations
  let recalculationTimer: number | null = null;
  
  // Track flow components that have reported errors
  const problematicFlowContainers = new Set<HTMLElement>();
  
  // Function to handle ResizeObserver errors in ReactFlow components
  const handleReactFlowError = (event: Event | string) => {
    if (
      (typeof event === 'string' && (
        event.includes('ResizeObserver') || 
        event.includes('loop') || 
        event.includes('Maximum update depth exceeded')
      )) ||
      (event instanceof ErrorEvent && event.message && (
        event.message.includes('ResizeObserver') || 
        event.message.includes('loop') || 
        event.message.includes('Maximum update depth exceeded')
      ))
    ) {
      // Find all ReactFlow containers
      const containers = document.querySelectorAll('.react-flow, .react-flow-wrapper');
      
      // Apply stability fixes to all containers
      containers.forEach(container => {
        if (container instanceof HTMLElement) {
          // Add to problematic containers set
          problematicFlowContainers.add(container);
          
          // Apply immediate stability fixes
          container.style.transform = 'translateZ(0)';
          container.style.contain = 'layout paint';
          
          // If container has no explicit height, give it one
          if (!container.style.height || parseInt(container.style.height, 10) < 10) {
            container.style.height = '300px';
          }
        }
      });
      
      // Debounce flow recalculation
      if (recalculationTimer) {
        window.clearTimeout(recalculationTimer);
      }
      
      recalculationTimer = window.setTimeout(() => {
        // Trigger a flow-specific resize event
        window.dispatchEvent(new CustomEvent('flow-force-stabilize', {
          detail: { source: 'error-handler' }
        }));
        
        recalculationTimer = null;
      }, 300);
      
      // Prevent error propagation for ErrorEvent
      if (event instanceof ErrorEvent) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    }
    
    return undefined;
  };
  
  // Set up global error handling for ResizeObserver errors
  window.addEventListener('error', (event) => {
    return handleReactFlowError(event);
  }, true);
  
  // Override console.error to catch ReactFlow errors
  const originalConsoleError = console.error;
  console.error = function(msg: any, ...args: any[]) {
    if (typeof msg === 'string' && (
      msg.includes('ResizeObserver') || 
      msg.includes('react-flow') || 
      msg.includes('Maximum update depth exceeded')
    )) {
      handleReactFlowError(msg);
    } else {
      originalConsoleError.apply(console, [msg, ...args]);
    }
  };
}

/**
 * Applies memoization to expensive component calculations
 * to prevent unnecessary re-renders and reduce CPU load
 * 
 * @param Component The React component to optimize
 * @param propsAreEqual Optional function to determine when props have changed
 */
export function memoizeWithPropsCheck<P extends object>(
  Component: React.ComponentType<P>,
  propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
): React.MemoExoticComponent<React.ComponentType<P>> {
  // Default comparison function that does a shallow check of all props
  const defaultPropsAreEqual = (prevProps: Readonly<P>, nextProps: Readonly<P>): boolean => {
    const prevKeys = Object.keys(prevProps);
    const nextKeys = Object.keys(nextProps);
    
    if (prevKeys.length !== nextKeys.length) return false;
    
    // Check each prop for equality
    for (const key of prevKeys) {
      if ((prevProps as any)[key] !== (nextProps as any)[key]) {
        return false;
      }
    }
    
    return true;
  };
  
  // Return the memoized component
  return React.memo(Component, propsAreEqual || defaultPropsAreEqual);
}