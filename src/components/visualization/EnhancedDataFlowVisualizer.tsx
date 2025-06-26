import { useState, useEffect, useCallback, useMemo } from 'react';
import { Edge, Node } from 'reactflow';
import { motion } from 'framer-motion';
import { getDataFlowAnimationStyle, getNodeDataFlowParams } from '@/lib/utils/dataFlowUtils';
import { DataFlowFilter } from './DataFlowControls';
import { Button } from '@/components/ui/button';
import { ChartLine } from '@phosphor-icons/react';

// Using the same DataFlow interface as the base component
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
  complete?: boolean;
}

interface EnhancedDataFlowVisualizerProps {
  flows: DataFlow[];
  edges: Edge[];
  nodes: Node[];
  getEdgePoints?: (edgeId: string) => { sourceX: number; sourceY: number; targetX: number; targetY: number } | null;
  onFlowComplete?: (flowId: string) => void;
  speed?: number;
  filter?: DataFlowFilter;
  visualizationMode: 'basic' | 'detailed' | 'timeline';
}

/**
 * Enhanced component for visualizing data flows between nodes with advanced filtering and visualization modes
 */
const EnhancedDataFlowVisualizer = ({ 
  flows,
  edges,
  nodes,
  getEdgePoints,
  onFlowComplete,
  speed = 1,
  filter,
  visualizationMode = 'basic'
}: EnhancedDataFlowVisualizerProps) => {
  const [activeFlows, setActiveFlows] = useState<DataFlow[]>([]);
  const [flowHistory, setFlowHistory] = useState<DataFlow[]>([]);
  const [showTimeline, setShowTimeline] = useState(false);

  // Apply filters to the flows
  const filteredFlows = useMemo(() => {
    if (!filter) return flows;
    
    return flows.filter(flow => {
      // Filter by message type
      if (filter.messageTypes.length > 0 && !filter.messageTypes.includes(flow.type)) {
        return false;
      }
      
      // Filter by node type (source and target)
      const sourceNode = nodes.find(n => n.id === flow.source);
      const targetNode = nodes.find(n => n.id === flow.target);
      
      if (filter.nodeTypes.length > 0) {
        const sourceNodeType = sourceNode?.data?.nodeType;
        const targetNodeType = targetNode?.data?.nodeType;
        
        if (sourceNodeType && !filter.nodeTypes.includes(sourceNodeType)) {
          return false;
        }
        
        if (targetNodeType && !filter.nodeTypes.includes(targetNodeType)) {
          return false;
        }
      }
      
      // Filter by selected connections
      if (filter.connections.length > 0) {
        const matchesConnection = filter.connections.some(
          conn => conn.source === flow.source && conn.target === flow.target
        );
        
        if (!matchesConnection) {
          return false;
        }
      }
      
      // Filter by pattern highlights (implementation would depend on pattern definitions)
      if (filter.highlightPattern) {
        // This would require a more complex implementation with pattern definitions
        // For now, we'll just pass all flows through this filter
      }
      
      return true;
    });
  }, [flows, filter, nodes]);
  
  // Update flow progress values
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFlows(prevFlows => {
        if (prevFlows.length === 0) return prevFlows;
        
        const updatedFlows = prevFlows.map(flow => {
          // Increment progress based on speed factor
          const incrementAmount = 0.02 * (speed || 1);
          const newProgress = flow.progress + incrementAmount;
          
          // If flow is complete, trigger callback and add to history
          if (newProgress >= 1) {
            if (onFlowComplete) {
              setTimeout(() => {
                onFlowComplete(flow.id);
              }, 0);
            }
            
            // Add completed flow to history
            setFlowHistory(prev => [...prev, { ...flow, complete: true, progress: 1 }]);
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
    if (filteredFlows.length === 0) return;
    
    // Only add flows that aren't already in activeFlows
    const newFlows = filteredFlows.filter(
      flow => !activeFlows.some(pf => pf.id === flow.id)
    );
    
    if (newFlows.length > 0) {
      setActiveFlows(prevFlows => [
        ...prevFlows, 
        ...newFlows.map(flow => ({ ...flow, progress: 0 }))
      ]);
    }
  }, [filteredFlows, activeFlows]);

  // Reset flow history when visualization mode changes  
  useEffect(() => {
    if (visualizationMode === 'timeline') {
      setShowTimeline(true);
    } else {
      setShowTimeline(false);
      setFlowHistory([]);
    }
  }, [visualizationMode]);

  // Render a basic flow indicator
  const renderBasicFlowIndicator = useCallback((flow: DataFlow) => {
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

  // Render a detailed flow indicator with message content
  const renderDetailedFlowIndicator = useCallback((flow: DataFlow) => {
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
    const typeParams = getNodeDataFlowParams(sourceNodeType);
    const style = getDataFlowAnimationStyle(flow.type, typeParams);

    // Get nodes for additional info
    const sourceNode = nodes.find(n => n.id === flow.source);
    const targetNode = nodes.find(n => n.id === flow.target);
    
    return (
      <motion.g 
        key={flow.id}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
      >
        {/* Flow content bubble */}
        <foreignObject
          x={x - 60}
          y={y - 40}
          width={120}
          height={80}
        >
          <div 
            className="rounded-md p-2 text-xs overflow-hidden border shadow-sm"
            style={{ 
              backgroundColor: `${style.fill}99`, 
              borderColor: style.stroke, 
              maxHeight: '100%',
              overflow: 'hidden'
            }}
          >
            <div className="font-bold truncate">
              {sourceNode?.data?.label || flow.source} → {targetNode?.data?.label || flow.target}
            </div>
            <div className="truncate mt-1">{flow.content}</div>
          </div>
        </foreignObject>
        
        {/* Flow dot */}
        <circle
          cx={x}
          cy={y}
          r={style.strokeWidth}
          fill={style.stroke}
          stroke={style.stroke}
          strokeWidth={2}
          className="flow-indicator"
        />
      </motion.g>
    );
  }, [edges, nodes, getEdgePoints]);

  // Render the timeline of flow history
  const renderTimelineVisualization = useCallback(() => {
    if (!showTimeline) return null;
    
    const timelineItems = [...flowHistory, ...activeFlows]
      .sort((a, b) => a.timestamp - b.timestamp);
    
    return (
      <foreignObject x={10} y={10} width={300} height={380}>
        <div className="bg-background/90 border rounded-md shadow-md p-3 text-xs overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Data Flow Timeline</h3>
            <Button variant="ghost" size="sm" onClick={() => setFlowHistory([])}>Clear</Button>
          </div>
          <div className="space-y-2 max-h-[320px] overflow-y-auto">
            {timelineItems.length === 0 ? (
              <div className="text-muted-foreground text-center py-6">
                No data flow history available yet
              </div>
            ) : (
              timelineItems.map((flow, index) => {
                // Get nodes for additional info
                const sourceNode = nodes.find(n => n.id === flow.source);
                const targetNode = nodes.find(n => n.id === flow.target);
                
                // Get style based on flow type
                const typeParams = getNodeDataFlowParams('default');
                const style = getDataFlowAnimationStyle(flow.type, typeParams);
                
                return (
                  <div 
                    key={`${flow.id}-${index}`} 
                    className={`border-l-2 pl-2 py-1 ${flow.complete ? '' : 'animate-pulse'}`}
                    style={{ borderColor: style.stroke }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="font-medium">
                        {sourceNode?.data?.label || flow.source} → {targetNode?.data?.label || flow.target}
                      </div>
                      <div className="text-muted-foreground">
                        {new Date(flow.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-muted-foreground mt-1 truncate">{flow.content || flow.label || flow.type}</div>
                    {!flow.complete && (
                      <div className="w-full bg-muted h-1 mt-1 rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all duration-200 ease-in-out"
                          style={{ 
                            width: `${flow.progress * 100}%`,
                            backgroundColor: style.stroke
                          }} 
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </foreignObject>
    );
  }, [showTimeline, flowHistory, activeFlows, nodes]);

  // Choose the appropriate visualization based on mode
  const renderFlowByVisualizationMode = useCallback((flow: DataFlow) => {
    switch (visualizationMode) {
      case 'detailed':
        return renderDetailedFlowIndicator(flow);
      case 'timeline':
      case 'basic':
      default:
        return renderBasicFlowIndicator(flow);
    }
  }, [visualizationMode, renderBasicFlowIndicator, renderDetailedFlowIndicator]);

  return (
    <>
      {activeFlows.map(renderFlowByVisualizationMode)}
      {visualizationMode === 'timeline' && renderTimelineVisualization()}
    </>
  );
};

export default EnhancedDataFlowVisualizer;