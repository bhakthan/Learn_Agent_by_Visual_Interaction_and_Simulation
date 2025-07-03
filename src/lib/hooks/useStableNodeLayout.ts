/**
 * Custom hook to ensure consistent node layouts and prevent rendering issues
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { Node, Edge, useReactFlow } from 'reactflow';
import { standardNodePositions } from '../utils/standardNodeUtils';

/**
 * Hook to ensure consistent node layouts and prevent rendering issues
 */
export function useStableNodeLayout(
  initialNodes: Node[],
  initialEdges: Edge[],
  containerRef: React.RefObject<HTMLDivElement>
) {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const reactFlowInstance = useReactFlow();
  const nodePositionsRef = useRef<Record<string, { x: number, y: number }>>({});
  
  // Initialize node positions if they're not set
  useEffect(() => {
    setNodes((prevNodes) => {
      return prevNodes.map(node => {
        if (node.position.x === 0 && node.position.y === 0 && node.data?.nodeType) {
          const defaultPosition = standardNodePositions[node.data.nodeType as keyof typeof standardNodePositions] || 
            { x: Math.random() * 300 + 100, y: Math.random() * 300 + 100 };
          
          nodePositionsRef.current[node.id] = defaultPosition;
          return {
            ...node,
            position: defaultPosition
          };
        }
        
        nodePositionsRef.current[node.id] = node.position;
        return node;
      });
    });
  }, [initialNodes]);

  // Fit view on initial render and resize
  useEffect(() => {
    const fitView = () => {
      if (reactFlowInstance && typeof reactFlowInstance.fitView === 'function') {
        setTimeout(() => {
          try {
            reactFlowInstance.fitView({ padding: 0.2, includeHiddenNodes: true });
          } catch (e) {
            console.error("Error fitting view:", e);
          }
        }, 100);
      }
    };
    
    fitView();
    
    const handleResize = () => {
      fitView();
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [reactFlowInstance, nodes, edges]);
  
  // Reset node positions if they get lost
  const resetPositions = useCallback(() => {
    setNodes((prevNodes) => {
      return prevNodes.map(node => {
        const savedPosition = nodePositionsRef.current[node.id];
        if (savedPosition) {
          return {
            ...node,
            position: savedPosition
          };
        }
        return node;
      });
    });
    
    setTimeout(() => {
      if (reactFlowInstance && typeof reactFlowInstance.fitView === 'function') {
        reactFlowInstance.fitView({ padding: 0.2 });
      }
    }, 50);
  }, [reactFlowInstance]);
  
  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    resetPositions
  };
}

export default useStableNodeLayout;