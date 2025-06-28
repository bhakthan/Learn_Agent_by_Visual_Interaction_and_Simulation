import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { Node, Edge, NodeChange, EdgeChange, applyNodeChanges, applyEdgeChanges } from 'reactflow';

/**
 * Custom hook to provide memoized ReactFlow state management
 * Reduces unnecessary re-renders by properly memoizing state updates
 */
export function useReactFlowMemo<NodeData = any, EdgeData = any>({
  initialNodes,
  initialEdges,
  onNodesChange: externalOnNodesChange,
  onEdgesChange: externalOnEdgesChange
}: {
  initialNodes: Node<NodeData>[];
  initialEdges: Edge<EdgeData>[];
  onNodesChange?: (changes: NodeChange[]) => void;
  onEdgesChange?: (changes: EdgeChange[]) => void;
}) {
  // Track internal state
  const [nodes, setNodes] = useState<Node<NodeData>[]>(initialNodes);
  const [edges, setEdges] = useState<Edge<EdgeData>[]>(initialEdges);
  
  // Use refs to track previous values for change detection
  const prevNodesRef = useRef<Node<NodeData>[]>(initialNodes);
  const prevEdgesRef = useRef<Edge<EdgeData>[]>(initialEdges);
  
  // Update state when initial values change from props
  useEffect(() => {
    if (initialNodes !== prevNodesRef.current) {
      setNodes(initialNodes);
      prevNodesRef.current = initialNodes;
    }
  }, [initialNodes]);
  
  useEffect(() => {
    if (initialEdges !== prevEdgesRef.current) {
      setEdges(initialEdges);
      prevEdgesRef.current = initialEdges;
    }
  }, [initialEdges]);
  
  // Memoized node change handler
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => {
        const newNodes = applyNodeChanges(changes, nds);
        
        // Call external handler if provided
        if (externalOnNodesChange) {
          externalOnNodesChange(changes);
        }
        
        return newNodes;
      });
    },
    [externalOnNodesChange]
  );
  
  // Memoized edge change handler
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => {
        const newEdges = applyEdgeChanges(changes, eds);
        
        // Call external handler if provided
        if (externalOnEdgesChange) {
          externalOnEdgesChange(changes);
        }
        
        return newEdges;
      });
    },
    [externalOnEdgesChange]
  );
  
  // Memoized update functions with stable reference
  const updateNodeData = useCallback((nodeId: string, data: Partial<NodeData>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...data } };
        }
        return node;
      })
    );
  }, []);
  
  const updateEdgeData = useCallback((edgeId: string, data: Partial<EdgeData>) => {
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === edgeId) {
          return { ...edge, data: { ...edge.data, ...data } };
        }
        return edge;
      })
    );
  }, []);
  
  // Memoize entire sets of node/edge data rather than individual elements
  const nodesData = useMemo(() => {
    const data: Record<string, NodeData> = {};
    nodes.forEach((node) => {
      data[node.id] = node.data;
    });
    return data;
  }, [nodes]);
  
  const edgesData = useMemo(() => {
    const data: Record<string, EdgeData> = {};
    edges.forEach((edge) => {
      data[edge.id] = edge.data;
    });
    return data;
  }, [edges]);
  
  // Get node/edge data by ID with memoized result
  const getNodeData = useCallback((nodeId: string): NodeData | undefined => {
    return nodesData[nodeId];
  }, [nodesData]);
  
  const getEdgeData = useCallback((edgeId: string): EdgeData | undefined => {
    return edgesData[edgeId];
  }, [edgesData]);
  
  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    updateNodeData,
    updateEdgeData,
    getNodeData,
    getEdgeData,
    nodesData,
    edgesData
  };
}