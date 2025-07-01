/**
 * Utilities for ReactFlow error handling and performance optimization
 */

import { monitorReactFlowErrors } from './monitorReactFlowErrors';
import { createStableResizeObserver, resetReactFlowRendering } from './resizeObserverUtils';

/**
 * Sets up error handling specifically for ReactFlow components
 */
export const setupReactFlowErrorHandling = () => {
  // Skip if already initialized
  if ((window as any).__reactFlowErrorHandlingInitialized) {
    return;
  }
  
  (window as any).__reactFlowErrorHandlingInitialized = true;
  
  // Replace ReactFlow's error handling with our own
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      patchReactFlowClasses();
      monitorReactFlowPerformance();
    }, 100);
  });
  
  // Set up error handling for ResizeObserver issues in ReactFlow
  monitorReactFlowErrors();
  
  // Listen for resize events to trigger React Flow stabilization
  const handleResize = debounce(() => {
    setTimeout(() => stabilizeAllReactFlows(), 100);
  }, 200);
  
  window.addEventListener('resize', handleResize);
  
  // Listen for visibility changes that might cause layout issues
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      setTimeout(() => stabilizeAllReactFlows(), 300);
    }
  });
  
  // Return cleanup function
  return () => {
    window.removeEventListener('resize', handleResize);
  };
};

/**
 * Debounce utility to prevent too many calls in rapid succession
 */
const debounce = <F extends (...args: any[]) => any>(func: F, wait: number): ((...args: Parameters<F>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  
  return function(...args: Parameters<F>) {
    const context = this;
    
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(context, args), wait);
  };
};

/**
 * Attempt to patch ReactFlow's classes to improve stability
 */
const patchReactFlowClasses = () => {
  // Add classes to control hardware acceleration
  document.querySelectorAll('.react-flow').forEach(el => {
    if (el instanceof HTMLElement) {
      // Apply hardware acceleration by default
      el.classList.add('gpu-accelerated');
      
      // Set explicit styles
      el.style.transform = 'translateZ(0)';
      el.style.backfaceVisibility = 'hidden';
      
      // Ensure container has explicit height
      if (!el.style.height || parseInt(el.style.height) < 20) {
        const parent = el.parentElement;
        if (parent && parent.offsetHeight > 20) {
          el.style.height = `${parent.offsetHeight}px`;
        } else {
          el.style.height = '400px'; // Fallback size
        }
      }
    }
  });
};

/**
 * Optimize and stabilize all ReactFlow instances on the page
 */
export const stabilizeAllReactFlows = () => {
  document.querySelectorAll('.react-flow').forEach(el => {
    if (el instanceof HTMLElement) {
      const containerRef = { current: el };
      resetReactFlowRendering(containerRef);
    }
  });
  
  // Dispatch custom event for components to listen for
  window.dispatchEvent(new CustomEvent('reactflow-stabilized', {
    detail: { timestamp: Date.now() }
  }));
};

/**
 * Set up performance monitoring for ReactFlow
 */
const monitorReactFlowPerformance = () => {
  try {
    // Use PerformanceObserver to monitor for long tasks
    if ('PerformanceObserver' in window) {
      const longTaskObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          // Look for particularly long tasks that might be causing jank
          if (entry.duration > 150) { // 150ms is considered very slow
            // Check if ReactFlow is being rendered during this time
            const reactFlowElements = document.querySelectorAll('.react-flow:not([data-stabilized])');
            
            if (reactFlowElements.length > 0) {
              // Mark as stabilized to prevent multiple fixes
              reactFlowElements.forEach(el => {
                if (el instanceof HTMLElement) {
                  el.setAttribute('data-stabilized', 'true');
                  
                  // Apply aggressive optimizations
                  const containerRef = { current: el };
                  resetReactFlowRendering(containerRef);
                  
                  // Remove stabilized flag after a delay
                  setTimeout(() => {
                    el.removeAttribute('data-stabilized');
                  }, 5000);
                }
              });
            }
          }
        }
      });
      
      // Start observing long tasks
      longTaskObserver.observe({ type: 'longtask', buffered: true });
    }
  } catch (e) {
    // Silently handle errors - this is just optimization
  }
};