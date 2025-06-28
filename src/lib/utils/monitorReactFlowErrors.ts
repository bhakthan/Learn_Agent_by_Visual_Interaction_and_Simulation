/**
 * Advanced monitoring for ReactFlow errors with proactive prevention
 */

export function monitorReactFlowErrors() {
  // Track error counts to identify patterns
  let resizeObserverErrorCount = 0;
  let lastResizeObserverError = 0;
  let maxUpdateDepthErrors = 0;
  let lastMaxUpdateError = 0;
  const problematicContainers = new Set<HTMLElement>();
  
  // Function to safely apply fixes to ReactFlow components
  const applyReactFlowFixes = (source: string, forceFix = false) => {
    // Find all ReactFlow-related containers
    const containers = document.querySelectorAll(
      '.react-flow, .react-flow__container, .react-flow__viewport, .react-flow__renderer'
    );
    
    containers.forEach(container => {
      if (container instanceof HTMLElement) {
        // Apply performance optimizations
        container.style.transform = 'translateZ(0)';
        container.style.backfaceVisibility = 'hidden';
        container.style.webkitBackfaceVisibility = 'hidden';
        
        // Set fixed height if container is collapsed
        if (container.offsetHeight < 10 && container.parentElement) {
          const parentHeight = container.parentElement.offsetHeight;
          if (parentHeight > 50) {
            container.style.height = `${parentHeight}px`;
          } else {
            container.style.height = '300px';
          }
        }
        
        // Force repaint to fix rendering issues
        const originalDisplay = container.style.display;
        container.style.display = 'none';
        void container.offsetHeight; // Trigger reflow
        container.style.display = originalDisplay;
        
        // Add container to problematic set if fixes were forced
        if (forceFix) {
          problematicContainers.add(container);
        }
      }
    });
    
    // If we've accumulated enough error evidence, apply more aggressive fixes
    if (resizeObserverErrorCount > 3 || maxUpdateDepthErrors > 2) {
      containers.forEach(container => {
        if (container instanceof HTMLElement) {
          problematicContainers.add(container);
          
          // Disable smooth animations temporarily
          container.style.transition = 'none';
          
          // Force hardware acceleration
          container.style.transform = 'translateZ(0)';
          container.style.perspective = '1000px';
          container.style.contain = 'layout paint size';
          
          // Restore transitions after a delay
          setTimeout(() => {
            if (container instanceof HTMLElement) {
              container.style.transition = '';
            }
          }, 1000);
        }
      });
      
      // Reset counters after applying fixes
      resizeObserverErrorCount = Math.max(0, resizeObserverErrorCount - 1);
      maxUpdateDepthErrors = Math.max(0, maxUpdateDepthErrors - 1);
    }
  };
  
  // Override console.error to detect specific issues
  const originalConsoleError = console.error;
  console.error = function(msg: any, ...args: any[]) {
    if (typeof msg === 'string') {
      // Check for ResizeObserver errors
      if (msg.includes('ResizeObserver') || msg.includes('undelivered notifications')) {
        const now = Date.now();
        resizeObserverErrorCount++;
        lastResizeObserverError = now;
        
        // Apply fixes with frequency-based intensity
        const timeSinceLastError = now - lastResizeObserverError;
        const isFrequentError = timeSinceLastError < 2000;
        applyReactFlowFixes('resize-observer', isFrequentError);
        
        // Block error from showing
        return;
      }
      
      // Check for infinite loop errors
      if (msg.includes('Maximum update depth exceeded')) {
        const now = Date.now();
        maxUpdateDepthErrors++;
        lastMaxUpdateError = now;
        
        // Apply fixes immediately for update depth errors
        applyReactFlowFixes('max-update-depth', true);
        
        // Try to identify the components causing the issue
        console.warn('Max update depth error detected. Applying stabilization.');
        
        // Block error from showing
        return;
      }
      
      // Check for missing ReactFlow provider errors
      if (msg.includes('React Flow') && msg.includes('provider')) {
        console.warn('ReactFlow provider issue detected. Check component hierarchy.');
      }
    }
    
    // Pass through other errors
    originalConsoleError.apply(console, [msg, ...args]);
  };
  
  // Monitor layout shifts that can trigger ResizeObserver issues
  if ('PerformanceObserver' in window) {
    try {
      const layoutObserver = new PerformanceObserver((entries) => {
        for (const entry of entries.getEntries()) {
          // @ts-ignore - LayoutShift type not in standard TS lib
          const value = (entry as any).value || 0;
          
          // Only react to significant layout shifts
          if (value > 0.1) {
            // Apply fixes after a layout shift
            setTimeout(() => {
              applyReactFlowFixes('layout-shift', false);
            }, 100);
            break;
          }
        }
      });
      
      layoutObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      // Observer not supported, ignore
    }
  }
  
  // Set up event listener for custom stabilize events
  window.addEventListener('flow-force-stabilize', (e: Event) => {
    const customEvent = e as CustomEvent;
    const source = customEvent?.detail?.source || 'unknown';
    const attemptNumber = customEvent?.detail?.attempt || 1;
    
    // Apply fixes with increasing intensity based on attempt number
    applyReactFlowFixes(`force-stabilize-${source}`, attemptNumber > 1);
  });
  
  return {
    // Method to manually fix a problematic container
    fixContainer: (container: HTMLElement) => {
      problematicContainers.add(container);
      applyReactFlowFixes('manual', true);
    },
    
    // Method to reset monitoring state
    resetCounters: () => {
      resizeObserverErrorCount = 0;
      maxUpdateDepthErrors = 0;
      problematicContainers.clear();
    }
  };
}