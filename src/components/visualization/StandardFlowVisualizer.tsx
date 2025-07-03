import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Controls,
  Background,
  BackgroundVariant,
  Node,
  Edge,
  NodeTypes,
  useNodesState,
  useEdgesState,
  useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';
import { AgentNode } from './node-types/AgentNode';
import DataFlowVisualizer from './DataFlowVisualizer';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme/ThemeProvider';

// Standard node types
const defaultNodeTypes: NodeTypes = {
  agent: AgentNode,
};

// Define data flow types
export type DataFlowType = 
  'query' | 'response' | 'tool_call' | 'observation' | 
  'reflection' | 'plan' | 'message' | 'data' | 'error';

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
  onNodesChange?: (nodes: any) => void;
  onEdgesChange?: (edges: any) => void;
  onFlowComplete?: (flowId: string) => void;
  animationSpeed?: number;
  showLabels?: boolean;
  showControls?: boolean;
  autoFitView?: boolean;
  className?: string;
}

/**
 * StandardFlowVisualizer - A simplified component for visualizing data flows
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
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [nodes, setNodes, onNodeChanges] = useNodesState(initialNodes || []);
  const [edges, setEdges, onEdgeChanges] = useEdgesState(initialEdges || []);
  const reactFlowInstance = useReactFlow();

  // Force nodes to have correct defaults
  useEffect(() => {
    // Add default properties to ensure all nodes render correctly
    const processedNodes = initialNodes?.map(node => ({
      ...node,
      style: {
        ...node.style,
        opacity: 1,
        visibility: 'visible',
        transform: 'translateZ(0)'
      },
      draggable: node.draggable !== undefined ? node.draggable : true,
      selectable: node.selectable !== undefined ? node.selectable : true
    })) || [];
    
    setNodes(processedNodes);
  }, [initialNodes, setNodes]);

  // Update edges with correct defaults
  useEffect(() => {
    const processedEdges = initialEdges?.map(edge => ({
      ...edge,
      style: {
        ...edge.style,
        opacity: 1,
        visibility: 'visible'
      }
    })) || [];
    
    setEdges(processedEdges);
  }, [initialEdges, setEdges]);

  // Get edge points for data flow visualization - with more safety checks
  const getEdgePoints = useCallback((edgeId: string) => {
    if (!edges || !nodes) return null;
    
    const edge = edges.find(e => e.id === edgeId);
    if (!edge) return null;
    
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    
    if (!sourceNode || !targetNode) return null;
    
    // Default dimensions if not specified
    const nodeWidth = 150;
    const nodeHeight = 40;
    
    // Calculate center of source node for flow start
    const sourceX = sourceNode.position.x + nodeWidth / 2;
    const sourceY = sourceNode.position.y + nodeHeight / 2;
    
    // Calculate center of target node for flow end
    const targetX = targetNode.position.x + nodeWidth / 2;
    const targetY = targetNode.position.y + nodeHeight / 2;
    
    return { sourceX, sourceY, targetX, targetY };
  }, [edges, nodes]);

  // Apply fit view when needed
  useEffect(() => {
    if (autoFitView && reactFlowInstance) {
      const timer = setTimeout(() => {
        try {
          reactFlowInstance.fitView({
            padding: 0.2,
            includeHiddenNodes: true
          });
        } catch (error) {
          console.warn('Error fitting view (suppressed)');
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [autoFitView, reactFlowInstance]);

  return (
    <div 
      className={cn(
        "w-full h-full border border-border rounded-md overflow-hidden", 
        className
      )}
      style={{
        transform: 'translateZ(0)',
        position: 'relative',
        contain: 'layout',
        minHeight: '300px'
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={(changes) => {
          onNodeChanges(changes);
          if (onNodesChange) onNodesChange(nodes);
        }}
        onEdgesChange={(changes) => {
          onEdgeChanges(changes);
          if (onEdgesChange) onEdgesChange(edges);
        }}
        nodeTypes={nodeTypes}
        fitView={true}
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.5}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        style={{
          background: isDarkMode ? 'var(--background)' : 'var(--card)',
          width: '100%',
          height: '100%'
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={12}
          size={1}
          className={cn(
            "bg-background transition-all duration-300",
            isDarkMode ? "bg-opacity-40" : "bg-opacity-100"
          )}
        />
        
        {showControls && (
          <Controls className="bg-card border border-border text-foreground" />
        )}
        
        {flows.length > 0 && (
          <DataFlowVisualizer
            flows={flows}
            edges={edges}
            getEdgePoints={getEdgePoints}
            onFlowComplete={onFlowComplete}
            speed={animationSpeed}
          />
        )}
      </ReactFlow>
    </div>
  );
};

/**
 * Wrapped version of StandardFlowVisualizer with ReactFlowProvider
 * This is the recommended way to use this component
 */
const StandardFlowVisualizerWithProvider: React.FC<StandardFlowVisualizerProps> = (props) => {
  return (
    <ReactFlowProvider>
      <StandardFlowVisualizer {...props} />
    </ReactFlowProvider>
  );
};

export default StandardFlowVisualizerWithProvider;