/**
 * Utility functions to fix common ReactFlow visualization issues
 */

/**
 * Fixes common ReactFlow rendering issues by applying styles and clearing unwanted text nodes
 * @param containerSelector The CSS selector for the ReactFlow container
 */
export function fixReactFlowRendering(containerSelector: string | HTMLElement) {
  try {
    // Get the container
    const container = typeof containerSelector === 'string' 
      ? document.querySelector(containerSelector)
      : containerSelector;
    
    if (!container || !(container instanceof HTMLElement)) return false;
    
    // Find ReactFlow elements
    const reactFlowElements = container.querySelectorAll('.react-flow, .react-flow__viewport, .react-flow__renderer, .react-flow__container');
    reactFlowElements.forEach(el => {
      if (el instanceof HTMLElement) {
        // Apply fixes for common ReactFlow display issues
        el.style.transform = 'translateZ(0)';
        el.style.visibility = 'visible';
        el.style.opacity = '1';
        el.style.display = 'block';
        
        // Remove unwanted text nodes that might be causing rendering issues
        Array.from(el.childNodes).forEach(node => {
          if (node.nodeType === Node.TEXT_NODE && node.textContent && node.textContent.trim()) {
            const text = node.textContent.trim();
            if (text.includes('/agent/invoke') || text.includes('POST') || text.includes('undefined')) {
              node.textContent = '';
            }
          }
        });
      }
    });
    
    // Fix node visibility issues
    const nodes = container.querySelectorAll('.react-flow__node');
    nodes.forEach(node => {
      if (node instanceof HTMLElement) {
        node.style.opacity = '1';
        node.style.visibility = 'visible';
        node.style.display = 'block';
        node.style.zIndex = '1';
        node.style.transform = 'translateZ(0)';
      }
    });
    
    // Fix edge visibility issues
    const edges = container.querySelectorAll('.react-flow__edge');
    edges.forEach(edge => {
      if (edge instanceof HTMLElement) {
        edge.style.opacity = '1';
        edge.style.visibility = 'visible';
        
        // Fix edge paths
        const paths = edge.querySelectorAll('path');
        paths.forEach(path => {
          if (path instanceof SVGElement) {
            path.setAttribute('stroke-width', '1.5');
            path.setAttribute('opacity', '1');
            path.setAttribute('visibility', 'visible');
          }
        });
      }
    });
    
    return true;
  } catch (error) {
    console.warn('Error applying ReactFlow fixes:', error);
    return false;
  }
}

/**
 * Applies fixes to ReactFlow components when "Start Simulation" is clicked
 */
export function setupSimulationButtonHandlers() {
  document.addEventListener('click', (e) => {
    // Check if the clicked element is a simulation start button
    if (e.target instanceof HTMLElement) {
      const targetText = e.target.textContent?.toLowerCase() || '';
      const parentText = e.target.parentElement?.textContent?.toLowerCase() || '';
      
      if (targetText.includes('start simulation') || targetText.includes('run simulation') ||
          parentText.includes('start simulation') || parentText.includes('run simulation')) {
        
        // Schedule multiple fix attempts with increasing delays for better reliability
        setTimeout(() => fixReactFlowRendering('.react-flow'), 100);
        setTimeout(() => fixReactFlowRendering('.react-flow'), 300);
        setTimeout(() => fixReactFlowRendering('.react-flow'), 800);
        
        // Trigger a resize event to help ReactFlow recalculate layouts
        window.dispatchEvent(new Event('resize'));
      }
    }
  });
}

/**
 * Fixes a specific ReactFlow instance by retrieving its DOM element
 * @param containerRef React ref object for the container
 */
export function fixReactFlowWithRef(containerRef: React.RefObject<HTMLElement>) {
  if (containerRef.current) {
    fixReactFlowRendering(containerRef.current);
    return true;
  }
  return false;
}