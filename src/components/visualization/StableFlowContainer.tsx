import React, { forwardRef, useEffect, useRef } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { useStableFlow } from '@/lib/hooks/useStableFlow';

interface StableFlowContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  fitViewOnResize?: boolean;
  minHeight?: string | number;
  onReady?: () => void;
}

/**
 * A container component that provides stability for ReactFlow
 * Prevents ResizeObserver loop errors and ensures proper rendering
 */
export const StableFlowContainer = forwardRef<HTMLDivElement, StableFlowContainerProps>(
  ({ children, className = '', style = {}, fitViewOnResize = true, minHeight = '300px', onReady }, ref) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const containerRef = (ref || internalRef) as React.RefObject<HTMLDivElement>;
    const readyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isReadyRef = useRef(false);
    
    // Apply custom styles to prevent layout issues
    const containerStyle: React.CSSProperties = {
      position: 'relative',
      minHeight,
      transform: 'translateZ(0)', // Force hardware acceleration
      backfaceVisibility: 'hidden',
      WebkitBackfaceVisibility: 'hidden',
      contain: 'layout',
      ...style
    };
    
    // Notify parent when component is ready
    useEffect(() => {
      if (onReady && !isReadyRef.current) {
        // Delay ready event to ensure React Flow is fully initialized
        readyTimeoutRef.current = setTimeout(() => {
          isReadyRef.current = true;
          onReady();
        }, 500);
      }
      
      return () => {
        if (readyTimeoutRef.current) {
          clearTimeout(readyTimeoutRef.current);
        }
      };
    }, [onReady]);
    
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
 * A provider wrapper for ReactFlow with stability enhancements
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

/**
 * A wrapper component that uses our stability hooks with ReactFlow
 */
export const StableFlowWrapper: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  fitViewOnResize?: boolean;
  fitViewPadding?: number;
  minHeight?: string | number;
  onReady?: () => void;
}> = ({ 
  children, 
  className = '', 
  style = {}, 
  fitViewOnResize = true,
  fitViewPadding = 0.2,
  minHeight = '300px',
  onReady
}) => {
  const { containerRef, resetFlow } = useStableFlow({
    fitViewOnResize,
    fitViewPadding,
    stabilizationDelay: 300
  });
  
  // Handle ready state
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onReady) onReady();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [onReady]);
  
  // Reset flow on window resize
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    const handleResize = () => {
      if (timeoutId) clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        resetFlow();
        timeoutId = null;
      }, 200);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [resetFlow]);
  
  return (
    <div 
      ref={containerRef}
      className={`stable-flow-wrapper ${className}`}
      style={{
        position: 'relative',
        minHeight,
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        contain: 'layout',
        ...style
      }}
      data-flow-container="true"
    >
      {children}
    </div>
  );
};

export default StableFlowContainer;