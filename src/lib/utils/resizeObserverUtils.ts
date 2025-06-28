/**
 * Utilities to handle ResizeObserver errors and improve ReactFlow stability
 */

// Track encountered errors to apply adaptive solutions
let resizeObserverErrorCount = 0;
let lastResizeObserverError = 0;
const problematicObservers = new WeakSet();

/**
 * Creates a stable ResizeObserver that won't cause loop errors
 * Implements buffering and error prevention techniques
 */
export function createStableResizeObserver(callback: ResizeObserverCallback): ResizeObserver {
  let isProcessing = false;
  let queuedEntries: ResizeObserverEntry[] = [];
  let frameId: number | null = null;
  
  // Create the actual observer with error prevention
  const observer = new ResizeObserver((entries: ResizeObserverEntry[]) => {
    // If we're already processing entries, queue these for later
    if (isProcessing) {
      queuedEntries = [...queuedEntries, ...entries];
      return;
    }
    
    isProcessing = true;
    
    // Use requestAnimationFrame to prevent rapid successive callbacks
    if (frameId) {
      cancelAnimationFrame(frameId);
    }
    
    frameId = requestAnimationFrame(() => {
      try {
        // Call the callback with the current entries
        callback(entries);
        
        // If we have queued entries, process them next frame
        if (queuedEntries.length > 0) {
          const nextEntries = [...queuedEntries];
          queuedEntries = [];
          
          // Use another rAF to stagger processing
          frameId = requestAnimationFrame(() => {
            callback(nextEntries);
            isProcessing = false;
            frameId = null;
          });
        } else {
          isProcessing = false;
          frameId = null;
        }
      } catch (error) {
        // Recover from errors
        console.warn('ResizeObserver callback error (handled)');
        isProcessing = false;
        queuedEntries = [];
        frameId = null;
      }
    });
  });
  
  // Track this observer for potential future fixes
  problematicObservers.add(observer);
  
  return observer;
}

/**
 * Sets up global error handling for ResizeObserver errors
 */
export function setupResizeObserverErrorHandling() {
  // Create a throttled dispatch function
  let dispatchThrottled = false;
  const throttledDispatch = (eventName: string) => {
    if (dispatchThrottled) return;
    
    dispatchThrottled = true;
    window.dispatchEvent(new CustomEvent(eventName));
    
    setTimeout(() => {
      dispatchThrottled = false;
    }, 250);
  };
  
  // Create error handler 
  const handleError = (event: ErrorEvent | string) => {
    const message = typeof event === 'string' ? event : event.message;
    
    // Check if it's a ResizeObserver error
    if (message && (
      message.includes('ResizeObserver') ||
      message.includes('undelivered notifications') ||
      message.includes('loop')
    )) {
      // Track error frequency 
      const now = Date.now();
      resizeObserverErrorCount++;
      
      if (now - lastResizeObserverError < 1000) {
        // Frequent errors - apply aggressive fixes
        disableResizeObserverIfProblematic(true);
      } else {
        // Occasional errors - apply standard fixes
        disableResizeObserverIfProblematic();
      }
      
      lastResizeObserverError = now;
      
      // Trigger stabilization
      throttledDispatch('flow-force-stabilize');
      
      // Prevent the error from propagating if it's an event
      if (typeof event !== 'string') {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    }
    
    return undefined;
  };
  
  // Add global error handler
  window.addEventListener('error', (event) => {
    return handleError(event);
  }, true);
  
  // Override console.error to catch ResizeObserver errors
  const originalConsoleError = console.error;
  console.error = function(msg: any, ...args: any[]) {
    if (typeof msg === 'string' && (
      msg.includes('ResizeObserver') || 
      msg.includes('undelivered notifications')
    )) {
      handleError(msg);
      return;
    }
    
    // Pass through other errors
    originalConsoleError.apply(console, [msg, ...args]);
  };
}

/**
 * Apply fixes to ReactFlow containers with ResizeObserver issues
 */
export function disableResizeObserverIfProblematic(applyAggressive = false) {
  // Find ReactFlow containers
  const flowContainers = document.querySelectorAll('.react-flow, .react-flow__container, .react-flow__viewport');
  
  flowContainers.forEach(container => {
    if (container instanceof HTMLElement) {
      // Apply basic fixes
      container.style.transform = 'translateZ(0)';
      container.style.contain = 'layout paint';
      
      // Apply aggressive fixes if needed
      if (applyAggressive || resizeObserverErrorCount > 3) {
        // Force hardware acceleration
        container.style.webkitBackfaceVisibility = 'hidden';
        container.style.perspective = '1000px';
        
        // Temporarily pause transitions
        container.style.transition = 'none';
        
        // Fix height if needed
        if ((!container.style.height || parseInt(container.style.height, 10) < 10) && container.parentElement) {
          container.style.height = `${container.parentElement.offsetHeight || 300}px`;
        }
        
        // Restore transitions after a delay
        setTimeout(() => {
          container.style.transition = '';
        }, 1000);
      }
    }
  });
  
  // If we have persistent issues, apply more extensive fixes
  if (resizeObserverErrorCount > 5) {
    document.querySelectorAll('.react-flow-wrapper').forEach(wrapper => {
      if (wrapper instanceof HTMLElement) {
        // Add stabilizing styles to wrapper
        wrapper.style.transform = 'translateZ(0)';
        wrapper.style.position = 'relative';
        wrapper.style.overflow = 'hidden';
      }
    });
    
    // Reset counter to avoid over-applying fixes
    resizeObserverErrorCount = 2;
  }
}

/**
 * Reset ReactFlow rendering to fix common issues
 */
export function resetReactFlowRendering(containerRef: React.RefObject<HTMLElement>) {
  // Skip if no container
  if (!containerRef.current) return;
  
  const container = containerRef.current;
  
  // Find all ReactFlow components in the container
  const reactFlowElements = container.querySelectorAll(
    '.react-flow, .react-flow__container, .react-flow__viewport, .react-flow__renderer'
  );
  
  // Apply fixes to each element
  reactFlowElements.forEach(element => {
    if (element instanceof HTMLElement) {
      // Force hardware acceleration
      element.style.transform = 'translateZ(0)';
      element.style.backfaceVisibility = 'hidden';
      element.style.webkitBackfaceVisibility = 'hidden';
      
      // Ensure proper sizing
      if (!element.style.height || parseInt(element.style.height, 10) < 10) {
        // Try to get height from parent
        if (element.parentElement && element.parentElement.offsetHeight > 10) {
          element.style.height = `${element.parentElement.offsetHeight}px`;
        } else {
          element.style.height = '300px';
        }
      }
      
      // Force repaint to fix rendering issues
      const originalDisplay = element.style.display;
      element.style.display = 'none';
      void element.offsetHeight; // Trigger reflow
      element.style.display = originalDisplay;
    }
  });
  
  // Dispatch event to notify components that a reset occurred
  window.dispatchEvent(new CustomEvent('flow-reset', { 
    detail: { timestamp: Date.now() } 
  }));
}