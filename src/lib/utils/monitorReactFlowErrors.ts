import { debounce } from '../utils';

/**
 * Runtime monitor for ReactFlow components to detect and fix unstable behaviors
 */
export function monitorReactFlowErrors() {
  // Only run in browser environment
  if (typeof window === 'undefined') return;
  
  // Prevent duplicate initialization
  if ((window as any).__reactFlowMonitorInitialized) return;
  
  // Track performance metrics for ReactFlow components
  let recentErrors = 0;
  let lastErrorTime = 0;
  let resizeCount = 0;
  let lastResizeTime = 0;
  
  // Check for signs of instability
  const checkForInstability = debounce(() => {
    const now = Date.now();
    
    // Check if we're seeing frequent errors
    if (recentErrors > 3 && now - lastErrorTime < 2000) {
      applyStabilizationFixes();
    }
    
    // Check for resize thrashing
    if (resizeCount > 10 && now - lastResizeTime < 500) {
      applyStabilizationFixes();
    }
    
    // Reset counters periodically
    if (now - lastErrorTime > 5000) {
      recentErrors = 0;
    }
    if (now - lastResizeTime > 2000) {
      resizeCount = 0;
    }
  }, 500);
  
  // Apply fixes to stabilize ReactFlow components
  const applyStabilizationFixes = debounce(() => {
    // Skip if already stabilizing
    if ((window as any).__stabilizing) return;
    (window as any).__stabilizing = true;
    
    // Find all ReactFlow instances
    const flowContainers = document.querySelectorAll('.react-flow-wrapper, .react-flow');
    
    // Apply stabilization fixes to each container
    flowContainers.forEach(container => {
      // Temporarily freeze dimensions
      const rect = container.getBoundingClientRect();
      
      // Only apply to visible elements
      if (rect.width > 0 && rect.height > 0) {
        container.setAttribute('data-frozen', 'true');
        (container as HTMLElement).style.width = `${rect.width}px`;
        (container as HTMLElement).style.height = `${rect.height}px`;
        (container as HTMLElement).style.overflow = 'hidden';
        
        // Force GPU acceleration
        (container as HTMLElement).style.transform = 'translateZ(0)';
        (container as HTMLElement).style.willChange = 'transform';
      }
    });
    
    // Release stabilization after a cooling-off period
    setTimeout(() => {
      flowContainers.forEach(container => {
        container.removeAttribute('data-frozen');
        (container as HTMLElement).style.width = '';
        (container as HTMLElement).style.height = '';
        (container as HTMLElement).style.overflow = '';
        (container as HTMLElement).style.transform = '';
        (container as HTMLElement).style.willChange = '';
      });
      
      (window as any).__stabilizing = false;
      recentErrors = 0;
      resizeCount = 0;
    }, 2000);
  }, 1000, { leading: true, trailing: false });
  
  // Listen for errors
  const originalConsoleError = console.error;
  console.error = function(msg, ...args) {
    // Check for ReactFlow or ResizeObserver errors
    if (typeof msg === 'string' && (
      msg.includes('ResizeObserver') || 
      msg.includes('react-flow') ||
      msg.includes('ReactFlow') ||
      msg.includes('undelivered notifications')
    )) {
      // Track error frequency
      recentErrors++;
      lastErrorTime = Date.now();
      
      // Check if we need to stabilize
      checkForInstability();
      
      // Still log the error in development
      if (process.env.NODE_ENV === 'development') {
        originalConsoleError.apply(console, [
          '%c[Monitored Error]', 
          'color: orange; font-weight: bold;', 
          msg, 
          ...args
        ]);
      }
      
      return;
    }
    
    // Pass through other errors
    return originalConsoleError.apply(console, [msg, ...args]);
  };
  
  // Track resize events
  window.addEventListener('resize', () => {
    resizeCount++;
    lastResizeTime = Date.now();
    checkForInstability();
  });
  
  // Listen for ReactFlow's custom events
  window.addEventListener('flow-resize', () => {
    resizeCount++;
    lastResizeTime = Date.now();
    checkForInstability();
  });
  
  // Mark as initialized
  (window as any).__reactFlowMonitorInitialized = true;
}