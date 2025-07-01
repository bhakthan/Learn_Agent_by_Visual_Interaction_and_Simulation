/**
 * Utility to create ResizeObservers that don't cause loop errors
 * This is a common issue with ReactFlow and other visualization libraries
 */

// Track problematic observers 
const problematicObservers = new WeakSet();

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