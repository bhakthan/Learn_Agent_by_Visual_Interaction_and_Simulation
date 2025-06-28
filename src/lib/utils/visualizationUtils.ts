/**
 * Utility functions for visualizing agent pattern data flows
 */
import { useEffect } from 'react';

/**
 * Get animation style parameters based on message type
 */
export const getDataFlowAnimationStyle = (
  type?: 'query' | 'response' | 'tool_call' | 'observation' | 'reflection' | 'plan' | 'message' | 'data' | 'error',
  params?: { color: string; pulseSpeed: number }
) => {
  // Default values
  const defaultStyle = {
    stroke: '#10a37f',
    fill: '#10a37f',
    strokeWidth: 2,
    strokeDasharray: '10,5',
    animationDuration: '3s',
  };

  if (!type || !params) {
    return defaultStyle;
  }

  // Customize based on message type
  switch (type) {
    case 'query':
      return {
        stroke: params.color || '#3b82f6', // Blue
        fill: params.color || '#3b82f6',
        strokeWidth: 2,
        strokeDasharray: '5,5',
        animationDuration: params.pulseSpeed ? `${params.pulseSpeed}s` : '2s',
      };
    case 'response':
      return {
        stroke: params.color || '#10b981', // Green
        fill: params.color || '#10b981', 
        strokeWidth: 2,
        strokeDasharray: '5,3',
        animationDuration: params.pulseSpeed ? `${params.pulseSpeed}s` : '1.5s',
      };
    case 'tool_call':
      return {
        stroke: params.color || '#8b5cf6', // Purple
        fill: params.color || '#8b5cf6',
        strokeWidth: 2,
        strokeDasharray: '5,2,2,2',
        animationDuration: params.pulseSpeed ? `${params.pulseSpeed}s` : '1.8s',
      };
    case 'error':
      return {
        stroke: '#ef4444', // Red
        fill: '#ef4444',
        strokeWidth: 3,
        strokeDasharray: '3,3',
        animationDuration: '1.2s',
      };
    case 'data':
      return {
        stroke: '#f59e0b', // Amber
        fill: '#f59e0b',
        strokeWidth: 2,
        strokeDasharray: '4,2',
        animationDuration: '1.5s',
      };
    default:
      return defaultStyle;
  }
};

/**
 * Get node parameters for visualization
 */
export const getNodeDataFlowParams = (
  nodeType: string | undefined
): { 
  color: string; 
  icon?: string;
  pulseSpeed: number;
} => {
  // Default values
  const defaultParams = {
    color: '#64748b',
    pulseSpeed: 1.5
  };

  // No specific type
  if (!nodeType) {
    return defaultParams;
  }

  // Customize based on node type
  switch (nodeType) {
    case 'input':
      return { color: '#3b82f6', pulseSpeed: 1.2 }; // Blue
    case 'llm':
      return { color: '#10a37f', pulseSpeed: 1.5 }; // Green
    case 'tool':
      return { color: '#8b5cf6', pulseSpeed: 1.8 }; // Purple
    case 'output':
      return { color: '#ef4444', pulseSpeed: 2.0 }; // Red
    case 'router':
      return { color: '#f97316', pulseSpeed: 1.2 }; // Orange
    case 'evaluator':
      return { color: '#06b6d4', pulseSpeed: 1.8 }; // Cyan
    case 'planner':
      return { color: '#ec4899', pulseSpeed: 1.5 }; // Pink
    case 'executor':
      return { color: '#84cc16', pulseSpeed: 1.8 }; // Lime
    case 'aggregator':
      return { color: '#f59e0b', pulseSpeed: 2.0 }; // Amber
    default:
      return defaultParams;
  }
};

/**
 * Utility for safely handling ReactFlow resize operations
 * This prevents ResizeObserver errors and ensures proper layout
 */
export function setupSafeReactFlowResize(containerRef: React.RefObject<HTMLElement>, delay = 300) {
  useEffect(() => {
    if (!containerRef.current) return;

    let isResizing = false;
    let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
    let animationFrameId: number | null = null;

    // Create a safer observer
    const observer = new ResizeObserver((entries) => {
      if (isResizing) return;
      
      isResizing = true;
      
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      
      // Use substantial debouncing
      resizeTimeout = setTimeout(() => {
        animationFrameId = requestAnimationFrame(() => {
          try {
            // Force layout recalculation but in a more gentle way
            if (containerRef.current) {
              // Trigger a custom event that ReactFlow can listen to
              const event = new CustomEvent('flow-resize', { 
                detail: { timestamp: Date.now() }
              });
              containerRef.current.dispatchEvent(event);
            }
          } catch (error) {
            // Silently handle errors
          } finally {
            // Reset state after completion
            setTimeout(() => {
              isResizing = false;
              animationFrameId = null;
              resizeTimeout = null;
            }, 100);
          }
        });
      }, delay);
    });
    
    // Start observing
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    // Clean up
    return () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      observer.disconnect();
    };
  }, [containerRef, delay]);
  
  return null;
}

/**
 * Reset rendering of React Flow to fix layout issues
 */
export function resetReactFlowRendering(containerRef: React.RefObject<HTMLElement>) {
  if (!containerRef.current) return;
  
  try {
    // Apply temporary styles that force a reflow
    const container = containerRef.current;
    const originalDisplay = container.style.display;
    const originalVisibility = container.style.visibility;
    
    // Hide temporarily (1ms) to trigger reflow without visual disruption
    container.style.visibility = 'hidden';
    
    // Force reflow
    container.getBoundingClientRect();
    
    // Restore original visibility with slight delay
    requestAnimationFrame(() => {
      container.style.visibility = originalVisibility;
      container.style.display = originalDisplay;
      
      // Trigger flow resize event
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 50);
    });
  } catch (e) {
    // Silently handle errors
  }
}