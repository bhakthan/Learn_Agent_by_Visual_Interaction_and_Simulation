/**
 * Memoized versions of ReactFlow components for better performance
 * This helps prevent unnecessary re-renders and improves stability
 */
import React, { useEffect } from 'react';
import {
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap,
  ReactFlowProps,
  BackgroundProps,
  ControlsProps,
  MiniMapProps
} from 'reactflow';

// Enhanced ReactFlow with visibility fixes
const EnhancedReactFlow: React.FC<ReactFlowProps> = (props) => {
  // Apply visibility fixes after render
  useEffect(() => {
    const applyFixes = () => {
      try {
        // Force nodes to be visible
        document.querySelectorAll('.react-flow__node').forEach(node => {
          if (node instanceof HTMLElement) {
            node.style.opacity = '1';
            node.style.visibility = 'visible';
            node.style.display = 'block';
          }
        });
        
        // Force edges to be visible
        document.querySelectorAll('.react-flow__edge').forEach(edge => {
          if (edge instanceof HTMLElement) {
            edge.style.opacity = '1';
            edge.style.visibility = 'visible';
          }
          
          const paths = edge.querySelectorAll('path');
          paths.forEach(path => {
            path.setAttribute('stroke-width', '1.5');
            path.setAttribute('opacity', '1');
            path.setAttribute('visibility', 'visible');
          });
        });
      } catch (e) {
        // Silent error handling
      }
    };
    
    // Apply fixes after a delay
    const timer1 = setTimeout(applyFixes, 500);
    const timer2 = setTimeout(applyFixes, 1500);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);
  
  return <ReactFlow {...props} />;
};

/**
 * Memoized version of ReactFlow to prevent unnecessary re-renders
 */
export const MemoizedReactFlow = React.memo(EnhancedReactFlow);

/**
 * Enhanced background with better default properties
 */
const EnhancedBackground: React.FC<BackgroundProps> = (props) => {
  const defaultProps = {
    gap: 16,
    size: 1,
    color: '#aaaaaa',
    ...props
  };
  
  return <Background {...defaultProps} />;
};

/**
 * Memoized version of Background to prevent unnecessary re-renders
 */
export const MemoizedBackground = React.memo(EnhancedBackground);

/**
 * Memoized version of Controls to prevent unnecessary re-renders
 */
export const MemoizedControls = React.memo(Controls);

/**
 * Enhanced MiniMap with better visibility in dark mode
 */
const EnhancedMiniMap: React.FC<MiniMapProps> = (props) => {
  const defaultProps = {
    nodeColor: (n: any) => {
      if (n.data?.status === 'running') return '#f59e0b';
      if (n.data?.status === 'complete') return '#10b981';
      if (n.data?.status === 'failed') return '#ef4444';
      return '#888888';
    },
    nodeStrokeWidth: 2,
    ...props
  };
  
  return <MiniMap {...defaultProps} />;
};

/**
 * Memoized version of MiniMap to prevent unnecessary re-renders
 */
export const MemoizedMiniMap = React.memo(EnhancedMiniMap);