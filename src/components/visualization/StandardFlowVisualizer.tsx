import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
  BackgroundVariant,
  Node,
  Edge,
  NodeTypes
} from 'reactflow';
import 'reactflow/dist/style.css';
import { AgentNode } from './node-types/AgentNode';
import DataFlowVisualizer from './DataFlowVisualizer';
import { cn } from '@/lib/utils';
import { useVisualizationTheme } from '@/lib/utils/visualizationTheme';
import { DataFlowType } from '@/lib/utils/dataFlowUtils';

// Standard node types
const defaultNodeTypes: NodeTypes = {
  agent: AgentNode,
};

// Interface for flow message with standardized properties
export interface StandardFlowMessage {
  id: string;
  edgeId: string;
  source: string;
  target: string;
  content: string;
  type: DataFlowType;
  progress: number;
  label?: string;
  complete?: boolean;
}

interface StandardFlowVisualizerProps {
  nodes: Node[];
  edges: Edge[];
  flows?: StandardFlowMessage[];
  nodeTypes?: NodeTypes;
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  onFlowComplete?: (flowId: string) => void;
  animationSpeed?: number;
  showLabels?: boolean;
  showControls?: boolean;
  autoFitView?: boolean;
  className?: string;
}

/**
 * StandardFlowVisualizer - A component for visualizing data flows between nodes
 * with consistent styling across the application
 */
export const StandardFlowVisualizer: React.FC<StandardFlowVisualizerProps> = ({
  nodes: initialNodes,
  edges: initialEdges,
  flows = [],
  nodeTypes = defaultNodeTypes,
  onNodesChange,
  onEdgesChange,
  onFlowComplete,
  animationSpeed = 1,
  showLabels = true,
  showControls = true,
  autoFitView = true,
  className
}) => {
  const { theme, isDarkMode, background, edges: edgeStyles } = useVisualizationTheme();
  const [nodes, setNodes, onNodeChanges] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgeChanges] = useEdgesState(initialEdges);
  const [activeFlows, setActiveFlows] = useState<StandardFlowMessage[]>([]);
  const reactFlowInstance = useReactFlow();

  // Handle external node changes
  useEffect(() => {
    if (onNodesChange) {
      onNodesChange(nodes);
    }
  }, [nodes, onNodesChange]);

  // Handle external edge changes
  useEffect(() => {
    if (onEdgesChange) {
      onEdgesChange(edges);
    }
  }, [edges, onEdgesChange]);

  // Update with external nodes
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  // Update with external edges
  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  // Update flows from external source
  useEffect(() => {
    setActiveFlows(flows);
  }, [flows]);

  // Get edge points for data flow visualization
  const getEdgePoints = useCallback((edgeId: string) => {
    if (!reactFlowInstance) return null;
    
    const edge = edges.find(e => e.id === edgeId);
    if (!edge) return null;
    
    // Get source and target nodes
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    if (!sourceNode || !targetNode) return null;
    
    // Use direct node positions since getNodePositionById is not available
    const sourcePosition = sourceNode.position;
    const targetPosition = targetNode.position;
    
    // Get node dimensions
    const sourceWidth = (sourceNode as any).width || 150;
    const sourceHeight = (sourceNode as any).height || 40;
    const targetWidth = (targetNode as any).width || 150;
    const targetHeight = (targetNode as any).height || 40;
    
    // Calculate center points
    const sourceX = sourcePosition.x + sourceWidth / 2;
    const sourceY = sourcePosition.y + sourceHeight / 2;
    const targetX = targetPosition.x + targetWidth / 2;
    const targetY = targetPosition.y + targetHeight / 2;
    
    return { sourceX, sourceY, targetX, targetY };
  }, [reactFlowInstance, nodes, edges]);

  // Handle flow completion
  const handleFlowComplete = useCallback((flowId: string) => {
    if (onFlowComplete) {
      onFlowComplete(flowId);
    } else {
      setActiveFlows(flows => flows.filter(flow => flow.id !== flowId));
    }
  }, [onFlowComplete]);

  // Auto fit view when content changes
  useEffect(() => {
    if (autoFitView && reactFlowInstance) {
      setTimeout(() => {
        reactFlowInstance.fitView({
          padding: 0.2,
          includeHiddenNodes: false,
          duration: 800,
        });
      }, 200);
    }
  }, [autoFitView, reactFlowInstance, nodes, edges]);

  return (
    <div className={cn(
      "w-full h-[400px] border border-border rounded-md overflow-hidden", 
      className
    )}
    style={{
      transform: 'translateZ(0)',
      backfaceVisibility: 'hidden',
      WebkitBackfaceVisibility: 'hidden',
      position: 'relative',
      contain: 'layout'
    }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodeChanges}
        onEdgesChange={onEdgeChanges}
        nodeTypes={nodeTypes}
        fitView={autoFitView}
        fitViewOptions={{ padding: 0.2, includeHiddenNodes: false }}
        minZoom={0.5}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        attributionPosition="bottom-right"
        onInit={(instance) => {
          // Fit view after initialization
          setTimeout(() => {
            if (instance && typeof instance.fitView === 'function') {
              instance.fitView({ padding: 0.2 });
            }
          }, 200);
        }}
        style={{
          background: isDarkMode ? 'var(--background)' : 'var(--card)',
          width: '100%',
          height: '100%'
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={background.gap}
          size={background.size}
          className={cn(
            "bg-background transition-all duration-300",
            isDarkMode ? "bg-opacity-40" : "bg-opacity-100"
          )}
        />
        {showControls && (
          <Controls className="bg-card border border-border text-foreground" />
        )}
        
        <DataFlowVisualizer
          flows={activeFlows}
          edges={edges}
          getEdgePoints={getEdgePoints}
          onFlowComplete={handleFlowComplete}
          speed={animationSpeed}
        />
      </ReactFlow>
    </div>
  );
};

/**
 * Wrapped version of StandardFlowVisualizer with ReactFlowProvider
 */
const StandardFlowVisualizerWithProvider: React.FC<StandardFlowVisualizerProps> = (props) => {
  return (
    <ReactFlowProvider>
      <StandardFlowVisualizer {...props} />
    </ReactFlowProvider>
  );
};

export default StandardFlowVisualizerWithProvider;