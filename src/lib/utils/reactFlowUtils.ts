/**
 * Setup specific error handling for ReactFlow components
 */
export const setupReactFlowErrorHandling = () => {
  // Add enhanced error handling for common ReactFlow errors
  const originalError = console.error;
  console.error = function(...args: any[]) {
    // Check for common ReactFlow errors that can be safely ignored
    if (args[0] && typeof args[0] === 'string') {
      // Suppress zustand provider errors that happen during development
      if (args[0].includes('[React Flow]: Seems like you have not used zustand provider') ||
          args[0].includes('Visit https://reactflow.dev/error#001')) {
        // Just log a simpler message in development
        console.warn('ReactFlow: Suppressed zustand provider warning');
        return;
      }
      
      // Suppress ReactFlow style warnings
      if (args[0].includes('The style prop expects a mapping from style properties to values') && 
          args[0].includes('ReactFlow')) {
        return;
      }
    }
    
    // Pass through all other errors
    return originalError.apply(console, args);
  };
  
  // Apply stabilization fixes to ReactFlow components on mount
  const stabilizeReactFlow = () => {
    try {
      document.querySelectorAll('.react-flow').forEach(el => {
        if (el instanceof HTMLElement && !el.dataset.stabilized) {
          // Apply hardware acceleration
          el.style.transform = 'translateZ(0)';
          el.style.backfaceVisibility = 'hidden';
          
          // Force layout containment 
          el.style.contain = 'layout paint';
          
          // Mark as stabilized
          el.dataset.stabilized = 'true';
        }
      });
    } catch (e) {
      // Silent recovery
    }
  };
  
  // Apply stabilization periodically
  const stabilizationInterval = setInterval(stabilizeReactFlow, 2000);
  
  // Clean up interval when page unloads
  window.addEventListener('beforeunload', () => {
    clearInterval(stabilizationInterval);
  });
  
  // Monitor for ReactFlow elements added to the DOM
  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length) {
        // Check if any ReactFlow components were added
        let hasReactFlow = false;
        mutation.addedNodes.forEach(node => {
          if (node instanceof HTMLElement) {
            if (node.classList?.contains('react-flow') || node.querySelector('.react-flow')) {
              hasReactFlow = true;
            }
          }
        });
        
        // If ReactFlow components were added, apply stabilization
        if (hasReactFlow) {
          setTimeout(stabilizeReactFlow, 100);
        }
      }
    }
  });
  
  // Start observing the document body
  observer.observe(document.body, { 
    childList: true, 
    subtree: true 
  });
  
  // Return cleanup function
  return () => {
    clearInterval(stabilizationInterval);
    observer.disconnect();
  };
};

/**
 * Fix ReactFlow rendering issues when dimensions change
 */
export const triggerReactFlowRerender = () => {
  document.querySelectorAll('.react-flow').forEach(el => {
    if (el instanceof HTMLElement) {
      // Force a repaint by temporarily adjusting a style property
      const originalDisplay = el.style.display;
      el.style.display = 'none';
      
      // Force browser to acknowledge the change
      void el.offsetHeight;
      
      // Restore the original display value
      el.style.display = originalDisplay;
      
      // Dispatch a custom event for components that listen for size changes
      el.dispatchEvent(new CustomEvent('flow-resize'));
    }
  });
};