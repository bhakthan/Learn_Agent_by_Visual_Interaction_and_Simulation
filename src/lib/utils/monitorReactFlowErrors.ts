/**
 * Monitor for ReactFlow-specific errors with enhanced recovery
 */
export function monitorReactFlowErrors() {
  // Track ReactFlow error frequency
  let reactFlowErrorCount = 0;
  let lastReactFlowErrorTime = 0;
  
  // Listen for unhandled errors
  window.addEventListener('error', (event) => {
    // Check if error is related to ReactFlow
    if (event.message && (
      event.message.includes('react-flow') || 
      event.message.includes('ReactFlow') ||
      event.message.includes('edge')
    )) {
      const now = Date.now();
      
      // Reset counter if it's been a while
      if (now - lastReactFlowErrorTime > 10000) {
        reactFlowErrorCount = 1;
      } else {
        reactFlowErrorCount++;
      }
      
      lastReactFlowErrorTime = now;
      
      // Apply aggressive fixes if errors persist
      if (reactFlowErrorCount > 3) {
        // Try to reset React Flow instances
        document.querySelectorAll('.react-flow').forEach(el => {
          if (el instanceof HTMLElement) {
            // Force height to ensure visibility
            el.style.height = '300px';
            el.style.minHeight = '300px';
            
            // Force hardware acceleration
            el.style.transform = 'translateZ(0)';
            
            // Create a reset event
            setTimeout(() => {
              try {
                const resetEvent = new CustomEvent('react-flow-reset', {
                  detail: { timestamp: Date.now() }
                });
                window.dispatchEvent(resetEvent);
              } catch (e) {
                // Silently handle errors
              }
            }, 200);
          }
        });
      }
    }
  });
}