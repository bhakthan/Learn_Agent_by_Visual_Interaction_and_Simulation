import React, { useState, useEffect, useRef, forwardRef } from 'react';
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
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme/ThemeProvider';
import { optimizeNodes, optimizeEdges, applyDomFixes } from '@/lib/utils/reactFlowOptimization';
import DataFlowVisualizer from './DataFlowVisualizer';
import { Card } from '@/components/ui/card';

// Define data flow message interface with standardized properties
export interface FlowMessage {
  id: string;
  edgeId: string;
  source: string;
  target: string;
  content: string;
  type: string;
  progress: number;
  label?: string;
  complete?: boolean;
}

export interface OptimizedFlowProps {
  nodes: Node[];
  edges: Edge[];
  flows?: FlowMessage[];
  nodeTypes?: NodeTypes;
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  onFlowComplete?: (flowId: string) => void;
  animationSpeed?: number;
  showLabels?: boolean;
  showControls?: boolean;
  showMinimap?: boolean;
  autoFitView?: boolean;
  className?: string;
  style?: React.CSSProperties;
  minHeight?: string | number;
  contentClassName?: string;
  title?: string;
  description?: string;
}

/**
 * OptimizedFlowContent - Internal component with ReactFlow context
 */
const OptimizedFlowContent = forwardRef<HTMLDivElement, OptimizedFlowProps>(({
  nodes: initialNodes,
  edges: initialEdges,
  flows = [],
  nodeTypes = {},
  onNodesChange,
  onEdgesChange,
  onFlowComplete,
  animationSpeed = 1,
  showLabels = true,
  showControls = true,
  showMinimap = false,
  autoFitView = true,
  className,
  contentClassName,
}, ref) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [nodes, setNodes, onNodeChanges] = useNodesState(optimizeNodes(initialNodes || []));
  const [edges, setEdges, onEdgeChanges] = useEdgesState(optimizeEdges(initialEdges || []));
  const reactFlowInstance = useReactFlow();
  const containerRef = useRef<HTMLDivElement>(null);

  // Forward ref to container div
  const refToUse = ref || containerRef;
  
  // Initialize optimized nodes and edges
  useEffect(() => {
    setNodes(optimizeNodes(initialNodes || []));
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(optimizeEdges(initialEdges || []));
  }, [initialEdges, setEdges]);

  // Apply stability optimizations
  useEffect(() => {
    // Apply DOM fixes for ReactFlow elements
    const applyStabilityFixes = () => {
      if (containerRef.current) {
        applyDomFixes(containerRef.current);
      }
    };
    
    // Apply fixes multiple times with increasing delays
    const timers = [
      setTimeout(applyStabilityFixes, 100),
      setTimeout(applyStabilityFixes, 500),
      setTimeout(applyStabilityFixes, 1000),
    ];
    
    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  // Apply fit view when needed
  useEffect(() => {
    if (autoFitView && reactFlowInstance) {
      const timer = setTimeout(() => {
        try {
          reactFlowInstance.fitView({
            padding: 0.2,
            includeHiddenNodes: true,
            duration: 200
          });
        } catch (error) {
          console.debug('Error fitting view (suppressed)');
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [autoFitView, reactFlowInstance, nodes.length]);

  // Get edge points for data flow visualization
  const getEdgePoints = React.useCallback((edgeId: string) => {
    if (!edges || !nodes) return null;
    
    const edge = edges.find(e => e.id === edgeId);
    if (!edge) return null;
    
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    
    if (!sourceNode || !targetNode) return null;
    
    // Default dimensions if not specified
    const nodeWidth = sourceNode.width || 150;
    const nodeHeight = sourceNode.height || 40;
    
    // Calculate center of source node for flow start
    const sourceX = sourceNode.position.x + nodeWidth / 2;
    const sourceY = sourceNode.position.y + nodeHeight / 2;
    
    // Calculate center of target node for flow end
    const targetX = targetNode.position.x + nodeWidth / 2;
    const targetY = targetNode.position.y + nodeHeight / 2;
    
    return { sourceX, sourceY, targetX, targetY };
  }, [edges, nodes]);

  return (
    <div 
      ref={refToUse as React.RefObject<HTMLDivElement>}
      className={cn(
        "w-full h-full rounded-md overflow-hidden", 
        contentClassName
      )}
      style={{
        transform: 'translateZ(0)',
        position: 'relative',
        contain: 'layout',
        minHeight: '300px'
      }}
      data-flow-container="true"
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
        
        {flows && flows.length > 0 && (
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

OptimizedFlowContent.displayName = 'OptimizedFlowContent';

/**
 * OptimizedFlowContainer - A highly optimized ReactFlow container
 * that maintains consistent behavior across the application
 */
export const OptimizedFlowContainer = forwardRef<HTMLDivElement, OptimizedFlowProps>(({
  className,
  style = {},
  minHeight = '300px',
  title,
  description,
  ...props
}, ref) => {
  // Container ref
  const containerRef = useRef<HTMLDivElement>(null);
  const mergedRef = ref || containerRef;
  
  // Container style
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    minHeight,
    height: style.height || '400px',
    width: '100%',
    overflow: 'hidden',
    // Force hardware acceleration
    transform: 'translateZ(0)', 
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    contain: 'layout',
    ...style
  };

  // If title or description are provided, use Card component
  if (title || description) {
    return (
      <Card className={cn("w-full overflow-hidden", className)}>
        {(title || description) && (
          <div className="px-6 py-4 border-b border-border">
            {title && <h3 className="text-lg font-medium">{title}</h3>}
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          </div>
        )}
        <div 
          ref={mergedRef as React.RefObject<HTMLDivElement>}
          className="w-full optimized-flow-container"
          style={containerStyle}
        >
          <ReactFlowProvider>
            <OptimizedFlowContent ref={mergedRef} {...props} />
          </ReactFlowProvider>
        </div>
      </Card>
    );
  }

  // Otherwise, render the flow container directly
  return (
    <div 
      ref={mergedRef as React.RefObject<HTMLDivElement>}
      className={cn("optimized-flow-container", className)}
      style={containerStyle}
    >
      <ReactFlowProvider>
        <OptimizedFlowContent ref={mergedRef} {...props} />
      </ReactFlowProvider>
    </div>
  );
});

OptimizedFlowContainer.displayName = 'OptimizedFlowContainer';

export default OptimizedFlowContainer;