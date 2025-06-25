import { useCallback, useEffect, useState } from 'react';
import { Edge } from 'reactflow';
import { motion } from 'framer-motion';
import { getDataFlowAnimationStyle, getNodeDataFlowParams } from '@/lib/utils/dataFlowUtils';

interface DataFlow {
  id: string;
  edgeId: string;
  source: string;
  target: string;
  content: string;
  timestamp: number;
  type: 'message' | 'data' | 'response' | 'error';
  progress: number;
  label?: string;
}

interface DataFlowVisualizerProps {
  flows: DataFlow[];
  edges: Edge[];
  getEdgePoints?: (edgeId: string) => { sourceX: number; sourceY: number; targetX: number; targetY: number } | null;
  onFlowComplete?: (flowId: string) => void;
}

/**
 * Component to visualize data flowing between nodes on the ReactFlow canvas
 */
const DataFlowVisualizer = ({ flows, edges, getEdgePoints, onFlowComplete }: DataFlowVisualizerProps) => {
  const [activeFlows, setActiveFlows] = useState<DataFlow[]>([]);
  
  // Update flow progress values
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFlows(prevFlows => 
        prevFlows.map(flow => {
          // Increment progress
          const newProgress = flow.progress + 0.02;
          
          // If flow is complete, trigger callback
          if (newProgress >= 1 && onFlowComplete) {
            onFlowComplete(flow.id);
          }
          
          return {
            ...flow, 
            progress: Math.min(newProgress, 1)
          };
        }).filter(flow => flow.progress < 1)
      );
    }, 20);
    
    return () => clearInterval(interval);
  }, [onFlowComplete]);
  
  // Add new flows to active flows
  useEffect(() => {
    setActiveFlows(prevFlows => [
      ...prevFlows, 
      ...flows
        .filter(flow => !prevFlows.some(pf => pf.id === flow.id))
        .map(flow => ({ ...flow, progress: 0 }))
    ]);
  }, [flows]);
  
  const renderFlowIndicator = useCallback((flow: DataFlow) => {
    // Find the edge for this flow
    const edge = edges.find(e => e.id === flow.edgeId || (e.source === flow.source && e.target === flow.target));
    if (!edge || !getEdgePoints) return null;
    
    // Get the edge points
    const points = getEdgePoints(edge.id);
    if (!points) return null;
    
    const { sourceX, sourceY, targetX, targetY } = points;
    
    // Calculate position along the edge based on progress
    const x = sourceX + (targetX - sourceX) * flow.progress;
    const y = sourceY + (targetY - sourceY) * flow.progress;
    
    // Get animation style based on flow type
    const sourceNodeType = edge.sourceNode?.data?.nodeType;
    const typeParams = getNodeDataFlowParams(sourceNodeType);
    const style = getDataFlowAnimationStyle(flow.type, typeParams);
    
    return (
      <motion.g 
        key={flow.id}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
      >
        {/* Flow dot */}
        <circle
          cx={x}
          cy={y}
          r={style.strokeWidth / 2}
          fill={style.stroke}
          stroke={style.stroke}
          strokeWidth={1}
          className="flow-indicator"
        />
        
        {/* Optional label */}
        {flow.label && (
          <text
            x={x}
            y={y - 10}
            textAnchor="middle"
            fill={style.stroke}
            fontSize={10}
            fontWeight={500}
          >
            {flow.label}
          </text>
        )}
      </motion.g>
    );
  }, [edges, getEdgePoints]);

  return (
    <>
      {activeFlows.map(renderFlowIndicator)}
    </>
  );
};

export default DataFlowVisualizer;