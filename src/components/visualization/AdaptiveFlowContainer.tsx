import React, { forwardRef, useCallback, useState, useEffect } from 'react';
import ReactFlow, { 
  ReactFlowProvider, 
  Background, 
  Controls,
  Node, 
  Edge,
  ConnectionLineType,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useAdaptiveFlow } from '@/lib/hooks/useAdaptiveFlow';
import { Button } from '@/components/ui/button';
import { Expand, ShrinkSelection } from '@phosphor-icons/react';
import { useTheme } from '@/components/theme/ThemeProvider';

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
 * Automatically adjusts layout to prevent common rendering issues
 */
export const AdaptiveFlowContainer = forwardRef<HTMLDivElement, AdaptiveFlowContainerProps>(
  ({
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
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
    
    // State to manage locally if needed
    const [localNodes, setLocalNodes] = useState<Node[]>(nodes);
    const [localEdges, setLocalEdges] = useState<Edge[]>(edges);
    
    // Update local nodes/edges when props change
    useEffect(() => {
      setLocalNodes(nodes);
    }, [nodes]);
    
    useEffect(() => {
      setLocalEdges(edges);
    }, [edges]);
    
    // Setup useAdaptiveFlow hook
    const { 
      containerRef, 
      optimizeLayout,
      resetLayout,
      optimizeViewport
    } = useAdaptiveFlow({
      fitViewOnInit,
      fitViewOnResize,
      fitViewPadding: 0.2,
      stabilizationDelay: 300
    });
    
    // Combine refs
    const combinedRef = (element: HTMLDivElement) => {
      if (ref) {
        if (typeof ref === 'function') {
          ref(element);
        } else {
          ref.current = element;
        }
      }
      if (containerRef) {
        containerRef.current = element;
      }
    };
    
    // Handle node changes
    const handleNodesChange = useCallback((changes: any) => {
      // Apply changes locally
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
        
        // Notify parent if callback provided
        if (onNodesChange) {
          onNodesChange(updatedNodes);
        }
        
        return updatedNodes;
      });
    }, [onNodesChange]);
    
    // Handle edge changes
    const handleEdgesChange = useCallback((changes: any) => {
      // Apply changes locally
      setLocalEdges((eds) => {
        const updatedEdges = [...eds];
        changes.forEach((change: any) => {
          // Apply edge changes
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
        
        // Notify parent if callback provided
        if (onEdgesChange) {
          onEdgesChange(updatedEdges);
        }
        
        return updatedEdges;
      });
    }, [onEdgesChange]);
    
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
    
    // Mark container as ready after a delay
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
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
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
  }
);

AdaptiveFlowContainer.displayName = 'AdaptiveFlowContainer';

/**
 * A wrapper that includes ReactFlowProvider
 */
export const AdaptiveFlowProvider: React.FC<AdaptiveFlowContainerProps> = (props) => {
  return (
    <ReactFlowProvider>
      <AdaptiveFlowContainer {...props} />
    </ReactFlowProvider>
  );
};

export default AdaptiveFlowProvider;