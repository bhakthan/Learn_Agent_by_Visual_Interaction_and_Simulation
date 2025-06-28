import React, { memo } from 'react';
import ReactFlow, { 
  Background, 
  Controls,
  MiniMap, 
  Node, 
  Edge,
  NodeTypes,
  EdgeTypes,
  ReactFlowProps,
  BackgroundProps,
  ControlsProps,
  MiniMapProps,
  ConnectionLineType
} from 'reactflow';
import 'reactflow/dist/style.css';

/**
 * A memoized version of the ReactFlow component to prevent unnecessary re-renders
 */
export const MemoizedReactFlow = memo<ReactFlowProps>((props) => {
  return <ReactFlow {...props} />;
}, (prevProps, nextProps) => {
  // Skip re-render for certain prop changes that don't visually affect the flow
  if (prevProps.nodes !== nextProps.nodes) return false;
  if (prevProps.edges !== nextProps.edges) return false;
  if (prevProps.nodesDraggable !== nextProps.nodesDraggable) return false;
  if (prevProps.zoomOnScroll !== nextProps.zoomOnScroll) return false;
  
  // Skip re-render for some handler changes if they seem to have similar signatures
  // (this is a heuristic that might need adjustment)
  if (typeof prevProps.onNodeDragStart !== typeof nextProps.onNodeDragStart) return false;
  
  // Keep default behavior for other props (e.g., style, className, etc.)
  return true;
});

/**
 * A memoized version of the ReactFlow Background component
 */
export const MemoizedBackground = memo<BackgroundProps>((props) => {
  return <Background {...props} />;
}, (prevProps, nextProps) => {
  // Only re-render if specific visual properties change
  if (prevProps.variant !== nextProps.variant) return false;
  if (prevProps.gap !== nextProps.gap) return false;
  if (prevProps.color !== nextProps.color) return false;
  if (prevProps.size !== nextProps.size) return false;
  
  // Otherwise, skip re-render
  return true;
});

/**
 * A memoized version of the ReactFlow Controls component
 */
export const MemoizedControls = memo<ControlsProps>((props) => {
  return <Controls {...props} />;
}, (prevProps, nextProps) => {
  // Only re-render if specific visual properties change
  if (prevProps.position !== nextProps.position) return false;
  if (prevProps.showZoom !== nextProps.showZoom) return false;
  if (prevProps.showFitView !== nextProps.showFitView) return false;
  
  // Otherwise, skip re-render
  return true;
});

/**
 * A memoized version of the ReactFlow MiniMap component
 */
export const MemoizedMiniMap = memo<MiniMapProps>((props) => {
  return <MiniMap {...props} />;
}, (prevProps, nextProps) => {
  // Only re-render if specific visual properties change
  if (prevProps.position !== nextProps.position) return false;
  if (prevProps.nodeColor !== nextProps.nodeColor) return false;
  if (prevProps.maskColor !== nextProps.maskColor) return false;
  
  // Otherwise, skip re-render
  return true;
});

/**
 * Create a node renderer that's memoized to prevent unnecessary re-renders
 */
export function createMemoizedNodeRenderer<T = any>(
  renderer: (props: any) => React.ReactNode,
  compareProps?: (prev: T, next: T) => boolean
) {
  return memo(renderer, compareProps || ((prev, next) => {
    // Default comparison for node data
    if (prev.selected !== next.selected) return false;
    if (prev.dragging !== next.dragging) return false;
    
    // Deep compare important data properties
    const prevData = prev.data || {};
    const nextData = next.data || {};
    
    // Check common node properties
    const keysToCheck = ['label', 'status', 'result', 'nodeType'];
    for (const key of keysToCheck) {
      if (prevData[key] !== nextData[key]) return false;
    }
    
    return true;
  }));
}

/**
 * Creates complete set of memoized node types from original node types
 */
export function createMemoizedNodeTypes(originalNodeTypes: NodeTypes): NodeTypes {
  const memoizedTypes: NodeTypes = {};
  
  Object.entries(originalNodeTypes).forEach(([key, Component]) => {
    memoizedTypes[key] = createMemoizedNodeRenderer(Component);
  });
  
  return memoizedTypes;
}

/**
 * Creates optimized edge types that avoid unnecessary re-renders
 */
export function createMemoizedEdgeTypes(originalEdgeTypes: EdgeTypes): EdgeTypes {
  const memoizedTypes: EdgeTypes = {};
  
  Object.entries(originalEdgeTypes || {}).forEach(([key, Component]) => {
    memoizedTypes[key] = memo(Component, (prev, next) => {
      // Re-render if selection state changes
      if (prev.selected !== next.selected) return false;
      
      // Re-render if animated state changes
      if (prev.animated !== next.animated) return false;
      
      // Re-render if source or target changes
      if (prev.source !== next.source || prev.target !== next.target) return false;
      
      // Otherwise, skip re-render
      return true;
    });
  });
  
  return memoizedTypes;
}

/**
 * Custom hook that returns a memoized version of default react flow props
 */
export function getOptimizedFlowProps(theme: string = 'light'): Partial<ReactFlowProps> {
  return {
    deleteKeyCode: ['Backspace', 'Delete'],
    multiSelectionKeyCode: ['Control', 'Meta'],
    panActivationKeyCode: 'Space',
    selectionOnDrag: true,
    panOnDrag: [1, 2], // middle mouse and right mouse buttons
    selectionMode: 1,
    connectionLineType: ConnectionLineType.SmoothStep,
    connectionLineStyle: {
      strokeWidth: 2,
      stroke: theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : '#555',
    },
    defaultEdgeOptions: {
      style: { strokeWidth: 2, stroke: theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : '#555' },
      type: 'smoothstep',
      markerEnd: { type: 'arrowclosed' },
    },
  };
}