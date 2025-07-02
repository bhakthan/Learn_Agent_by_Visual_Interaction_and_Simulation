import React from 'react';
import { throttleResizeObserver } from './resizeObserverUtils';

/**
 * Resets ReactFlow rendering to fix visual glitches and layout issues
 * Uses RAF and progressive enhancement to ensure smooth transitions
 */
export const resetReactFlowRendering = (containerRef: React.RefObject<HTMLElement>) => {
  if (!containerRef.current) return;
  
  // Use RAF for smoother handling
  requestAnimationFrame(() => {
    try {
      const container = containerRef.current;
      if (!container) return;
      
      // Apply temporary styles to force hardware acceleration
      container.style.transform = 'translateZ(0)';
      container.style.webkitBackfaceVisibility = 'hidden';
      container.style.contain = 'layout paint';
      
      // Stabilize all ReactFlow elements
      container.querySelectorAll('.react-flow__viewport, .react-flow__container, .react-flow').forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.transform = 'translateZ(0)';
          el.style.webkitBackfaceVisibility = 'hidden';
          el.style.contain = 'layout paint';
          
          // Set explicit dimensions to prevent layout shifts
          const parent = el.parentElement;
          if (parent && parent.offsetHeight > 20 && (!el.style.height || el.offsetHeight < 20)) {
            el.style.height = `${parent.offsetHeight}px`;
          }
        }
      });
      
      // Force a reflow
      container.getBoundingClientRect();
      
      // Schedule clean-up and fitView calls after reflow
      requestAnimationFrame(() => {
        // Trigger a minor style change to ensure React Flow recalculates positions
        container.style.opacity = '0.99';
        
        requestAnimationFrame(() => {
          // Restore opacity
          container.style.opacity = '';
          
          // Custom event for observers
          container.dispatchEvent(new CustomEvent('flow-render-reset', { 
            bubbles: true,
            detail: { timestamp: Date.now() }
          }));
          
          // Dispatch a resize event as a fallback
          window.dispatchEvent(new Event('resize'));
        });
      });
    } catch (e) {
      // Silently recover and dispatch resize as fallback
      window.dispatchEvent(new Event('resize'));
    }
  });
};

/**
 * Creates a ResizeObserver for ReactFlow containers with enhanced stability
 */
export const createFlowContainerObserver = (
  containerRef: React.RefObject<HTMLElement>, 
  onResize: () => void
) => {
  if (!containerRef.current) return null;
  
  let isProcessingResize = false;
  let needsAnotherResize = false;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  const processResize = () => {
    if (isProcessingResize) {
      needsAnotherResize = true;
      return;
    }
    
    isProcessingResize = true;
    
    // Schedule with RAF for smoother handling
    requestAnimationFrame(() => {
      try {
        onResize();
      } finally {
        // Set a timer to allow settling before accepting more resize events
        timeoutId = setTimeout(() => {
          isProcessingResize = false;
          
          // If another resize was requested during processing, handle it
          if (needsAnotherResize) {
            needsAnotherResize = false;
            processResize();
          }
        }, 200);
      }
    });
  };
  
  // Create ResizeObserver with our throttling utility
  const callback = throttleResizeObserver(() => processResize());
  const observer = new ResizeObserver(callback);
  
  // Start observing
  observer.observe(containerRef.current);
  
  // Return cleanup function
  return () => {
    observer.disconnect();
    if (timeoutId) clearTimeout(timeoutId);
  };
};

/**
 * Optimizes ReactFlow rendering with intelligent debouncing of operations
 */
export const optimizeFlowRendering = (reactFlowInstance: any) => {
  if (!reactFlowInstance || typeof reactFlowInstance !== 'object') return;
  
  let fitViewScheduled = false;
  
  // Replace fitView with debounced version
  const originalFitView = reactFlowInstance.fitView;
  if (typeof originalFitView === 'function') {
    reactFlowInstance.fitView = (...args: any[]) => {
      if (fitViewScheduled) return;
      
      fitViewScheduled = true;
      
      // Use RAF for smoother handling
      requestAnimationFrame(() => {
        try {
          originalFitView.apply(reactFlowInstance, args);
        } catch (e) {
          console.warn('Error in fitView', e);
        } finally {
          setTimeout(() => {
            fitViewScheduled = false;
          }, 200);
        }
      });
    };
  }
  
  return reactFlowInstance;
};

/**
 * Monitors and fixes ReactFlow rendering issues
 */
export const monitorFlowRendering = (containerRef: React.RefObject<HTMLElement>) => {
  if (!containerRef.current) return () => {};
  
  // Set up error handling
  const handleError = (event: ErrorEvent) => {
    if (event.message && (
      event.message.includes('ResizeObserver') ||
      event.message.includes('loop') ||
      event.message.includes('undelivered notifications')
    )) {
      event.preventDefault();
      event.stopPropagation();
      
      // Apply emergency fix
      setTimeout(() => {
        resetReactFlowRendering(containerRef);
      }, 100);
      
      return false;
    }
  };
  
  // Set up monitoring
  window.addEventListener('error', handleError, true);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('error', handleError, true);
  };
};