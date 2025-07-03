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

    // Force render stability
    useEffect(() => {
      if (!containerRef.current) return;
      
      // Force stability styles
      const applyStability = () => {
        if (!containerRef.current) return;
        
        const flowElements = containerRef.current.querySelectorAll('.react-flow, .react-flow__viewport');
        flowElements.forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.transform = 'translateZ(0)';
            el.style.visibility = 'visible';
            el.style.opacity = '1';
            
            // Remove any unwanted text nodes displaying in ReactFlow
            el.childNodes.forEach(node => {
              if (node.nodeType === Node.TEXT_NODE && node.textContent) {
                if (node.textContent.trim().includes('/agent/invoke') || 
                    node.textContent.trim().includes('POST ')) {
                  node.textContent = '';
                }
              }
            });
          }
        });
        
        // Force nodes to be visible
        const nodes = containerRef.current.querySelectorAll('.react-flow__node');
        nodes.forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.opacity = '1';
            el.style.visibility = 'visible';
            el.style.transform = 'translateZ(0)';
          }
        });
        
        // Stabilize edges
        const edges = containerRef.current.querySelectorAll('.react-flow__edge');
        edges.forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.opacity = '1';
            el.style.visibility = 'visible';
          }
        });
      };
      
      // Apply fixes multiple times to ensure rendering
      applyStability();
      const timer1 = setTimeout(applyStability, 100);
      const timer2 = setTimeout(applyStability, 500);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
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