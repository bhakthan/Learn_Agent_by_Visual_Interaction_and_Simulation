import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
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
  useReactFlow,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { AgentNode } from './node-types/AgentNode';
import DataFlowVisualizer from './DataFlowVisualizer';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme/ThemeProvider';
import { useStableFlow } from '@/lib/hooks/useStableFlow';
import { applyNodeStyling, applyEdgeAnimations } from '@/lib/utils/visualizationUtils';
import { getStandardNodeStyle, getStandardEdgeStyle } from '@/lib/utils/standardNodeUtils';

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

interface EnhancedStandardFlowVisualizerProps {
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
 * EnhancedStandardFlowVisualizer - An improved component for visualizing data flows with better stability
 */
export const EnhancedStandardFlowVisualizer: React.FC<EnhancedStandardFlowVisualizerProps> = memo(({
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
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Enhanced nodes with consistent styling
  const enhancedInitialNodes = initialNodes.map(node => {
    const nodeType = node.data?.nodeType || 'default';
    return {
      ...node,
      style: {
        ...getStandardNodeStyle(nodeType, isDarkMode ? 'dark' : 'light'),
        ...(node.style || {})
      },
      // Add standard class name based on node type
      className: `node-${nodeType} ${node.className || ''}`,
      // Ensure nodes are visible
      hidden: false
    };
  });
  
  // Enhanced edges with consistent styling
  const enhancedInitialEdges = initialEdges.map(edge => {
    // Extract type from className or default to "default"
    const edgeType = edge.className?.replace('edge-', '') || 'default';
    
    return {
      ...edge,
      // Apply standard edge styling
      style: {
        ...getStandardEdgeStyle(edgeType, isDarkMode ? 'dark' : 'light', edge.animated),
        ...(edge.style || {})
      },
      // Standardize markers
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: getStandardEdgeStyle(edgeType, isDarkMode ? 'dark' : 'light', edge.animated).stroke,
        width: 15,
        height: 15
      }
    };
  });

  const [nodes, setNodes, onNodeChanges] = useNodesState(enhancedInitialNodes);
  const [edges, setEdges, onEdgeChanges] = useEdgesState(enhancedInitialEdges);
  const reactFlowInstance = useReactFlow();
  
  // Use our stable flow utility to ensure proper rendering
  const { resetFlow, fitView } = useStableFlow(containerRef);
  
  // Apply theme-based styling when theme changes
  useEffect(() => {
    // Update node styling based on theme
    setNodes(prevNodes => 
      prevNodes.map(node => {
        const nodeType = node.data?.nodeType || 'default';
        return {
          ...node,
          style: {
            ...getStandardNodeStyle(nodeType, isDarkMode ? 'dark' : 'light'),
            ...(node.style || {})
          }
        };
      })
    );
    
    // Update edge styling based on theme
    setEdges(prevEdges => 
      prevEdges.map(edge => {
        const edgeType = edge.className?.replace('edge-', '') || 'default';
        return {
          ...edge,
          style: {
            ...getStandardEdgeStyle(edgeType, isDarkMode ? 'dark' : 'light', edge.animated),
            ...(edge.style || {})
          },
          markerEnd: edge.markerEnd ? {
            ...edge.markerEnd,
            color: getStandardEdgeStyle(edgeType, isDarkMode ? 'dark' : 'light', edge.animated).stroke
          } : undefined
        };
      })
    );
  }, [theme, isDarkMode, setNodes, setEdges]);

  // Ensure everything is visible on initial render
  useEffect(() => {
    // Reset flow to fix any rendering issues
    resetFlow();
    
    // Fit view after a short delay
    if (autoFitView) {
      setTimeout(() => {
        fitView();
      }, 300);
    }
  }, [resetFlow, fitView, autoFitView]);

  // Get edge points for data flow visualization with additional safety checks
  const getEdgePoints = useCallback((edgeId: string) => {
    if (!edges || !nodes) return null;
    
    const edge = edges.find(e => e.id === edgeId);
    if (!edge) return null;
    
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    
    if (!sourceNode || !targetNode) return null;
    
    // Default dimensions if not specified
    const sourceWidth = (sourceNode.width || 150);
    const sourceHeight = (sourceNode.height || 40);
    const targetWidth = (targetNode.width || 150);
    const targetHeight = (targetNode.height || 40);
    
    // Calculate center of source node for flow start
    const sourceX = sourceNode.position.x + sourceWidth / 2;
    const sourceY = sourceNode.position.y + sourceHeight / 2;
    
    // Calculate center of target node for flow end
    const targetX = targetNode.position.x + targetWidth / 2;
    const targetY = targetNode.position.y + targetHeight / 2;
    
    return { sourceX, sourceY, targetX, targetY };
  }, [edges, nodes]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "w-full h-full border border-border rounded-md overflow-hidden optimized-flow-container", 
        className
      )}
      style={{
        transform: 'translateZ(0)',
        position: 'relative',
        contain: 'layout',
        minHeight: '300px',
        visibility: 'visible'
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
        fitView={false} // We handle this manually for better control
        minZoom={0.5}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        style={{
          background: isDarkMode ? 'var(--background)' : 'var(--card)',
          width: '100%',
          height: '100%'
        }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={true}
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
});

/**
 * Wrapped version of EnhancedStandardFlowVisualizer with ReactFlowProvider
 * This is the recommended way to use this component
 */
const EnhancedStandardFlowVisualizerWithProvider: React.FC<EnhancedStandardFlowVisualizerProps> = (props) => {
  return (
    <ReactFlowProvider>
      <EnhancedStandardFlowVisualizer {...props} />
    </ReactFlowProvider>
  );
};

export default EnhancedStandardFlowVisualizerWithProvider;