import React, { forwardRef, useEffect, useRef } from 'react';
import { ReactFlowProvider } from 'reactflow';

interface StableFlowContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  fitViewOnResize?: boolean;
  minHeight?: string | number;
  onReady?: () => void;
}

/**
 * A simplified container component for ReactFlow
 * Prevents ResizeObserver loop errors with minimal dependencies
 */
export const StableFlowContainer = forwardRef<HTMLDivElement, StableFlowContainerProps>(
  ({ children, className = '', style = {}, minHeight = '300px', onReady }, ref) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const containerRef = (ref || internalRef) as React.RefObject<HTMLDivElement>;
    const readyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    // Apply stable styles to prevent layout issues
    const containerStyle: React.CSSProperties = {
      position: 'relative',
      minHeight,
      height: style.height || '400px',
      width: '100%',
      overflow: 'hidden',
      // Force hardware acceleration
      transform: 'translateZ(0)', 
      backfaceVisibility: 'hidden',
      WebkitBackfaceVisibility: 'hidden',
      contain: 'layout',
      opacity: 1,
      visibility: 'visible',
      ...style
    };
    
    // Notify parent when component is ready
    useEffect(() => {
      if (onReady) {
        // Delay ready event to ensure component is mounted
        readyTimeoutRef.current = setTimeout(() => {
          onReady();
        }, 300);
      }
      
      return () => {
        if (readyTimeoutRef.current) {
          clearTimeout(readyTimeoutRef.current);
        }
      };
    }, [onReady]);

    // Force render stability with improved timing and error handling
    useEffect(() => {
      if (!containerRef.current) return;
      
      // Enhanced stability application with better error handling
      const applyStability = () => {
        try {
          if (!containerRef.current) return;
          
          // Fix any ReactFlow containers
          const flowElements = containerRef.current.querySelectorAll('.react-flow, .react-flow__viewport, .react-flow__renderer, .react-flow__container');
          flowElements.forEach(el => {
            if (el instanceof HTMLElement) {
              el.style.transform = 'translateZ(0)';
              el.style.visibility = 'visible';
              el.style.opacity = '1';
              el.style.display = 'block';
              el.style.position = 'relative';
              
              // Remove any unwanted text nodes displaying in ReactFlow
              Array.from(el.childNodes).forEach(node => {
                if (node.nodeType === Node.TEXT_NODE && node.textContent) {
                  // Clear any non-empty text nodes that might be causing issues
                  if (node.textContent.trim()) {
                    node.textContent = '';
                    // Try to remove the node from DOM completely
                    try {
                      node.parentNode?.removeChild(node);
                    } catch (e) {
                      // Silently handle any errors
                    }
                  }
                }
              });
            }
          });
          
          // Force nodes to be visible with enhanced styling
          const nodes = containerRef.current.querySelectorAll('.react-flow__node');
          nodes.forEach(el => {
            if (el instanceof HTMLElement) {
              el.style.opacity = '1';
              el.style.visibility = 'visible';
              el.style.transform = 'translateZ(0)';
              el.style.display = 'block';
              el.style.position = 'absolute';
              el.style.zIndex = '1';
              el.style.minWidth = '50px';
              el.style.minHeight = '30px';
              el.style.boxShadow = '0 0 0 1px var(--border)';
              
              // Apply the class directly to ensure styles are applied
              el.className = el.className + ' react-flow__node-visible';
            }
          });
          
          // Stabilize edges with enhanced styling
          const edges = containerRef.current.querySelectorAll('.react-flow__edge');
          edges.forEach(el => {
            if (el instanceof HTMLElement) {
              el.style.opacity = '1';
              el.style.visibility = 'visible';
              el.style.zIndex = '0';
              
              // Find and enhance edge paths
              const paths = el.querySelectorAll('path');
              paths.forEach(path => {
                if (path instanceof SVGElement) {
                  path.setAttribute('stroke-width', '1.5');
                  path.setAttribute('opacity', '1');
                  path.setAttribute('visibility', 'visible');
                }
              });
            }
          });
          
          // Force render any nodes that might be hidden
          const viewports = containerRef.current.querySelectorAll('.react-flow__viewport');
          viewports.forEach(viewport => {
            if (viewport instanceof HTMLElement) {
              // Apply a small transformation to force a repaint
              viewport.style.transform = 'translateZ(0) scale(0.9999)';
              // Force a reflow
              void viewport.offsetHeight;
              // Return to normal scale with a transition
              setTimeout(() => {
                viewport.style.transform = 'translateZ(0) scale(1)';
                viewport.style.transition = 'transform 0.01s';
              }, 10);
            }
          });
          
        } catch (err) {
          console.warn('Error applying stability fixes (suppressed)', err);
        }
      };
      
      // Apply fixes multiple times with increasing delays for better reliability
      applyStability();
      const timers = [
        setTimeout(applyStability, 100),
        setTimeout(applyStability, 500),
        setTimeout(applyStability, 1000),
        setTimeout(applyStability, 2000)
      ];
      
      // Force a layout recalculation
      const recalcLayout = () => {
        if (!containerRef.current) return;
        
        try {
          // Use ResizeObserver to detect and fix layout issues
          const ro = new ResizeObserver(() => {
            setTimeout(applyStability, 100);
          });
          
          ro.observe(containerRef.current);
          
          // Cleanup the observer on unmount
          return () => ro.disconnect();
        } catch (e) {
          // Fallback if ResizeObserver is not available
          window.addEventListener('resize', applyStability);
          return () => window.removeEventListener('resize', applyStability);
        }
      };
      
      const layoutCleanup = recalcLayout();
      
      return () => {
        timers.forEach(clearTimeout);
        if (layoutCleanup) layoutCleanup();
      };
    }, [containerRef]);
    
    return (
      <div 
        ref={containerRef}
        className={`stable-flow-container ${className}`}
        style={containerStyle}
        data-flow-container="true"
      >
        {children}
      </div>
    );
  }
);

StableFlowContainer.displayName = 'StableFlowContainer';

/**
 * A simplified provider wrapper for ReactFlow
 */
export const StableFlowProvider: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  minHeight?: string | number;
  onReady?: () => void;
}> = ({ children, className, style, minHeight, onReady }) => {
  return (
    <ReactFlowProvider>
      <StableFlowContainer
        className={className}
        style={style}
        minHeight={minHeight}
        onReady={onReady}
      >
        {children}
      </StableFlowContainer>
    </ReactFlowProvider>
  );
};

export default StableFlowContainer;