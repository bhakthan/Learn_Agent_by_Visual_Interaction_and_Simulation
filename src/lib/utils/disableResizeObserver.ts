/**
 * Utility for selectively disabling ResizeObserver when it causes problems
 */

/**
 * Tracks whether ResizeObserver has been disabled
 */
let resizeObserverDisabled = false;

/**
 * Tracking information for ResizeObserver errors
 */
const errorTracking = {
  count: 0,
  firstError: 0,
  lastError: 0,
  seriousErrors: 0
};

/**
 * Temporarily disables ResizeObserver if too many errors occur
 */
export const disableResizeObserverIfProblematic = () => {
  const now = Date.now();
  
  // Initialize first error time if this is the first error
  if (errorTracking.firstError === 0) {
    errorTracking.firstError = now;
  }
  
  // Track errors
  errorTracking.count++;
  errorTracking.lastError = now;
  
  // If many errors in short time, consider it serious
  if (now - errorTracking.firstError < 5000 && errorTracking.count > 5) {
    errorTracking.seriousErrors++;
  }
  
  // Reset tracking after a while without errors
  if (now - errorTracking.lastError > 30000) {
    // Reset tracking
    errorTracking.count = 1;
    errorTracking.firstError = now;
    errorTracking.seriousErrors = 0;
  }
  
  // Don't do anything if already disabled
  if (resizeObserverDisabled) {
    return;
  }
  
  // If we've seen too many errors, disable ResizeObserver
  if (errorTracking.seriousErrors >= 3 || errorTracking.count > 20) {
    disableResizeObserver();
  }
};

/**
 * Completely disables ResizeObserver by replacing it with a no-op version
 */
export const disableResizeObserver = () => {
  if (resizeObserverDisabled) return;
  
  try {
    console.warn('Disabling problematic ResizeObserver due to excessive errors');
    
    // Store original for potential future restoration
    (window as any).__originalResizeObserver = window.ResizeObserver;
    
    // Replace with minimal implementation
    window.ResizeObserver = class MockResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        // Store callback but don't use it
      }
      
      observe() { /* No-op */ }
      unobserve() { /* No-op */ }
      disconnect() { /* No-op */ }
    };
    
    resizeObserverDisabled = true;
    (window as any).__disableResizeObservers = true;
    
    // Force a layout recalculation
    document.body.style.opacity = '0.99';
    setTimeout(() => {
      document.body.style.opacity = '1';
    }, 100);
    
    // Dispatch an event so components can adapt
    window.dispatchEvent(new CustomEvent('resize-observer-disabled', {
      bubbles: true,
      detail: { timestamp: Date.now() }
    }));
  } catch (e) {
    console.error('Failed to disable ResizeObserver', e);
  }
};

/**
 * Attempts to restore the original ResizeObserver if it was disabled
 */
export const restoreResizeObserver = () => {
  if (!resizeObserverDisabled || !(window as any).__originalResizeObserver) {
    return;
  }
  
  try {
    console.log('Restoring original ResizeObserver');
    window.ResizeObserver = (window as any).__originalResizeObserver;
    resizeObserverDisabled = false;
    (window as any).__disableResizeObservers = false;
    
    // Dispatch an event so components can adapt
    window.dispatchEvent(new CustomEvent('resize-observer-restored', {
      bubbles: true,
      detail: { timestamp: Date.now() }
    }));
  } catch (e) {
    console.error('Failed to restore ResizeObserver', e);
  }
};

/**
 * Check if ResizeObserver is currently disabled
 */
export const isResizeObserverDisabled = () => resizeObserverDisabled;