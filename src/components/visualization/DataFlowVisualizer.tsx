import { useCallback, useEffect, useState } from 'react';
import { Edge } from 'reactflow';
import { motion } from 'framer-motion';
import * as dataFlowUtils from '@/lib/utils/dataFlowUtils';
import { useTheme } from '@/components/theme/ThemeProvider';

// Updated the interface with all required properties
interface DataFlow {
  id: string;
  edgeId: string;
  source: string;
  target: string;
  content: string;
  timestamp: number;
  type: 'query' | 'response' | 'tool_call' | 'observation' | 'reflection' | 'plan' | 'message' | 'data' | 'error';
  progress: number;
  label?: string;
  complete?: boolean;
}

interface DataFlowVisualizerProps {
  flows: DataFlow[];
  edges: Edge[];
  getEdgePoints?: (edgeId: string) => { sourceX: number; sourceY: number; targetX: number; targetY: number } | null;
  onFlowComplete?: (flowId: string) => void;
  speed?: number; // Speed factor to control animation speed
}

/**
 * Component to visualize data flowing between nodes on the ReactFlow canvas
 */
const DataFlowVisualizer = ({ flows, edges, getEdgePoints, onFlowComplete, speed = 1 }: DataFlowVisualizerProps) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [activeFlows, setActiveFlows] = useState<DataFlow[]>([]);
  
  // Update flow progress values
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFlows(prevFlows => {
        if (prevFlows.length === 0) return prevFlows;
        
        const updatedFlows = prevFlows.map(flow => {
          // Increment progress based on speed factor
          const incrementAmount = 0.02 * (speed || 1);
          const newProgress = flow.progress + incrementAmount;
          
          // If flow is complete, trigger callback
          if (newProgress >= 1 && onFlowComplete) {
            setTimeout(() => {
              onFlowComplete(flow.id);
            }, 0);
          }
          
          return {
            ...flow, 
            progress: Math.min(newProgress, 1)
          };
        });
        
        return updatedFlows.filter(flow => flow.progress < 1);
      });
    }, 20); // Base interval for animation updates
    
    return () => clearInterval(interval);
  }, [onFlowComplete, speed]);
  
  // Add new flows to active flows
  useEffect(() => {
    if (flows.length === 0) return;
    
    // Only add flows that aren't already in activeFlows
    const newFlows = flows.filter(
      flow => !activeFlows.some(pf => pf.id === flow.id)
    );
    
    if (newFlows.length > 0) {
      setActiveFlows(prevFlows => [
        ...prevFlows, 
        ...newFlows.map(flow => ({ ...flow, progress: 0 }))
      ]);
    }
  }, [flows, activeFlows]);
  
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
    const sourceNodeType = edge.sourceHandle ? edge.sourceHandle : 'default';
    const typeParams = dataFlowUtils.getNodeDataFlowParams(sourceNodeType);
    const style = dataFlowUtils.getDataFlowAnimationStyle(flow.type, typeParams);
    
    // Enhance visibility in dark mode
    const textColor = isDarkMode ? 'rgba(255, 255, 255, 0.9)' : style.stroke;
    const textStroke = isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'none';
    const dotFill = isDarkMode && flow.type !== 'error' ? 'rgba(255, 255, 255, 0.9)' : style.stroke;
    
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
          fill={dotFill}
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
            fill={textColor}
            stroke={textStroke}
            strokeWidth={isDarkMode ? 0.3 : 0}
            fontSize={10}
            fontWeight={500}
            paintOrder="stroke"
            style={{ textShadow: isDarkMode ? '0 1px 2px rgba(0, 0, 0, 0.8)' : 'none' }}
          >
            {flow.label}
          </text>
        )}
      </motion.g>
    );
  }, [edges, getEdgePoints, isDarkMode]);

  return (
    <>
      {activeFlows.map(renderFlowIndicator)}
    </>
  );
};

export default DataFlowVisualizer;
