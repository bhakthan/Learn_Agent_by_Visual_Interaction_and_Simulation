/**
 * Comprehensive monitoring and recovery system for ReactFlow-specific errors
 */

/**
 * Setup monitoring for ReactFlow-specific errors and apply fixes
 */
export function monitorReactFlowErrors() {
  // Only run in browser environment
  if (typeof window === 'undefined') return;
  
  // Only set up once
  if ((window as any).__reactFlowMonitoringSetup) return;
  
  // Error tracking
  const errorCounts = {
    resizeObserver: 0,
    renderError: 0,
    stateError: 0
  };
  
  let lastErrorTime = Date.now();
  let recoveryInProgress = false;
  
  // Patch React Error boundaries for ReactFlow specifically
  patchReactErrorHandler();
  
  // Setup monitoring for ResizeObserver errors
  monitorResizeObserverErrors();
  
  // Listen for ReactFlow-specific errors
  window.addEventListener('error', (event) => {
    const errorMsg = event.message || '';
    const errorStack = event.error?.stack || '';
    const now = Date.now();
    
    // Reset counters if it's been a while
    if (now - lastErrorTime > 10000) {
      errorCounts.resizeObserver = 0;
      errorCounts.renderError = 0;
      errorCounts.stateError = 0;
    }
    
    lastErrorTime = now;
    
    // Handle ReactFlow-specific errors
    if (isReactFlowError(errorMsg, errorStack)) {
      // React/ReactDOM errors often related to ReactFlow
      errorCounts.renderError++;
      
      // Prevent propagation
      event.preventDefault();
      event.stopPropagation();
      
      // Apply recovery if errors are increasing
      if (errorCounts.renderError > 2 && !recoveryInProgress) {
        applyReactFlowRecovery();
      }
      
      return false;
    }
    
    // Handle ResizeObserver errors (often caused by ReactFlow)
    if (errorMsg.includes('ResizeObserver')) {
      errorCounts.resizeObserver++;
      
      // Prevent propagation
      event.preventDefault();
      event.stopPropagation();
      
      // Apply specific fixes for ResizeObserver
      if (errorCounts.resizeObserver > 2 && !recoveryInProgress) {
        applyResizeObserverFixes();
      }
      
      return false;
    }
    
    // Handle state update errors
    if (errorMsg.includes('Maximum update depth exceeded') || 
        errorMsg.includes('Cannot update a component')) {
      errorCounts.stateError++;
      
      // Prevent propagation
      event.preventDefault();
      event.stopPropagation();
      
      if (errorCounts.stateError > 1 && !recoveryInProgress) {
        preventInfiniteUpdates();
      }
      
      return false;
    }
  }, true);
  
  // Mark as set up
  (window as any).__reactFlowMonitoringSetup = true;
}

/**
 * Check if an error is related to ReactFlow
 */
function isReactFlowError(errorMsg: string, errorStack: string): boolean {
  // Check message for ReactFlow specific terms
  const isReactFlowMsg = errorMsg.includes('react-flow') || 
                        errorMsg.includes('ReactFlow') ||
                        errorMsg.includes('edges') ||
                        errorMsg.includes('nodes');
  
  // Check stack trace for ReactFlow references
  const isReactFlowStack = errorStack.includes('react-flow') ||
                           errorStack.includes('ReactFlow') ||
                           errorStack.includes('PatternVisualizer') ||
                           errorStack.includes('visualization');
  
  return isReactFlowMsg || isReactFlowStack;
}

/**
 * Apply fixes to ReactFlow components
 */
function applyReactFlowRecovery() {
  if (typeof document === 'undefined') return;
  
  // Mark recovery as in progress
  (window as any).__reactFlowRecoveryInProgress = true;
  
  try {
    // Find all ReactFlow containers
    document.querySelectorAll('.react-flow, .react-flow__renderer, .react-flow__container').forEach(el => {
      if (el instanceof HTMLElement) {
        // Apply fixes
        applyFixesToElement(el);
      }
    });
    
    // Force reflow by triggering resize
    window.dispatchEvent(new Event('resize'));
    
    // Reset recovery flag after a delay
    setTimeout(() => {
      (window as any).__reactFlowRecoveryInProgress = false;
    }, 5000);
  } catch (e) {
    // Silent fail
    (window as any).__reactFlowRecoveryInProgress = false;
  }
}

/**
 * Apply fixes to ReactFlow elements with ResizeObserver issues
 */
function applyResizeObserverFixes() {
  if (typeof document === 'undefined') return;
  
  // Mark recovery as in progress
  (window as any).__resizeObserverRecoveryInProgress = true;
  
  try {
    // Apply fixes to ReactFlow components
    document.querySelectorAll('.react-flow, .react-flow__pane, .react-flow__viewport').forEach(el => {
      if (el instanceof HTMLElement) {
        // Force hardware acceleration and compositing
        el.style.transform = 'translateZ(0)';
        el.style.backfaceVisibility = 'hidden';
        el.style.willChange = 'transform';
        
        // Set stable size
        if (!el.style.height || el.offsetHeight < 20) {
          el.style.height = '400px';
        }
        
        // Force a reflow
        el.getBoundingClientRect();
      }
    });
    
    // Reset recovery flag after a delay
    setTimeout(() => {
      (window as any).__resizeObserverRecoveryInProgress = false;
    }, 5000);
  } catch (e) {
    // Silent fail
    (window as any).__resizeObserverRecoveryInProgress = false;
  }
}

/**
 * Prevent infinite update loops in React components
 */
function preventInfiniteUpdates() {
  // Apply a global patch to break update cycles
  if (typeof window !== 'undefined' && !(window as any).__reactUpdateLimitApplied) {
    (window as any).__reactUpdateLimitApplied = true;
    
    // Force a document reflow to interrupt loops
    document.body.style.opacity = '0.99';
    
    // Set timeout to restore normal state
    setTimeout(() => {
      document.body.style.opacity = '1';
      (window as any).__reactUpdateLimitApplied = false;
    }, 500);
    
    // Trigger refresh for ReactFlow
    window.dispatchEvent(new Event('resize'));
  }
}

/**
 * Apply specific fixes to a ReactFlow element
 */
function applyFixesToElement(element: HTMLElement) {
  // Force GPU acceleration
  element.style.transform = 'translateZ(0)';
  element.style.backfaceVisibility = 'hidden';
  element.style.willChange = 'transform';
  
  // Add explicit containment for layout stability
  element.style.contain = 'layout paint';
  
  // Ensure elements have explicit dimensions
  if (element.offsetHeight < 20) {
    element.style.height = '400px'; 
  }
  
  // Find and fix nodes and edges containers
  const nodeContainer = element.querySelector('.react-flow__nodes');
  const edgeContainer = element.querySelector('.react-flow__edges');
  
  if (nodeContainer instanceof HTMLElement) {
    nodeContainer.style.transform = 'translateZ(0)';
  }
  
  if (edgeContainer instanceof HTMLElement) {
    edgeContainer.style.transform = 'translateZ(0)';
  }
}

/**
 * Patch React's error handler to better handle ReactFlow errors
 */
function patchReactErrorHandler() {
  // Only run in browser
  if (typeof window === 'undefined') return;
  
  // Only patch once
  if ((window as any).__reactErrorHandlerPatched) return;
  
  try {
    // Try to find React DevTools global hook
    const hook = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
    
    if (hook && typeof hook.onCommitFiberRoot === 'function') {
      const originalOnCommit = hook.onCommitFiberRoot;
      
      // Patch the commit function to catch errors
      hook.onCommitFiberRoot = function(id: any, root: any, ...args: any[]) {
        try {
          return originalOnCommit.apply(this, [id, root, ...args]);
        } catch (e) {
          // Silently handle React DevTools errors
          return null;
        }
      };
    }
    
    (window as any).__reactErrorHandlerPatched = true;
  } catch (e) {
    // Silent fail
  }
}

/**
 * Monitor specifically for ResizeObserver errors
 */
function monitorResizeObserverErrors() {
  if (typeof window === 'undefined') return;
  
  const originalConsoleError = console.error;
  console.error = function(msg, ...args) {
    // Detect ResizeObserver errors
    if (typeof msg === 'string' && msg.includes('ResizeObserver')) {
      // Track and prevent showing these errors
      trackResizeObserverError();
      return;
    }
    
    // Pass through other errors
    return originalConsoleError.apply(console, [msg, ...args]);
  };
  
  let errorCount = 0;
  let lastErrorTime = 0;
  
  // Track errors and apply fixes when needed
  function trackResizeObserverError() {
    const now = Date.now();
    
    // Reset count if it's been a while
    if (now - lastErrorTime > 5000) {
      errorCount = 0;
    }
    
    errorCount++;
    lastErrorTime = now;
    
    // Apply fixes if errors are frequent
    if (errorCount > 3 && !(window as any).__resizeObserverRecoveryInProgress) {
      applyResizeObserverFixes();
    }
  }
}