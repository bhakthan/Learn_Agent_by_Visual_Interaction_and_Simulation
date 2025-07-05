import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { StableFlowContainer } from './StableFlowContainer';

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
  onNodeClick?: (event: React.MouseEvent, node: Node) => void;
  animationSpeed?: number;
  showLabels?: boolean;
  showControls?: boolean;
  autoFitView?: boolean;
  className?: string;
}

export type StandardFlowVisualizerHandle = {
  fitView: () => void;
};

/**
 * StandardFlowVisualizer - A simplified component for visualizing data flows
 */
// Define the component as a standard function first
const StandardFlowVisualizerBase = (
  props: StandardFlowVisualizerProps, 
  ref: React.ForwardedRef<StandardFlowVisualizerHandle>
) => {
  const {
    nodes: initialNodes,
    edges: initialEdges,
    flows = [],
    nodeTypes = defaultNodeTypes,
    onNodesChange,
    onEdgesChange,
    onFlowComplete,
    onNodeClick,
    animationSpeed = 1,
    showLabels = true,
    showControls = true,
    autoFitView = false,
    className
  } = props;
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [nodes, setNodes, onNodeChanges] = useNodesState(initialNodes || []);
  const [edges, setEdges, onEdgeChanges] = useEdgesState(initialEdges || []);
  const reactFlowInstance = useReactFlow();
  
  // Define fitView function using reactFlowInstance that will be exposed via ref
  const fitView = useCallback(() => {
    if (reactFlowInstance) {
      try {
        reactFlowInstance.fitView({
          padding: 0.2,
          includeHiddenNodes: true,
          duration: 800
        });
      } catch (error) {
        console.warn('Error fitting view (suppressed)');
      }
    }
  }, [reactFlowInstance]);

  // Force nodes to have correct defaults
  useEffect(() => {
    // Add default properties to ensure all nodes render correctly
    const processedNodes = initialNodes?.map(node => ({
      ...node,
      style: {
        ...node.style,
        opacity: 1,
        visibility: 'visible' as const,
        transform: 'translateZ(0)',
        willChange: 'transform',
        transition: 'all 0.2s ease-out',
        zIndex: 1,
        position: 'absolute' as const,
        display: 'block',
        boxShadow: '0 0 0 1px var(--border)'
      },
      draggable: node.draggable !== undefined ? node.draggable : true,
      selectable: node.selectable !== undefined ? node.selectable : true,
      // Store original positions to prevent unwanted repositioning
      data: {
        ...node.data,
        originalPosition: node.position
      }
    })) || [];
    
    setNodes(processedNodes);
    
    // Only apply fitView if explicitly enabled
    if (autoFitView) {
      const timer = setTimeout(() => {
        fitView();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [initialNodes, setNodes, fitView]);

  // Track initial layout to prevent position shifting
  const [initialLayout, setInitialLayout] = useState(false);

  // Stabilize initial positions
  useEffect(() => {
    // Only run this if autoFitView is enabled
    if (initialLayout || !autoFitView) {
      setInitialLayout(true); // Mark as initialized to prevent further effects
      return;
    }
    
    // Schedule initial layout stabilization
    const timer = setTimeout(() => {
      // Ensure nodes maintain their positions
      if (reactFlowInstance) {
        try {
          // Capture viewport state
          const viewportInitial = reactFlowInstance.getViewport();
          
          // Apply fit view with smooth animation
          reactFlowInstance.fitView({
            padding: 0.2,
            duration: 800
          });
          
          // Set nodes to be locked in place after initial layout
          setNodes(prevNodes => prevNodes.map(node => ({
            ...node,
            // Mark as positioned to prevent automatic repositioning
            data: {
              ...node.data,
              positioned: true
            },
            // Ensure nodes have stable styles
            style: {
              ...node.style,
              opacity: 1,
              visibility: 'visible',
              position: 'absolute'
            }
          })));
          
          // Mark layout as initialized
          setInitialLayout(true);
        } catch (error) {
          // Silently handle fit view errors
        }
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [reactFlowInstance, setNodes, initialLayout, autoFitView]);

  // Update edges with correct defaults
  useEffect(() => {
    const processedEdges = initialEdges?.map(edge => ({
      ...edge,
      style: {
        ...edge.style,
        opacity: 1,
        visibility: 'visible' as const
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

  // Apply fit view when needed with enhanced error handling and stability
  useEffect(() => {
    // Only run if autoFitView is explicitly enabled
    if (!autoFitView || !reactFlowInstance) return;
    
    // Initial delay for first render
    const safelyFitView = () => {
      try {
        reactFlowInstance.fitView({
          padding: 0.2,
          includeHiddenNodes: true,
          duration: 400
        });
      } catch (error) {
        // Silently handle any errors
        console.warn('Error during fitView (suppressed)');
      }
    };

    // Schedule multiple attempts to ensure visualization works
    const fitViewTimers = [
      setTimeout(safelyFitView, 100),
      setTimeout(safelyFitView, 500),
      setTimeout(safelyFitView, 1000)
    ];
    
    return () => {
      fitViewTimers.forEach(clearTimeout);
    };
  }, [autoFitView, reactFlowInstance, nodes.length, edges.length]);

  // Expose fitView via the ref with enhanced reliability
  React.useImperativeHandle(ref, () => ({
    fitView: () => {
      if (reactFlowInstance) {
        try {
          // Attempt to fit view with more conservative settings to prevent errors
          reactFlowInstance.fitView({
            padding: 0.2,
            includeHiddenNodes: true,
            duration: 400
          });
        } catch (error) {
          console.warn('Error fitting view (suppressed)');
          
          // Try again with a delay as a fallback
          setTimeout(() => {
            try {
              reactFlowInstance.fitView({
                padding: 0.3,
                includeHiddenNodes: true,
                duration: 0 // Skip animation on second attempt
              });
            } catch (e) {
              // Silently ignore any further errors
            }
          }, 200);
        }
      }
    }
  }), [reactFlowInstance]);

  return (
    <div 
      className={cn(
        "w-full h-full rounded-md overflow-hidden", 
        className
      )}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={(changes) => {
          // Filter out position changes that might be coming from automatic layout
          // but allow user-initiated drags
          const filteredChanges = changes.filter(change => {
            if (change.type === 'position' && !change.dragging) {
              // Prevent automatic repositioning
              return false;
            }
            return true;
          });
          
          onNodeChanges(filteredChanges);
          if (onNodesChange) onNodesChange(nodes);
        }}
        onEdgesChange={(changes) => {
          onEdgeChanges(changes);
          if (onEdgesChange) onEdgesChange(edges);
        }}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView={autoFitView}
        fitViewOptions={{ padding: 0.2, duration: 800 }}
        minZoom={0.5}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        panOnScroll={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
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
            flows={flows.map(flow => ({
              ...flow,
              timestamp: Date.now() // Add missing timestamp property
            }))}
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

// Create the forwarded ref component
export const StandardFlowVisualizer = React.forwardRef<
  StandardFlowVisualizerHandle, 
  StandardFlowVisualizerProps
>(StandardFlowVisualizerBase);

/**
 * Wrapped version of StandardFlowVisualizer with ReactFlowProvider and StableFlowContainer
 * This is the recommended way to use this component for improved stability
 */
const StandardFlowVisualizerWithProvider: React.FC<StandardFlowVisualizerProps> = (props) => {
  // Create ref to access the child component
  const visualizerRef = useRef<StandardFlowVisualizerHandle | null>(null);
  
  // Expose fitView method
  const fitView = useCallback(() => {
    if (visualizerRef.current) {
      visualizerRef.current.fitView();
    }
  }, []);

  // Extend the component with fitView method
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore - Attach the fitView method to the component instance
      StandardFlowVisualizerWithProvider.fitView = fitView;
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        // @ts-ignore - Clean up
        delete StandardFlowVisualizerWithProvider.fitView;
      }
    };
  }, [fitView]);

  return (
    <ReactFlowProvider>
      <StableFlowContainer minHeight="300px">
        <StandardFlowVisualizer 
          {...props} 
          // @ts-ignore - Add ref to access internal methods
          ref={visualizerRef}
        />
      </StableFlowContainer>
    </ReactFlowProvider>
  );
};

// Add fitView as a static method
// @ts-ignore - Add static method
StandardFlowVisualizerWithProvider.fitView = () => {
  // Default implementation
  console.warn('fitView not initialized yet');
};

export default StandardFlowVisualizerWithProvider;