import React, { useCallback, useRef, useEffect } from 'react';
import { Node, Edge, useReactFlow } from 'reactflow';
import { useTheme } from '@/components/theme/ThemeProvider';

/**
 * Standardized flow rendering utilities
 */

export interface FlowRenderOptions {
  applyHardwareAcceleration?: boolean;
  defaultNodeWidth?: number;
  defaultNodeHeight?: number;
  fitViewDelay?: number;
  fitViewPadding?: number;
}

/**
 * Process nodes to ensure they have all required properties for stable rendering
 */
export function processNodes(nodes: Node[], theme: string): Node[] {
  return nodes.map(node => ({
    ...node,
    style: {
      ...node.style,
      opacity: 1,
      visibility: 'visible',
      transform: 'translateZ(0)',
      willChange: 'transform',
      transition: 'all 0.2s ease-out',
      boxShadow: theme === 'dark' ? '0 0 0 1px rgba(255,255,255,0.1)' : undefined
    },
    draggable: node.draggable !== undefined ? node.draggable : true,
    selectable: node.selectable !== undefined ? node.selectable : true
  }));
}

/**
 * Process edges to ensure they have all required properties for stable rendering
 */
export function processEdges(edges: Edge[], theme: string): Edge[] {
  return edges.map(edge => ({
    ...edge,
    style: {
      ...edge.style,
      opacity: 1,
      visibility: 'visible',
      strokeWidth: 2,
      stroke: theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : undefined
    }
  }));
}

/**
 * Hook to stabilize flow component rendering with proper resize handling
 */
export function useStableFlow(
  containerRef: React.RefObject<HTMLElement>,
  options: FlowRenderOptions = {}
) {
  const {
    applyHardwareAcceleration = true,
    defaultNodeWidth = 150,
    defaultNodeHeight = 40,
    fitViewDelay = 300,
    fitViewPadding = 0.2
  } = options;
  
  const reactFlowInstance = useReactFlow();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // Store dimensions to detect significant changes
  const dimensionsRef = useRef({ width: 0, height: 0 });
  
  // Apply styles for hardware acceleration
  useEffect(() => {
    if (!applyHardwareAcceleration || !containerRef.current) return;
    
    containerRef.current.style.transform = 'translateZ(0)';
    containerRef.current.style.backfaceVisibility = 'hidden';
    containerRef.current.style.WebkitBackfaceVisibility = 'hidden';
    containerRef.current.style.contain = 'layout paint';
  }, [applyHardwareAcceleration]);
  
  // Fit view when component mounts or dimensions change significantly
  const fitView = useCallback(() => {
    if (reactFlowInstance && typeof reactFlowInstance.fitView === 'function') {
      try {
        reactFlowInstance.fitView({
          padding: fitViewPadding,
          includeHiddenNodes: true
        });
      } catch (error) {
        console.warn('Error fitting view (suppressed)');
      }
    }
  }, [reactFlowInstance, fitViewPadding]);
  
  // Handle resize events
  const handleResize = useCallback(() => {
    if (!containerRef.current) return;
    
    const { width, height } = containerRef.current.getBoundingClientRect();
    const prevDimensions = dimensionsRef.current;
    
    // Only refit if dimensions changed significantly
    const widthChanged = Math.abs(width - prevDimensions.width) > 5;
    const heightChanged = Math.abs(height - prevDimensions.height) > 5;
    
    if ((widthChanged || heightChanged) && width > 50 && height > 50) {
      dimensionsRef.current = { width, height };
      
      // Use timeout to avoid excessive fitView calls during resizing
      setTimeout(fitView, fitViewDelay);
    }
  }, [fitView, fitViewDelay]);
  
  // Apply resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        handleResize();
      }
    });
    
    resizeObserver.observe(containerRef.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [handleResize]);
  
  // Calculate edge points for data flow visualization
  const getEdgePoints = useCallback((edgeId: string, edges: Edge[], nodes: Node[]) => {
    if (!edges || !nodes) return null;
    
    const edge = edges.find(e => e.id === edgeId);
    if (!edge) return null;
    
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    
    if (!sourceNode || !targetNode) return null;
    
    // Calculate center of source node for flow start
    const sourceX = sourceNode.position.x + defaultNodeWidth / 2;
    const sourceY = sourceNode.position.y + defaultNodeHeight / 2;
    
    // Calculate center of target node for flow end
    const targetX = targetNode.position.x + defaultNodeWidth / 2;
    const targetY = targetNode.position.y + defaultNodeHeight / 2;
    
    return { sourceX, sourceY, targetX, targetY };
  }, [defaultNodeWidth, defaultNodeHeight]);
  
  return {
    fitView,
    getEdgePoints,
    handleResize,
    isDarkMode,
    processNodes: (nodes: Node[]) => processNodes(nodes, theme),
    processEdges: (edges: Edge[]) => processEdges(edges, theme)
  };
}

/**
 * Normalize flow visualization message for consistent display
 */
export function normalizeFlowMessage(flow: any) {
  return {
    id: flow.id || `flow-${Math.random().toString(36).substr(2, 9)}`,
    edgeId: flow.edgeId,
    source: flow.source,
    target: flow.target,
    content: flow.content || '',
    type: flow.type || 'message',
    progress: flow.progress || 0,
    label: flow.label,
    complete: flow.complete
  };
}

/**
 * Stabilize a flow container to prevent unwanted node position changes
 */
export function stabilizeFlowContainer(containerElement: HTMLElement | null) {
  if (!containerElement) return;
  
  // Apply hardware acceleration and other optimizations
  containerElement.style.transform = 'translateZ(0)';
  containerElement.style.backfaceVisibility = 'hidden';
  containerElement.style.WebkitBackfaceVisibility = 'hidden';
  containerElement.style.contain = 'layout paint';
  
  // Mark as stabilized
  containerElement.setAttribute('data-stabilized', 'true');
  
  // Find ReactFlow components
  const rfComponents = containerElement.querySelectorAll('.react-flow, .react-flow__renderer, .react-flow__viewport');
  rfComponents.forEach(component => {
    if (component instanceof HTMLElement) {
      component.style.transform = 'translateZ(0)';
      component.style.willChange = 'transform';
      component.style.backfaceVisibility = 'hidden';
    }
  });
  
  // Ensure nodes are visible
  const nodes = containerElement.querySelectorAll('.react-flow__node');
  nodes.forEach(node => {
    if (node instanceof HTMLElement) {
      node.style.opacity = '1';
      node.style.visibility = 'visible';
      node.style.position = 'absolute';
      node.style.zIndex = '1';
    }
  });
  
  // Ensure edges are visible
  const edges = containerElement.querySelectorAll('.react-flow__edge');
  edges.forEach(edge => {
    if (edge instanceof HTMLElement) {
      edge.style.opacity = '1';
      edge.style.visibility = 'visible';
    }
    
    // Make paths visible
    const paths = edge.querySelectorAll('path');
    paths.forEach(path => {
      path.setAttribute('stroke-width', '1.5');
      path.setAttribute('opacity', '1');
      path.setAttribute('visibility', 'visible');
    });
  });
  
  return true;
}

/**
 * Reset ReactFlow rendering - exported function that will be used by ACPDemo
 */
export function resetReactFlowRendering(containerRef: React.RefObject<HTMLElement>) {
  if (!containerRef.current) return;
  
  // Use stabilization function
  stabilizeFlowContainer(containerRef.current);
}