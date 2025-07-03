import React, { useCallback, useEffect, useState } from 'react';
import { Edge } from 'reactflow';
import { motion } from 'framer-motion';
import { getNodeDataFlowParams, getDataFlowAnimationStyle, simulatePatternFlow } from '@/lib/utils/dataFlowUtils';
import { useTheme } from '@/components/theme/ThemeProvider';
import { useVisualizationTheme } from '@/lib/utils/visualizationTheme';

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
  colorMap?: Record<string, { color: string; fill?: string; strokeWidth?: number }>; // Custom colors for different flow types
}



/**
 * Component to visualize data flowing between nodes on the ReactFlow canvas
 */
const DataFlowVisualizer = React.memo(({ 
  flows, 
  edges, 
  getEdgePoints, 
  onFlowComplete, 
  speed = 1,
  colorMap = {} 
}: DataFlowVisualizerProps) => {
  // Get theme from the ThemeProvider context and visualization theme
  const { theme } = useTheme();
  const { isDarkMode, getFlowStyle } = useVisualizationTheme();
  const [activeFlows, setActiveFlows] = useState<DataFlow[]>([]);
  
  // Update flow progress values with improved animation handling
  useEffect(() => {
    // Create a more stable animation loop
    let animationFrameId: number;
    let lastUpdateTime = performance.now();
    
    const updateAnimations = (currentTime: number) => {
      // Calculate time delta for smooth animation regardless of frame rate
      const deltaTime = currentTime - lastUpdateTime;
      lastUpdateTime = currentTime;
      
      // Only update if we have flows to animate
      if (activeFlows.length > 0) {
        setActiveFlows(prevFlows => {
          // Calculate progress increment based on delta time for smooth animation
          const baseIncrement = 0.0006 * deltaTime; // Base speed adjustment
          const speedFactor = speed || 1;
          const incrementAmount = baseIncrement * speedFactor;
          
          const updatedFlows = prevFlows.map(flow => {
            // Increment progress based on speed factor
            const newProgress = flow.progress + incrementAmount;
            
            // If flow is complete, trigger callback
            if (newProgress >= 1 && onFlowComplete) {
              // Schedule callback outside of render cycle
              setTimeout(() => {
                onFlowComplete(flow.id);
              }, 0);
            }
            
            return {
              ...flow, 
              progress: Math.min(newProgress, 1)
            };
          });
          
          // Filter out completed flows
          return updatedFlows.filter(flow => flow.progress < 1);
        });
      }
      
      // Continue animation loop
      animationFrameId = requestAnimationFrame(updateAnimations);
    };
    
    // Start animation loop
    animationFrameId = requestAnimationFrame(updateAnimations);
    
    return () => {
      // Clean up animation frame
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [onFlowComplete, speed, activeFlows.length]);
  
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
    
    // Get standardized style based on flow type
    const flowStyleParams = getFlowStyle(flow.type);
    
    // Use custom color if provided in colorMap, otherwise use default
    const customStyle = colorMap[flow.type];
    
    // Create style object with needed properties for rendering
    const style = {
      stroke: customStyle?.color || flowStyleParams.color,
      strokeWidth: customStyle?.strokeWidth || flowStyleParams.strokeWidth,
      fill: customStyle?.fill || flowStyleParams.fill
    };
    
    // Enhance visibility in dark mode
    const textColor = flowStyleParams.textColor || (isDarkMode ? 'rgba(255, 255, 255, 0.95)' : style.stroke);
    const textStroke = isDarkMode ? 'rgba(0, 0, 0, 0.6)' : 'none';
    const dotFill = isDarkMode && flow.type !== 'error' ? 'rgba(255, 255, 255, 0.95)' : style.stroke;
    const dotSize = flowStyleParams.dotSize || 6;
    
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
          r={dotSize}
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
  }, [edges, getEdgePoints, isDarkMode, getFlowStyle, colorMap]);

  return (
    <>
      {activeFlows.map(renderFlowIndicator)}
    </>
  );
}, (prevProps, nextProps) => {
  // Only re-render when relevant props change
  if (prevProps.speed !== nextProps.speed) return false;
  if (prevProps.edges.length !== nextProps.edges.length) return false;
  if (prevProps.flows.length !== nextProps.flows.length) return false;
  if (prevProps.colorMap !== nextProps.colorMap) return false;
  
  // Check if flows array has changed significantly
  const prevFlowIds = new Set(prevProps.flows.map(f => f.id));
  const nextFlowIds = new Set(nextProps.flows.map(f => f.id));
  if (prevFlowIds.size !== nextFlowIds.size) return false;
  
  // If we got here, props are similar enough to skip re-rendering
  return true;
});

export default DataFlowVisualizer;
