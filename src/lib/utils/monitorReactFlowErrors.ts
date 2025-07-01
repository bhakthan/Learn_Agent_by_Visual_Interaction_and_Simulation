/**
 * Monitor for ReactFlow-specific errors and apply targeted fixes
 * This helps prevent the recurring ResizeObserver errors
 */
export const monitorReactFlowErrors = () => {
  // Set up error monitoring with specific fixes for ReactFlow
  const errorCounters = {
    resizeObserver: 0,
    reactFlow: 0,
    lastErrorTime: 0,
  };
  
  // Track ReactFlow instances that have errors
  const problematicElements = new WeakSet();
  
  // Helper to debounce callbacks
  const debounce = (fn: Function, ms = 300) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return function(...args: any[]) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), ms);
    };
  };
  
  // Apply fixes to ReactFlow instances with problems
  const applyFixesToProblematicElements = debounce(() => {
    document.querySelectorAll('.react-flow').forEach(el => {
      if (el instanceof HTMLElement) {
        // Apply common fixes to prevent ResizeObserver issues
        el.style.transform = 'translateZ(0)';
        el.style.backfaceVisibility = 'hidden';
        
        // Set fixed dimensions if element has zero size or is collapsed
        const rect = el.getBoundingClientRect();
        if (rect.width < 10 || rect.height < 10) {
          // Parent probably has CSS issues, force dimensions
          el.style.width = '100%';
          el.style.height = '400px';
          el.style.minHeight = '300px';
        }
        
        // Set overflow handling to prevent feedback loops
        el.style.overflow = 'hidden';
        el.style.contain = 'layout paint';
        
        // Dispatch a custom event so components can respond
        el.dispatchEvent(new CustomEvent('flow-stabilized'));
      }
    });
    
    // Reset error counters after applying fixes
    errorCounters.resizeObserver = 0;
    errorCounters.reactFlow = 0;
  }, 500);
  
  // Listen for ResizeObserver errors
  const originalError = console.error;
  console.error = function(...args: any[]) {
    // Check if this is a ResizeObserver or ReactFlow error
    if (args[0] && typeof args[0] === 'string') {
      const now = Date.now();
      const timeSinceLastError = now - errorCounters.lastErrorTime;
      
      // Reset counters if it's been a while
      if (timeSinceLastError > 10000) {
        errorCounters.resizeObserver = 0;
        errorCounters.reactFlow = 0;
      }
      
      errorCounters.lastErrorTime = now;
      
      // Detect ResizeObserver errors
      if (args[0].includes('ResizeObserver loop') || 
          args[0].includes('undelivered notifications')) {
        errorCounters.resizeObserver++;
        
        // If we're seeing multiple errors, apply fixes
        if (errorCounters.resizeObserver > 2) {
          applyFixesToProblematicElements();
          return; // Suppress the error
        }
      }
      
      // Detect ReactFlow specific errors
      if (args[0].includes('react-flow') || 
          args[0].includes('ReactFlow') ||
          args[0].includes('zustand')) {
        errorCounters.reactFlow++;
        
        // Apply fixes after multiple ReactFlow errors
        if (errorCounters.reactFlow > 2) {
          applyFixesToProblematicElements();
          return; // Suppress the error
        }
      }
    }
    
    // Pass through all other errors
    return originalError.apply(console, args);
  };
  
  // Detect when ReactFlow elements have rendering issues
  const observer = new MutationObserver(mutations => {
    let flowElementChanged = false;
    
    for (const mutation of mutations) {
      if (mutation.target instanceof HTMLElement) {
        if (mutation.target.classList?.contains('react-flow') ||
            mutation.target.closest('.react-flow')) {
          flowElementChanged = true;
          break;
        }
      }
    }
    
    // If ReactFlow elements changed significantly, check for issues
    if (flowElementChanged) {
      setTimeout(() => {
        document.querySelectorAll('.react-flow').forEach(el => {
          if (el instanceof HTMLElement) {
            // Check for issues
            const rect = el.getBoundingClientRect();
            if (rect.width < 10 || rect.height < 10) {
              problematicElements.add(el);
              applyFixesToProblematicElements();
            }
          }
        });
      }, 500);
    }
  });
  
  // Start observing with attributes that affect layout
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class', 'width', 'height']
  });
  
  // Return cleanup function
  return () => {
    observer.disconnect();
  };
};