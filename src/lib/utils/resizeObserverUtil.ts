/**
 * A simple and focused utility module for ResizeObserver functions
 * This module contains ONLY the throttleResizeObserver function to avoid circular dependencies
 */

/**
 * Throttles ResizeObserver callbacks to improve performance
 * @param callback ResizeObserver callback function
 * @param delay Throttle delay in ms
 */
export const throttleResizeObserver = (callback: ResizeObserverCallback, delay: number = 100): ResizeObserverCallback => {
  let timeout: number | null = null;
  let queuedEntries: ResizeObserverEntry[] | null = null;
  let queuedObserver: ResizeObserver | null = null;
  
  return (entries, observer) => {
    queuedEntries = entries;
    queuedObserver = observer;
    
    if (!timeout) {
      timeout = window.setTimeout(() => {
        if (queuedEntries && queuedObserver) {
          try {
            callback(queuedEntries, queuedObserver);
          } catch (e) {
            console.error('Error in throttled ResizeObserver callback:', e);
          }
        }
        timeout = null;
        queuedEntries = null;
        queuedObserver = null;
      }, delay);
    }
  };
};