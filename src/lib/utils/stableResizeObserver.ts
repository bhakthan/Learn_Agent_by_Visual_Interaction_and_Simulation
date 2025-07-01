/**
 * Utility to create ResizeObservers that don't cause loop errors
 * This is a common issue with ReactFlow and other visualization libraries
 */

// Track problematic observers 
const problematicObservers = new WeakSet();

/**
 * Creates a stable ResizeObserver that won't cause loop errors
 * Implements buffering and error prevention techniques
 */
export function createStableResizeObserver(callback: ResizeObserverCallback): ResizeObserver {
  let isProcessing = false;
  let queuedEntries: ResizeObserverEntry[] = [];
  let frameId: number | null = null;
  let throttleTimeout: ReturnType<typeof setTimeout> | null = null;
  
  // Create the actual observer with error prevention
  const observer = new ResizeObserver((entries: ResizeObserverEntry[]) => {
    // If we're already processing entries, queue these for later
    if (isProcessing) {
      queuedEntries = [...queuedEntries, ...entries];
      return;
    }
    
    // Throttle processing to prevent rapid successive callbacks
    if (throttleTimeout) {
      clearTimeout(throttleTimeout);
      queuedEntries = [...queuedEntries, ...entries];
      
      throttleTimeout = setTimeout(() => {
        throttleTimeout = null;
        processEntries([...queuedEntries]);
        queuedEntries = [];
      }, 100);
      
      return;
    }
    
    processEntries(entries);
  });
  
  function processEntries(entries: ResizeObserverEntry[]) {
    if (entries.length === 0) return;
    
    isProcessing = true;
    
    // Use requestAnimationFrame to prevent rapid successive callbacks
    if (frameId) {
      cancelAnimationFrame(frameId);
    }
    
    frameId = requestAnimationFrame(() => {
      try {
        // Call the callback with the current entries
        callback(entries);
      } catch (error) {
        // Recover from errors
        console.warn('ResizeObserver callback error (handled)', error);
      } finally {
        isProcessing = false;
        frameId = null;
      }
    });
  }
  
  // Track this observer for potential future fixes
  problematicObservers.add(observer);
  
  return observer;
}

// Helper function to check if an element has a ResizeObserver loop issue
export function hasResizeObserverIssue(element: Element): boolean {
  if (!(element instanceof HTMLElement)) return false;
  
  // Check for very small dimensions that often cause issues
  const rect = element.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return true;
  
  // Check for scrolling regions that cause infinite ResizeObserver loops
  if (element.scrollHeight > element.clientHeight && element.scrollWidth > element.clientWidth) {
    return true;
  }
  
  return false;
}