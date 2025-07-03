import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Edge } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import { getNodeDataFlowParams, getDataFlowAnimationStyle, DataFlowType } from '@/lib/utils/dataFlowUtils';
import { useTheme } from '@/components/theme/ThemeProvider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { normalizeFlowMessage } from '@/lib/utils/visualizationUtils';

// Data transformation states
type TransformationStage = 'raw' | 'processing' | 'transformed';

// Enhanced data flow interface with transformation data
interface TransformableDataFlow {
  id: string;
  edgeId: string;
  source: string;
  target: string;
  content: string;
  rawContent?: string;
  transformedContent?: string;
  timestamp: number;
  type: DataFlowType;
  progress: number;
  transformStage?: TransformationStage;
  transformationProgress?: number;
  label?: string;
  metadata?: Record<string, any>;
  complete?: boolean;
}

interface DataTransformVisualizerProps {
  flows: TransformableDataFlow[];
  edges: Edge[];
  getEdgePoints?: (edgeId: string) => { sourceX: number; sourceY: number; targetX: number; targetY: number } | null;
  onFlowComplete?: (flowId: string) => void;
  speed?: number;
  colorMap?: Record<string, { color: string; fill?: string; strokeWidth?: number }>;
  showLabels?: boolean;
  showTransformationEffects?: boolean;
  nodeTypeMap?: Record<string, string>; // Map node IDs to their types
}

/**
 * Component to visualize data transformations flowing between nodes on the ReactFlow canvas
 */
const DataTransformVisualizer = React.memo(({ 
  flows, 
  edges, 
  getEdgePoints, 
  onFlowComplete, 
  speed = 1,
  colorMap = {},
  showLabels = true,
  showTransformationEffects = true,
  nodeTypeMap = {}
}: DataTransformVisualizerProps) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [activeFlows, setActiveFlows] = useState<TransformableDataFlow[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  
  // Clean up animation frames on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Update flow progress values using requestAnimationFrame for smoother animations
  useEffect(() => {
    const updateFlows = (timestamp: number) => {
      // Calculate time delta for smooth animation regardless of frame rate
      const delta = lastUpdateTimeRef.current ? (timestamp - lastUpdateTimeRef.current) / 1000 : 0.016;
      lastUpdateTimeRef.current = timestamp;
      
      setActiveFlows(prevFlows => {
        if (prevFlows.length === 0) return prevFlows;
        
        // Calculate base progress increment based on delta and speed
        const baseIncrement = delta * (speed * 0.6);
        
        const updatedFlows = prevFlows.map(flow => {
          // Increment primary progress 
          const newProgress = flow.progress + baseIncrement;
          
          // Handle transformation effects
          let transformStage = flow.transformStage || 'raw';
          let transformationProgress = flow.transformationProgress || 0;
          
          if (showTransformationEffects && newProgress > 0.45 && newProgress < 0.55) {
            // Start transformation in the middle of the path
            transformStage = 'processing';
            transformationProgress = Math.min((transformationProgress || 0) + (baseIncrement * 3), 1);
            
            if (transformationProgress >= 1) {
              transformStage = 'transformed';
            }
          }
          
          // Notify when flow is complete
          if (newProgress >= 1 && onFlowComplete) {
            setTimeout(() => {
              onFlowComplete(flow.id);
            }, 0);
          }
          
          return {
            ...flow, 
            progress: Math.min(newProgress, 1),
            transformStage,
            transformationProgress
          };
        });
        
        return updatedFlows.filter(flow => flow.progress < 1);
      });
      
      // Continue animation loop
      animationFrameRef.current = requestAnimationFrame(updateFlows);
    };
    
    // Start animation loop
    animationFrameRef.current = requestAnimationFrame(updateFlows);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [onFlowComplete, speed, showTransformationEffects]);
  
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
        ...newFlows.map(flow => ({ 
          ...flow, 
          progress: 0,
          transformStage: 'raw',
          transformationProgress: 0,
        }))
      ]);
    }
  }, [flows, activeFlows]);

  // Get color scheme based on the transformation relationship between source and target nodes
  const getTransformationColors = useCallback((flow: TransformableDataFlow, baseStyle: any) => {
    const sourceType = nodeTypeMap[flow.source] || 'default';
    const targetType = nodeTypeMap[flow.target] || 'default';
    
    // Get base colors from flow type
    const { color: baseColor } = getDataFlowAnimationStyle(flow.type);
    
    // Create transformation-specific colors
    let startColor = baseColor;
    let endColor = baseColor;
    let fillColor = `${baseColor}33`; // Add alpha for fill
    
    // Logic for source->target transformations based on node types
    if (sourceType === 'user' && targetType === 'agent') {
      // User to agent: Query transformation
      startColor = 'rgba(59, 130, 246, 0.9)'; // Blue (user)
      endColor = 'rgba(16, 185, 129, 0.9)'; // Green (agent)
      fillColor = isDarkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)';
    } 
    else if (sourceType === 'agent' && targetType === 'tool') {
      // Agent to tool: Tool call transformation
      startColor = 'rgba(16, 185, 129, 0.9)'; // Green (agent)
      endColor = 'rgba(245, 158, 11, 0.9)'; // Amber (tool)
      fillColor = isDarkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)';
    }
    else if (sourceType === 'tool' && targetType === 'agent') {
      // Tool to agent: Response transformation
      startColor = 'rgba(245, 158, 11, 0.9)'; // Amber (tool)
      endColor = 'rgba(16, 185, 129, 0.9)'; // Green (agent) 
      fillColor = isDarkMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.2)';
    }
    else if (sourceType === 'agent' && targetType === 'environment') {
      // Agent to environment: Action transformation
      startColor = 'rgba(16, 185, 129, 0.9)'; // Green (agent)
      endColor = 'rgba(139, 92, 246, 0.9)'; // Purple (environment)
      fillColor = isDarkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)';
    }
    else if (sourceType === 'environment' && targetType === 'agent') {
      // Environment to agent: Observation transformation
      startColor = 'rgba(139, 92, 246, 0.9)'; // Purple (environment)
      endColor = 'rgba(16, 185, 129, 0.9)'; // Green (agent)
      fillColor = isDarkMode ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)';
    }
    else if (sourceType === 'agent' && targetType === 'reflection') {
      // Agent to reflection: Thought transformation
      startColor = 'rgba(16, 185, 129, 0.9)'; // Green (agent)
      endColor = 'rgba(236, 72, 153, 0.9)'; // Pink (reflection)
      fillColor = isDarkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)';
    }
    else if (sourceType === 'agent' && targetType === 'agent') {
      // Agent to agent: A2A communication
      startColor = 'rgba(16, 185, 129, 0.9)'; // Green (first agent)
      endColor = 'rgba(22, 163, 74, 0.9)'; // Different green (second agent)
      fillColor = isDarkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)';
    }
    else if (sourceType === 'planner' && targetType === 'agent') {
      // Planner to agent: Plan transformation
      startColor = 'rgba(22, 163, 74, 0.9)'; // Emerald (planner)
      endColor = 'rgba(16, 185, 129, 0.9)'; // Green (agent)
      fillColor = isDarkMode ? 'rgba(22, 163, 74, 0.3)' : 'rgba(22, 163, 74, 0.2)';
    }
    else if (sourceType === 'evaluator' && targetType === 'agent') {
      // Evaluator to agent: Evaluation transformation
      startColor = 'rgba(234, 179, 8, 0.9)'; // Yellow (evaluator)
      endColor = 'rgba(16, 185, 129, 0.9)'; // Green (agent)
      fillColor = isDarkMode ? 'rgba(234, 179, 8, 0.3)' : 'rgba(234, 179, 8, 0.2)';
    }
    
    // Override with custom color map if provided
    if (colorMap[flow.type]) {
      if (colorMap[flow.type].color) {
        startColor = colorMap[flow.type].color;
        endColor = colorMap[flow.type].color;
      }
      if (colorMap[flow.type].fill) {
        fillColor = colorMap[flow.type].fill;
      }
    }
    
    // Apply transformation stage effects
    if (flow.transformStage === 'processing') {
      // During processing, blend between the colors
      const blendAmount = flow.transformationProgress || 0;
      // This is a simplistic blend - a more sophisticated color interpolation could be used
      return {
        startColor,
        endColor,
        fillColor,
        currentColor: startColor, // Keep using start color for simplicity
        pulseEffect: true, // Add pulsing effect during transformation
      };
    } else if (flow.transformStage === 'transformed') {
      // After transformation, use the end color
      return {
        startColor,
        endColor,
        fillColor,
        currentColor: endColor,
        pulseEffect: false,
      };
    }
    
    // Default - raw state
    return {
      startColor,
      endColor,
      fillColor,
      currentColor: startColor,
      pulseEffect: false,
    };
  }, [colorMap, isDarkMode, nodeTypeMap]);

  // Get appropriate display content based on flow state
  const getDisplayContent = useCallback((flow: TransformableDataFlow) => {
    if (!showLabels) return null;
    
    if (flow.transformStage === 'transformed' && flow.transformedContent) {
      return flow.transformedContent;
    }
    
    if (flow.transformStage === 'processing') {
      return '...';
    }
    
    return flow.content || flow.rawContent || flow.label;
  }, [showLabels]);

  // Render an individual flow indicator with transformation effects
  const renderFlowIndicator = useCallback((flow: TransformableDataFlow) => {
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
    const sourceNodeType = nodeTypeMap[flow.source] || edge.sourceHandle || 'default';
    const typeParams = getNodeDataFlowParams(sourceNodeType);
    const baseStyle = getDataFlowAnimationStyle(flow.type, typeParams);
    
    // Get transformation-specific colors
    const transformColors = getTransformationColors(flow, baseStyle);
    
    // Create style object with needed properties for rendering
    const style = {
      stroke: transformColors.currentColor,
      strokeWidth: colorMap[flow.type]?.strokeWidth || typeParams.strokeWidth || 4,
      fill: transformColors.fillColor
    };
    
    // Enhance visibility in dark mode
    const textColor = isDarkMode ? 'rgba(255, 255, 255, 0.95)' : style.stroke;
    const textStroke = isDarkMode ? 'rgba(0, 0, 0, 0.6)' : 'none';
    const dotFill = isDarkMode && flow.type !== 'error' ? 'rgba(255, 255, 255, 0.95)' : style.stroke;
    const dotSize = style.strokeWidth * (transformColors.pulseEffect ? 1.8 : 1.5); // Larger for pulse effect
    
    // Get content to display
    const displayContent = getDisplayContent(flow);
    
    // Define animations based on transformation stage
    const dotAnimations = {
      scale: transformColors.pulseEffect 
        ? [1, 1.3, 1] 
        : 1,
      opacity: 1
    };
    
    const dotTransition = {
      scale: transformColors.pulseEffect 
        ? { repeat: Infinity, duration: 1, ease: "easeInOut" } 
        : { duration: 0.3 }
    };
    
    return (
      <AnimatePresence key={flow.id}>
        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
        >
          {/* Flow dot with pulse effect */}
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <motion.circle
                  cx={x}
                  cy={y}
                  r={dotSize}
                  fill={dotFill}
                  stroke={style.stroke}
                  strokeWidth={1}
                  className="flow-indicator"
                  animate={dotAnimations}
                  transition={dotTransition}
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs bg-card text-card-foreground">
                <div className="space-y-1">
                  <p className="font-medium text-sm">{flow.type.charAt(0).toUpperCase() + flow.type.slice(1)}</p>
                  {flow.content && <p className="text-xs opacity-90">{flow.content}</p>}
                  {flow.metadata && Object.keys(flow.metadata).length > 0 && (
                    <div className="text-xs grid grid-cols-2 gap-x-2 opacity-70 pt-1">
                      {Object.entries(flow.metadata).map(([key, value]) => (
                        <React.Fragment key={key}>
                          <span>{key}:</span>
                          <span className="font-mono">{String(value)}</span>
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Optional label with animation based on transformation state */}
          {displayContent && (
            <motion.text
              x={x}
              y={y - 12}
              textAnchor="middle"
              fill={textColor}
              stroke={textStroke}
              strokeWidth={isDarkMode ? 0.3 : 0}
              fontSize={10}
              fontWeight={flow.transformStage === 'transformed' ? 600 : 500}
              paintOrder="stroke"
              style={{ 
                textShadow: isDarkMode ? '0 1px 2px rgba(0, 0, 0, 0.8)' : 'none',
              }}
              animate={{ 
                opacity: flow.transformStage === 'processing' ? [0.5, 0.9, 0.5] : 1,
                scale: flow.transformStage === 'transformed' ? [1, 1.1, 1] : 1,
              }}
              transition={{ 
                opacity: flow.transformStage === 'processing' 
                  ? { repeat: Infinity, duration: 1, ease: "easeInOut" } 
                  : { duration: 0.3 },
                scale: flow.transformStage === 'transformed'
                  ? { duration: 0.5, ease: "backOut" }
                  : { duration: 0.3 },
              }}
            >
              {displayContent}
            </motion.text>
          )}
          
          {/* Transformation effect - particles during processing */}
          {showTransformationEffects && flow.transformStage === 'processing' && (
            <>
              {[...Array(3)].map((_, i) => (
                <motion.circle
                  key={`particle-${flow.id}-${i}`}
                  cx={x}
                  cy={y}
                  r={2}
                  fill={i % 2 === 0 ? transformColors.startColor : transformColors.endColor}
                  opacity={0.8}
                  animate={{
                    cx: x + (Math.random() * 20 - 10),
                    cy: y + (Math.random() * 20 - 10),
                    opacity: [0.8, 0, 0.8],
                    scale: [1, 1.5, 0.8, 1]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </>
          )}
        </motion.g>
      </AnimatePresence>
    );
  }, [
    edges, getEdgePoints, isDarkMode, nodeTypeMap, getTransformationColors, 
    colorMap, getDisplayContent, showTransformationEffects
  ]);

  return (
    <>
      {activeFlows.map(renderFlowIndicator)}
    </>
  );
}, (prevProps, nextProps) => {
  // Only re-render when relevant props change
  if (prevProps.speed !== nextProps.speed) return false;
  if (prevProps.showLabels !== nextProps.showLabels) return false;
  if (prevProps.showTransformationEffects !== nextProps.showTransformationEffects) return false;
  if (prevProps.edges.length !== nextProps.edges.length) return false;
  if (prevProps.flows.length !== nextProps.flows.length) return false;
  if (JSON.stringify(prevProps.colorMap) !== JSON.stringify(nextProps.colorMap)) return false;
  if (JSON.stringify(prevProps.nodeTypeMap) !== JSON.stringify(nextProps.nodeTypeMap)) return false;
  
  // Check if flows array has changed significantly
  const prevFlowIds = new Set(prevProps.flows.map(f => f.id));
  const nextFlowIds = new Set(nextProps.flows.map(f => f.id));
  if (prevFlowIds.size !== nextFlowIds.size) return false;
  
  // Check if there are new flows
  for (const id of nextFlowIds) {
    if (!prevFlowIds.has(id)) return false;
  }
  
  // If we got here, props are similar enough to skip re-rendering
  return true;
});

export default DataTransformVisualizer;