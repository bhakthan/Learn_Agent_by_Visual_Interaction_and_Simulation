/**
 * React hook for optimized ReactFlow usage with consistent behavior
 */
import { useCallback, useEffect, useState, useRef } from 'react';
import { 
  Node, 
  Edge,
  useNodesState, 
  useEdgesState, 
  useReactFlow,
  ReactFlowInstance
} from 'reactflow';
import { 
  optimizeNodes, 
  optimizeEdges, 
  forceRenderStability,
  applyDomFixes 
} from '../utils/reactFlowOptimization';

interface UseOptimizedReactFlowOptions {
  autoFitView?: boolean;
  fitViewPadding?: number;
  enableStabilization?: boolean;
  containerRef?: React.RefObject<HTMLDivElement>;
  onError?: (error: any) => void;
}

interface UseOptimizedReactFlowResult<NodeData = any, EdgeData = any> {
  nodes: Node<NodeData>[];
  edges: Edge<EdgeData>[];
  setNodes: React.Dispatch<React.SetStateAction<Node<NodeData>[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge<EdgeData>[]>>;
  updateNodeData: (nodeId: string, data: Partial<NodeData>) => void;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  fitView: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  isReady: boolean;
}

/**
 * A hook that provides optimized ReactFlow functionality with consistent behavior
 */
export function useOptimizedReactFlow<NodeData = any, EdgeData = any>(
  initialNodes: Node<NodeData>[] = [],
  initialEdges: Edge<EdgeData>[] = [],
  options: UseOptimizedReactFlowOptions = {}
): UseOptimizedReactFlowResult<NodeData, EdgeData> {
  // Default options
  const {
    autoFitView = true,
    fitViewPadding = 0.2,
    enableStabilization = true,
    containerRef,
    onError
  } = options;

  // ReactFlow state with optimization
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>(
    optimizeNodes(initialNodes)
  );
  
  const [edges, setEdges, onEdgesChange] = useEdgesState<EdgeData>(
    optimizeEdges(initialEdges)
  );

  // Track if the flow is ready
  const [isReady, setIsReady] = useState(false);
  
  // Get ReactFlow instance
  const reactFlowInstance = useReactFlow<NodeData, EdgeData>();
  
  // Store instance in ref to avoid re-renders
  const instanceRef = useRef<ReactFlowInstance | null>(null);
  
  // Keep instance ref updated
  useEffect(() => {
    instanceRef.current = reactFlowInstance;
  }, [reactFlowInstance]);

  // Update nodes when initialNodes change
  useEffect(() => {
    const optimizedNodes = optimizeNodes(initialNodes);
    setNodes(optimizedNodes);
  }, [initialNodes, setNodes]);

  // Update edges when initialEdges change
  useEffect(() => {
    const optimizedEdges = optimizeEdges(initialEdges);
    setEdges(optimizedEdges);
  }, [initialEdges, setEdges]);

  // Fit view when needed
  useEffect(() => {
    if (autoFitView && instanceRef.current && isReady) {
      const timer = setTimeout(() => {
        try {
          if (instanceRef.current) {
            instanceRef.current.fitView({
              padding: fitViewPadding,
              includeHiddenNodes: true,
              duration: 200
            });
          }
        } catch (error) {
          if (onError) onError(error);
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [autoFitView, fitViewPadding, isReady, onError]);

  // Apply stability fixes
  useEffect(() => {
    if (enableStabilization) {
      // Apply fixes when component mounts
      const applyFixes = () => {
        if (containerRef?.current) {
          applyDomFixes(containerRef.current);
        }
        
        forceRenderStability(instanceRef.current);
      };
      
      // Apply fixes multiple times with increasing delays
      const timers = [
        setTimeout(applyFixes, 100),
        setTimeout(applyFixes, 500),
        setTimeout(applyFixes, 1500),
      ];
      
      // Mark as ready after a delay
      const readyTimer = setTimeout(() => {
        setIsReady(true);
      }, 600);
      
      return () => {
        timers.forEach(clearTimeout);
        clearTimeout(readyTimer);
      };
    } else {
      // If stabilization is disabled, just mark as ready
      setIsReady(true);
    }
  }, [enableStabilization, containerRef]);

  // Utility to update node data
  const updateNodeData = useCallback((nodeId: string, data: Partial<NodeData>) => {
    setNodes(currentNodes => 
      currentNodes.map(node => 
        node.id === nodeId 
          ? { ...node, data: { ...node.data, ...data } } 
          : node
      )
    );
  }, [setNodes]);

  // Wrapper for fitView to handle errors
  const fitView = useCallback(() => {
    if (!instanceRef.current) return;
    
    try {
      instanceRef.current.fitView({
        padding: fitViewPadding,
        includeHiddenNodes: true,
        duration: 200
      });
    } catch (error) {
      if (onError) onError(error);
    }
  }, [fitViewPadding, onError]);

  // Zoom utility functions
  const zoomIn = useCallback(() => {
    if (!instanceRef.current) return;
    try {
      instanceRef.current.zoomIn();
    } catch (error) {
      if (onError) onError(error);
    }
  }, [onError]);

  const zoomOut = useCallback(() => {
    if (!instanceRef.current) return;
    try {
      instanceRef.current.zoomOut();
    } catch (error) {
      if (onError) onError(error);
    }
  }, [onError]);

  const resetZoom = useCallback(() => {
    if (!instanceRef.current) return;
    try {
      instanceRef.current.setViewport({ x: 0, y: 0, zoom: 1 });
    } catch (error) {
      if (onError) onError(error);
    }
  }, [onError]);

  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    updateNodeData,
    onNodesChange,
    onEdgesChange,
    fitView,
    zoomIn,
    zoomOut,
    resetZoom,
    isReady
  };
}