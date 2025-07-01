/**
 * Advanced monitoring for ReactFlow errors with progressive handling strategies
 */

interface ErrorCounters {
  resizeObserver: number;
  reactFlow: number;
  lastError: number;
  recoveryAttempts: number;
}

const counters: ErrorCounters = {
  resizeObserver: 0,
  reactFlow: 0,
  lastError: 0,
  recoveryAttempts: 0
};

/**
 * Sets up comprehensive error monitoring for ReactFlow with adaptive handling
 */
export const monitorReactFlowErrors = () => {
  // Skip if already monitoring
  if ((window as any).__reactFlowMonitoring) {
    return;
  }
  
  (window as any).__reactFlowMonitoring = true;
  
  // Override console.error to catch React Flow errors
  const originalError = console.error;
  console.error = function(...args: any[]) {
    try {
      // Check for React Flow or related errors
      if (args[0] && typeof args[0] === 'string') {
        const msg = args[0];
        const now = Date.now();
        
        if (msg.includes('ResizeObserver') || msg.includes('undelivered notifications')) {
          // Count ResizeObserver errors
          counters.resizeObserver++;
          counters.lastError = now;
          
          // Apply progressive fixes based on error frequency
          if (counters.resizeObserver > 3) {
            applyReactFlowFixes('resize');
            
            // Don't log these to console in production
            if (process.env.NODE_ENV !== 'development') {
              return;
            }
          }
        }
        else if (msg.includes('react-flow') || msg.includes('ReactFlow') || 
                 msg.includes('edges') || msg.includes('nodes')) {
          // Count ReactFlow errors
          counters.reactFlow++;
          counters.lastError = now;
          
          // Apply fixes for ReactFlow specific issues
          if (counters.reactFlow > 2) {
            applyReactFlowFixes('flow');
          }
        }
        
        // Reset counters after a period of no errors
        if (now - counters.lastError > 10000) {
          counters.resizeObserver = 0;
          counters.reactFlow = 0;
          counters.recoveryAttempts = 0;
        }
      }
    } catch (e) {
      // If our error handling errors, don't make things worse
    }
    
    // Pass through to original console.error
    return originalError.apply(console, args);
  };
  
  // Add window error handler to catch uncaught errors
  window.addEventListener('error', (e) => {
    if (e.message && (
      e.message.includes('ResizeObserver') || 
      e.message.includes('undelivered') ||
      e.message.includes('react-flow') ||
      e.message.includes('ReactFlow')
    )) {
      e.preventDefault();
      
      // Apply fixes based on error type
      const errorType = e.message.includes('ResizeObserver') ? 'resize' : 'flow';
      applyReactFlowFixes(errorType);
      
      return false;
    }
  }, true);
};

/**
 * Apply progressive fixes based on error type with increasing aggressiveness
 */
const applyReactFlowFixes = (errorType: 'resize' | 'flow') => {
  // Throttle fixes to prevent overwhelming the browser
  const now = Date.now();
  if ((window as any).__lastFixTime && now - (window as any).__lastFixTime < 2000) {
    return;
  }
  (window as any).__lastFixTime = now;
  
  // Increment recovery attempts
  counters.recoveryAttempts++;
  
  // Schedule fix with RAF for smoother handling
  requestAnimationFrame(() => {
    try {
      // Apply common fixes
      stabilizeReactFlowElements();
      
      // Type-specific fixes with progressive intensity
      if (errorType === 'resize') {
        // Apply resize-specific fixes
        handleResizeObserverErrors(counters.recoveryAttempts);
      } else {
        // Apply ReactFlow-specific fixes
        handleReactFlowErrors(counters.recoveryAttempts);
      }
      
      // Force layout recalculation
      document.body.style.opacity = '0.99';
      setTimeout(() => {
        document.body.style.opacity = '1';
      }, 50);
      
      // Dispatch an event that can be listened for
      window.dispatchEvent(new CustomEvent('flow-error-recovery', {
        detail: { errorType, timestamp: now }
      }));
    } catch (e) {
      // Silently handle recovery errors
    }
  });
};

/**
 * Apply fixes specifically for ResizeObserver errors
 */
const handleResizeObserverErrors = (attempts: number) => {
  // Find all ReactFlow elements
  document.querySelectorAll('.react-flow, .react-flow__container, .react-flow__viewport').forEach(el => {
    if (el instanceof HTMLElement) {
      // Apply hardware acceleration
      el.style.transform = 'translateZ(0)';
      el.style.webkitBackfaceVisibility = 'hidden';
      el.style.contain = 'layout paint';
      
      // Set explicit dimensions to prevent ResizeObserver loops
      const parent = el.parentElement;
      if (parent && parent.offsetHeight > 20) {
        el.style.height = `${parent.offsetHeight}px`;
        
        // For more aggressive fixes at higher attempts
        if (attempts > 5) {
          el.style.width = `${parent.offsetWidth}px`;
          el.style.position = 'relative';
        }
      }
    }
  });
  
  // For severe cases, temporarily freeze all animations
  if (attempts > 8) {
    document.querySelectorAll('.react-flow__edge-path, .react-flow .animated').forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.animationPlayState = 'paused';
        
        // Resume animations after a delay
        setTimeout(() => {
          el.style.animationPlayState = '';
        }, 2000);
      }
    });
  }
};

/**
 * Apply fixes specifically for ReactFlow rendering errors
 */
const handleReactFlowErrors = (attempts: number) => {
  // Find specific ReactFlow problem elements
  document.querySelectorAll('.react-flow__edge, .react-flow__connection').forEach(el => {
    if (el instanceof SVGElement) {
      // Apply visibility toggle to force redraw
      el.style.opacity = '0';
      
      setTimeout(() => {
        el.style.opacity = '1';
      }, 50);
    }
  });
  
  // For more severe cases, try more aggressive fixes
  if (attempts > 3) {
    // Force trigger fitView
    window.dispatchEvent(new Event('resize'));
  }
};

/**
 * Apply general stabilization to ReactFlow elements
 */
const stabilizeReactFlowElements = () => {
  // Apply performance optimizations to all flow containers
  document.querySelectorAll('[data-reactflow], [data-visualization="reactflow"], .flow-container').forEach(el => {
    if (el instanceof HTMLElement) {
      // Apply hardware acceleration and rendering optimizations
      el.style.transform = 'translateZ(0)';
      el.style.webkitBackfaceVisibility = 'hidden';
      el.style.contain = 'layout paint';
    }
  });
};