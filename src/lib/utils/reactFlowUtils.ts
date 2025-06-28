/**
 * Utilities for handling ReactFlow-specific issues
 */

/**
 * Setup specific error handling for ReactFlow components
 */
export function setupReactFlowErrorHandling() {
  // Safe attempt to apply ReactFlow-specific fixes
  const applyReactFlowFixes = () => {
    try {
      // Find ReactFlow elements
      const flowElements = document.querySelectorAll('.react-flow');
      
      if (flowElements.length === 0) return;
      
      // Apply fixes to each flow element
      flowElements.forEach(el => {
        if (el instanceof HTMLElement) {
          // Apply hardware acceleration
          el.style.transform = 'translateZ(0)';
          
          // Fix overflow handling
          const container = el.querySelector('.react-flow__container');
          if (container instanceof HTMLElement) {
            container.style.overflow = 'hidden';
          }
          
          // Fix height issues 
          const parent = el.parentElement;
          if (parent && parent.offsetHeight > 10 && (!el.style.height || el.offsetHeight < 10)) {
            el.style.height = `${parent.offsetHeight}px`;
          }
        }
      });
    } catch (error) {
      // Silently handle errors
    }
  };
  
  // Apply initial fixes
  setTimeout(applyReactFlowFixes, 500);
  setTimeout(applyReactFlowFixes, 1500); // Retry after longer delay
  
  // Listen for ReactFlow components being added to the DOM
  try {
    // Use mutation observer to detect when ReactFlow components are added
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          const addedReactFlowElements = Array.from(mutation.addedNodes)
            .filter(node => 
              node instanceof HTMLElement && 
              (
                node.classList.contains('react-flow') || 
                node.querySelector('.react-flow')
              )
            );
            
          if (addedReactFlowElements.length > 0) {
            setTimeout(applyReactFlowFixes, 200);
            break;
          }
        }
      }
    });
    
    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  } catch (error) {
    // Silently handle errors if observer fails
  }
  
  // Override ReactFlow-specific error handlers
  const originalConsoleWarn = console.warn;
  console.warn = function(...args) {
    // Filter out ReactFlow warnings that might cause unnecessary concern
    const firstArg = args[0];
    
    if (typeof firstArg === 'string' && (
      firstArg.includes('react-flow') || 
      firstArg.includes('ReactFlow') ||
      firstArg.includes('edge')
    )) {
      // Always apply fixes when ReactFlow warnings appear
      setTimeout(applyReactFlowFixes, 100);
      
      // Only log in development environments
      if (window.location.hostname === 'localhost') {
        originalConsoleWarn.apply(console, args);
      }
      
      return;
    }
    
    // Pass through other warnings
    originalConsoleWarn.apply(console, args);
  };
}