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
  
  // Create the actual observer with error prevention
  const observer = new ResizeObserver((entries: ResizeObserverEntry[]) => {
    // If we're already processing entries, queue these for later
    if (isProcessing) {
      queuedEntries = [...queuedEntries, ...entries];
      return;
    }
    
    isProcessing = true;
    
    // Use requestAnimationFrame to prevent rapid successive callbacks
    if (frameId) {
      cancelAnimationFrame(frameId);
    }
    
    frameId = requestAnimationFrame(() => {
      try {
        // Call the callback with the current entries
        callback(entries);
        
        // If we have queued entries, process them next frame
        if (queuedEntries.length > 0) {
          const nextEntries = [...queuedEntries];
          queuedEntries = [];
          
          // Use another rAF to stagger processing
          frameId = requestAnimationFrame(() => {
            callback(nextEntries);
            isProcessing = false;
            frameId = null;
          });
        } else {
          isProcessing = false;
          frameId = null;
        }
      } catch (error) {
        // Recover from errors
        console.warn('ResizeObserver callback error (handled)');
        isProcessing = false;
        queuedEntries = [];
        frameId = null;
      }
    });
  });
  
  // Track this observer for potential future fixes
  problematicObservers.add(observer);
  
  return observer;
}