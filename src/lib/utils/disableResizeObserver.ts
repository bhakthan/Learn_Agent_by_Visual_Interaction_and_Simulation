/**
 * Function to be called when ResizeObserver is causing problems
 * This disables ResizeObserver functionality for problematic elements
 */
export const disableResizeObserverIfProblematic = () => {
  try {
    // Find all ReactFlow elements
    document.querySelectorAll('.react-flow').forEach(el => {
      if (el instanceof HTMLElement) {
        // Store existing dimensions
        const height = el.offsetHeight || 400;
        const width = el.offsetWidth || 800;
        
        // Force fixed dimensions to prevent ResizeObserver from triggering
        el.style.height = `${height}px`;
        el.style.width = `${width}px`;
        el.style.minHeight = `${height}px`;
        el.style.minWidth = `${width}px`;
        
        // Mark as stabilized to prevent further ResizeObserver issues
        el.dataset.stabilized = 'true';
      }
    });
  } catch (err) {
    // Silent recovery
  }
};