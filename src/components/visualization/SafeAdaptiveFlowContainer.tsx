import React, { forwardRef, useCallback, useState, useEffect, useRef } from 'react';
import ReactFlow, { 
  ReactFlowProvider, 
  Background, 
  Controls,
  Node, 
  Edge,
  ConnectionLineType,
  Panel,
  useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { Expand, ShrinkSelection } from '@phosphor-icons/react';
import { useTheme } from '@/components/theme/ThemeProvider';
import { useFlowContainer } from '@/lib/hooks/useFlowContainer';
import { 
  calculateAdaptivePositions,
  optimizeEdgePaths,
  calculateOptimalViewport
} from '@/lib/utils/adaptiveNodePositioning';

// Create a component that uses ReactFlow hooks safely inside the ReactFlowProvider
const AdaptiveFlowContainerInner = forwardRef<
  HTMLDivElement, 
  Omit<AdaptiveFlowContainerProps, 'nodes' | 'edges'> & {
    initialNodes: Node[];
    initialEdges: Edge[];
  }
>(({
  initialNodes,
  initialEdges,
  nodeTypes = {},
  edgeTypes = {},
  className = '',
  style = {},
  minHeight = '300px',
  children,
  hideControls = false,
  hideBackground = false,
  isDraggable = true,
  hideAttribution = false,
  fitViewOnInit = true,
  fitViewOnResize = true,
  connectionLineType = ConnectionLineType.SmoothStep,
  connectionLineStyle,
  defaultEdgeOptions
}, ref) => {
  const { theme } = useTheme();
  const [isReady, setIsReady] = useState(false);
  
  // Use ReactFlow hooks safely inside the provider
  const { fitView, setViewport, getNodes, getEdges, setNodes, setEdges } = useReactFlow();

  // Container ref for measuring
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use our flow container hook for better resize handling
  const { containerSize, triggerResize } = useFlowContainer(containerRef);
  
  // State for nodes and edges
  const [localNodes, setLocalNodes] = useState<Node[]>(initialNodes);
  const [localEdges, setLocalEdges] = useState<Edge[]>(initialEdges);
  
  // Layout manager state
  const layoutManagerRef = useRef<{
    originalLayout: { nodes: Node[]; edges: Edge[] } | null;
    currentLayout: { nodes: Node[]; edges: Edge[] } | null;
  }>({
    originalLayout: null,
    currentLayout: null
  });
  
  // Initialize layout manager
  useEffect(() => {
    const manager = layoutManagerRef.current;
    if (!manager.originalLayout && initialNodes.length > 0) {
      manager.originalLayout = {
        nodes: JSON.parse(JSON.stringify(initialNodes)),
        edges: JSON.parse(JSON.stringify(initialEdges))
      };
      manager.currentLayout = {
        nodes: JSON.parse(JSON.stringify(initialNodes)),
        edges: JSON.parse(JSON.stringify(initialEdges))
      };
    }
  }, [initialNodes, initialEdges]);
  
  // Function to optimize layout
  const optimizeLayout = useCallback(() => {
    if (containerSize.width === 0 || containerSize.height === 0) return;
    const manager = layoutManagerRef.current;
    if (!manager.currentLayout) return;
    
    const { nodes, edges } = manager.currentLayout;
    
    // Adapt positions based on container size
    const adaptedNodes = calculateAdaptivePositions(
      nodes,
      containerSize.width,
      containerSize.height,
      {
        padding: 50,
        spacing: 150,
        preserveRelativePositions: true
      }
    );
    
    // Optimize edge paths
    const adaptedEdges = optimizeEdgePaths(adaptedNodes, edges, { avoidOverlap: true });
    
    // Update layout
    manager.currentLayout = { nodes: adaptedNodes, edges: adaptedEdges };
    
    // Apply to ReactFlow
    setNodes(adaptedNodes);
    setEdges(adaptedEdges);
  }, [containerSize, setNodes, setEdges]);
  
  // Function to reset layout
  const resetLayout = useCallback(() => {
    const manager = layoutManagerRef.current;
    if (!manager.originalLayout) return;
    
    const resetNodes = JSON.parse(JSON.stringify(manager.originalLayout.nodes));
    const resetEdges = JSON.parse(JSON.stringify(manager.originalLayout.edges));
    
    manager.currentLayout = { 
      nodes: resetNodes,
      edges: resetEdges
    };
    
    setNodes(resetNodes);
    setEdges(resetEdges);
    
    // Fit view after reset
    setTimeout(() => {
      fitView({ padding: 0.2, includeHiddenNodes: true });
    }, 50);
  }, [setNodes, setEdges, fitView]);
  
  // Function to optimize viewport
  const optimizeViewport = useCallback(() => {
    if (!fitViewOnResize || containerSize.width === 0 || containerSize.height === 0) return;
    
    const nodes = getNodes();
    if (nodes.length === 0) return;
    
    // Calculate optimal viewport
    const viewport = calculateOptimalViewport(nodes, containerSize.width, containerSize.height, {
      padding: 50,
      minZoom: 0.5,
      maxZoom: 2
    });
    
    // Apply viewport
    setViewport(viewport);
  }, [containerSize, getNodes, setViewport, fitViewOnResize]);
  
  // Apply adaptive layout on resize
  useEffect(() => {
    if (containerSize.width === 0 || containerSize.height === 0) return;
    
    const timer = setTimeout(() => {
      optimizeLayout();
      
      // After layout is optimized, update viewport if needed
      if (fitViewOnResize) {
        setTimeout(optimizeViewport, 50);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [containerSize, optimizeLayout, optimizeViewport, fitViewOnResize]);
  
  // Apply initial optimizations
  useEffect(() => {
    if (!isReady) return;
    
    const timer = setTimeout(() => {
      optimizeLayout();
      
      if (fitViewOnInit) {
        setTimeout(() => {
          try {
            fitView({
              padding: 0.2,
              includeHiddenNodes: true
            });
          } catch (error) {
            console.debug('Failed to fit view (suppressed)');
          }
        }, 100);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [isReady, optimizeLayout, fitView, fitViewOnInit]);
  
  // Mark as ready after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Prevent ResizeObserver loop errors
  useEffect(() => {
    const originalError = console.error;
    
    // Override console.error to suppress ReactFlow ResizeObserver errors
    console.error = (...args) => {
      if (
        typeof args[0] === 'string' && 
        (args[0].includes('ResizeObserver') || args[0].includes('Maximum update depth'))
      ) {
        return;
      }
      originalError(...args);
    };
    
    return () => {
      console.error = originalError;
    };
  }, []);
  
  // Container style
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    minHeight,
    height: style.height || '400px',
    width: '100%',
    overflow: 'hidden',
    // Apply stability styles
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    contain: 'layout',
    ...style
  };
  
  // Edge options
  const edgeOptions = {
    animated: false,
    type: 'smoothstep',
    style: { 
      strokeWidth: 2,
      stroke: theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : undefined 
    },
    ...defaultEdgeOptions
  };
  
  // Combine refs
  const combinedRef = (element: HTMLDivElement) => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(element);
      } else {
        ref.current = element;
      }
    }
    if (containerRef.current !== element) {
      containerRef.current = element;
      if (element) {
        triggerResize();
      }
    }
  };
  
  return (
    <div 
      ref={combinedRef}
      className={`adaptive-flow-container ${className}`}
      style={containerStyle}
      data-flow-container="true"
    >
      <ReactFlow
        nodes={localNodes}
        edges={localEdges}
        onNodesChange={(changes) => {
          setLocalNodes((nds) => {
            const updatedNodes = [...nds];
            changes.forEach((change: any) => {
              if (change.type === 'position' && change.id) {
                const nodeIndex = updatedNodes.findIndex(node => node.id === change.id);
                if (nodeIndex !== -1 && change.position) {
                  updatedNodes[nodeIndex] = {
                    ...updatedNodes[nodeIndex],
                    position: change.position
                  };
                }
              }
            });
            return updatedNodes;
          });
        }}
        onEdgesChange={(changes) => {
          setLocalEdges((eds) => {
            const updatedEdges = [...eds];
            changes.forEach((change: any) => {
              if (change.id) {
                const edgeIndex = updatedEdges.findIndex(edge => edge.id === change.id);
                if (edgeIndex !== -1) {
                  updatedEdges[edgeIndex] = {
                    ...updatedEdges[edgeIndex],
                    ...change
                  };
                }
              }
            });
            return updatedEdges;
          });
        }}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        proOptions={{ hideAttribution }}
        defaultEdgeOptions={edgeOptions}
        connectionLineType={connectionLineType}
        connectionLineStyle={connectionLineStyle || edgeOptions.style}
        nodesDraggable={isDraggable}
        fitView={false} // We manage fit view ourselves
        attributionPosition="bottom-right"
        className={`adaptive-flow ${isReady ? 'flow-ready' : 'flow-initializing'}`}
      >
        {!hideBackground && (
          <Background 
            color={theme === 'dark' ? '#ffffff20' : '#00000010'} 
            gap={20} 
            size={1}
          />
        )}
        
        {!hideControls && <Controls />}
        
        <Panel position="top-right" className="adaptive-flow-controls">
          <div className="flex gap-1">
            <Button 
              size="icon" 
              variant="outline" 
              className="h-8 w-8"
              onClick={() => optimizeViewport()}
              title="Fit View"
            >
              <Expand size={16} />
            </Button>
            <Button 
              size="icon" 
              variant="outline" 
              className="h-8 w-8"
              onClick={() => resetLayout()}
              title="Reset Layout"
            >
              <ShrinkSelection size={16} />
            </Button>
          </div>
        </Panel>
        
        {children}
      </ReactFlow>
    </div>
  );
});

AdaptiveFlowContainerInner.displayName = 'AdaptiveFlowContainerInner';

export interface AdaptiveFlowContainerProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  nodeTypes?: Record<string, React.ComponentType<any>>;
  edgeTypes?: Record<string, React.ComponentType<any>>;
  className?: string;
  style?: React.CSSProperties;
  minHeight?: string | number;
  children?: React.ReactNode;
  hideControls?: boolean;
  hideBackground?: boolean;
  isDraggable?: boolean;
  hideAttribution?: boolean;
  fitViewOnInit?: boolean;
  fitViewOnResize?: boolean;
  connectionLineType?: ConnectionLineType;
  connectionLineStyle?: React.CSSProperties;
  defaultEdgeOptions?: any;
}

/**
 * A React Flow container with adaptive node positioning
 * Uses a wrapper pattern to ensure hooks are used correctly
 */
export const SafeAdaptiveFlowContainer: React.FC<AdaptiveFlowContainerProps> = (props) => {
  return (
    <ReactFlowProvider>
      <AdaptiveFlowContainerInner 
        initialNodes={props.nodes} 
        initialEdges={props.edges}
        {...props} 
      />
    </ReactFlowProvider>
  );
};

export default SafeAdaptiveFlowContainer;