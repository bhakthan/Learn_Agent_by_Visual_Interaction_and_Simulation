import { useState, useCallback, useRef, useEffect } from 'react'
import ReactFlow, { 
  Background, 
  Controls,
  MiniMap,
  Node, 
  Edge,
  Panel,
  Handle,
  Position,
  NodeTypes,
  useNodesState,
  useEdgesState,
  useReactFlow,
  getNodesBounds,
  ReactFlowInstance,
  ReactFlowProvider
} from 'reactflow'
import 'reactflow/dist/style.css'
import { PatternData } from '@/lib/data/patterns'
import { patternContents } from '@/lib/data/patternContent'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Play, Stop, ArrowsCounterClockwise } from '@phosphor-icons/react'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import { createDataFlow } from '@/lib/utils/dataFlowUtils'
import DataFlowVisualizer from './DataFlowVisualizer'

interface PatternVisualizerProps {
  patternData: PatternData
}

// Types for data flow visualization
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
}

// Custom node types
const CustomNode = ({ data, id }: { data: any, id: string }) => {
  const getNodeStyle = () => {
    const baseStyle = {
      padding: '10px 20px',
      borderRadius: '8px',
      transition: 'all 0.2s ease',
    }
    
    // Add active state styles if the node is active
    const isActive = data.isActive;
    const activeStyle = isActive ? {
      boxShadow: '0 0 0 2px var(--primary), 0 0 15px rgba(66, 153, 225, 0.5)',
      transform: 'scale(1.02)'
    } : {};
    
    switch(data.nodeType) {
      case 'input':
        return { ...baseStyle, backgroundColor: 'rgb(226, 232, 240)', border: '1px solid rgb(203, 213, 225)', ...activeStyle }
      case 'llm':
        return { ...baseStyle, backgroundColor: 'rgb(219, 234, 254)', border: '1px solid rgb(147, 197, 253)', ...activeStyle }
      case 'output':
        return { ...baseStyle, backgroundColor: 'rgb(220, 252, 231)', border: '1px solid rgb(134, 239, 172)', ...activeStyle }
      case 'router':
        return { ...baseStyle, backgroundColor: 'rgb(254, 242, 220)', border: '1px solid rgb(253, 224, 71)', ...activeStyle }
      case 'aggregator':
        return { ...baseStyle, backgroundColor: 'rgb(240, 253, 240)', border: '1px solid rgb(187, 247, 208)', ...activeStyle }
      case 'evaluator':
        return { ...baseStyle, backgroundColor: 'rgb(237, 233, 254)', border: '1px solid rgb(196, 181, 253)', ...activeStyle }
      case 'tool':
        return { ...baseStyle, backgroundColor: 'rgb(254, 226, 226)', border: '1px solid rgb(252, 165, 165)', ...activeStyle }
      case 'planner':
        return { ...baseStyle, backgroundColor: 'rgb(224, 242, 254)', border: '1px solid rgb(125, 211, 252)', ...activeStyle }
      case 'executor':
        return { ...baseStyle, backgroundColor: 'rgb(243, 232, 255)', border: '1px solid rgb(216, 180, 254)', ...activeStyle }
      default:
        return { ...baseStyle, backgroundColor: 'white', border: '1px solid rgb(226, 232, 240)', ...activeStyle }
    }
  }
  
  return (
    <div style={getNodeStyle()}>
      <Handle type="target" position={Position.Left} />
      <div>
        <strong>{data.label}</strong>
        {data.description && <div style={{ fontSize: '12px' }}>{data.description}</div>}
        {data.status && (
          <div className="mt-1 text-xs px-2 py-1 rounded" style={{
            backgroundColor: 
              data.status === 'processing' ? 'rgba(59, 130, 246, 0.2)' : 
              data.status === 'success' ? 'rgba(16, 185, 129, 0.2)' : 
              data.status === 'error' ? 'rgba(239, 68, 68, 0.2)' : 
              'transparent',
            color: 
              data.status === 'processing' ? 'rgb(59, 130, 246)' : 
              data.status === 'success' ? 'rgb(16, 185, 129)' : 
              data.status === 'error' ? 'rgb(239, 68, 68)' : 
              'inherit'
          }}>
            {data.status === 'processing' ? 'Processing...' : 
             data.status === 'success' ? 'Complete' : 
             data.status === 'error' ? 'Error' : ''}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  )
}

const nodeTypes: NodeTypes = {
  input: CustomNode,
  default: CustomNode,
  output: CustomNode
}

const messageTemplates = {
  input: (text: string) => `User input: "${text}"`,
  llm: (text: string) => `Processing with AI: "${text}"`,
  router: () => "Routing decision being made...",
  aggregator: () => "Combining results from multiple sources...",
  tool: (tool: string) => `Using tool: ${tool || 'External API'}`,
  output: (text: string) => `Final result: "${text}"`,
  error: () => "Error occurred during processing"
};

const PatternVisualizer = ({ patternData }: PatternVisualizerProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(patternData.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(patternData.edges)
  const [dataFlows, setDataFlows] = useState<DataFlow[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const flowInstanceRef = useRef<ReactFlowInstance | null>(null)
  const simulationRef = useRef<NodeJS.Timeout | null>(null)
  const reactFlowInstance = useReactFlow()
  
  // Reset flow and nodes when pattern changes
  useEffect(() => {
    resetVisualization();
  }, [patternData]);
  
  const resetVisualization = () => {
    if (simulationRef.current) {
      clearTimeout(simulationRef.current);
    }
    setIsAnimating(false);
    setDataFlows([]);
    
    // Reset all nodes (remove active state and status)
    setNodes(nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        isActive: false,
        status: null
      }
    })));
    
    // Reset edges (remove animation)
    setEdges(patternData.edges.map(edge => ({
      ...edge,
      animated: false
    })));
  };
  
  const getEdgePoints = useCallback((edgeId: string) => {
    const edge = edges.find(e => e.id === edgeId);
    if (!edge) return null;
    
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    
    if (!sourceNode || !targetNode) return null;
    
    // Calculate center points of nodes
    const sourceX = sourceNode.position.x + 100;  // assuming node width is about 200px
    const sourceY = sourceNode.position.y + 40;   // assuming node height is about 80px
    const targetX = targetNode.position.x;
    const targetY = targetNode.position.y + 40;
    
    return { sourceX, sourceY, targetX, targetY };
  }, [nodes, edges]);
  
  const onFlowComplete = useCallback((flowId: string) => {
    const flow = dataFlows.find(f => f.id === flowId);
    if (!flow) return;
    
    // Update the target node when flow reaches it
    setNodes(nodes => nodes.map(node => {
      if (node.id === flow.target) {
        return {
          ...node,
          data: {
            ...node.data,
            isActive: true,
            status: flow.type === 'error' ? 'error' : 'processing'
          }
        };
      }
      return node;
    }));
  }, [dataFlows, setNodes]);
  
  const simulatePatternFlow = useCallback(() => {
    resetVisualization();
    setIsAnimating(true);
    
    // Start with the input node
    const inputNode = nodes.find(node => node.data.nodeType === 'input');
    if (!inputNode) return;
    
    // Helper function to process a node after a delay
    const processNode = (nodeId: string, delay: number, previousMessage?: string) => {
      simulationRef.current = setTimeout(() => {
        // Activate the current node
        setNodes(nodes => nodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            isActive: node.id === nodeId,
            status: node.id === nodeId ? 'processing' : node.data.status
          }
        })));
        
        // Find outgoing edges
        const outgoingEdges = edges.filter(edge => edge.source === nodeId);
        
        // After a delay, mark as success and process next nodes
        simulationRef.current = setTimeout(() => {
          // Mark current node as success
          setNodes(nodes => nodes.map(node => ({
            ...node,
            data: {
              ...node.data,
              status: node.id === nodeId ? 'success' : node.data.status
            }
          })));
          
          // Process each outgoing connection
          outgoingEdges.forEach((edge, index) => {
            // Animate the edge
            setEdges(edges => edges.map(e => ({
              ...e,
              animated: e.id === edge.id ? true : e.animated
            })));
            
            // Create a data flow along the edge
            const sourceNode = nodes.find(n => n.id === nodeId);
            const targetNode = nodes.find(n => n.id === edge.target);
            
            if (sourceNode && targetNode) {
              const nodeType = sourceNode.data.nodeType || 'default';
              const message = messageTemplates[nodeType]?.(previousMessage || 'data') || 'Processing...';
              
              const flowType = Math.random() > 0.9 ? 'error' : 
                               nodeType === 'llm' ? 'response' : 'message';
                               
              const newFlow = {
                id: `flow-${Date.now()}-${index}`,
                edgeId: edge.id,
                source: edge.source,
                target: edge.target,
                content: message,
                timestamp: Date.now(),
                type: flowType,
                progress: 0,
                label: flowType === 'error' ? 'Error' : undefined
              };
              
              setDataFlows(flows => [...flows, newFlow]);
              
              // Process the target node after a suitable delay
              const targetDelay = sourceNode.data.nodeType === 'aggregator' ? 2000 : 
                                 sourceNode.data.nodeType === 'router' ? 1000 : 1500;
                                 
              processNode(edge.target, targetDelay, message);
            }
          });
        }, 1500);
        
      }, delay);
    };
    
    // Start the simulation from the input node
    processNode(inputNode.id, 100);
  }, [nodes, edges, setNodes, setEdges]);
  
  const onInit = useCallback((instance: ReactFlowInstance) => {
    flowInstanceRef.current = instance;
  }, []);

  return (
    <Card className="mb-6">
      <CardContent className="p-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-muted">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{patternData.name}</h3>
            <Badge variant="outline" className="ml-2">{patternData.id}</Badge>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={resetVisualization}
              disabled={!isAnimating}
            >
              <ArrowsCounterClockwise className="mr-2" size={14} />
              Reset
            </Button>
            <Button 
              size="sm"
              onClick={simulatePatternFlow}
              disabled={isAnimating}
            >
              {isAnimating ? (
                <Stop className="mr-2" size={14} />
              ) : (
                <Play className="mr-2" size={14} />
              )}
              {isAnimating ? 'Running...' : 'Simulate Flow'}
            </Button>
          </div>
        </div>
        <div className="p-4">
          <p className="text-muted-foreground mb-4">{patternData.description}</p>
          
          {patternContents.find(p => p.id === patternData.id) && (
            <div className="mt-2">
              <button 
                onClick={() => setShowDetails(!showDetails)}
                className="text-primary text-sm underline-offset-4 hover:underline flex items-center gap-1"
              >
                {showDetails ? (
                  <><InfoCircledIcon className="h-4 w-4" /> Hide detailed explanation</>
                ) : (
                  <><InfoCircledIcon className="h-4 w-4" /> Show detailed explanation</>
                )}
              </button>
              
              {showDetails && (
                <div className="mt-3 p-3 bg-muted/50 rounded text-sm border border-muted">
                  <p className="leading-relaxed">
                    {patternContents.find(p => p.id === patternData.id)?.longDescription}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        <div style={{ height: 400 }}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              fitView
              onInit={onInit}
            >
              <Background />
              <Controls />
              <MiniMap />
              <DataFlowVisualizer 
                flows={dataFlows} 
                edges={edges}
                getEdgePoints={getEdgePoints}
                onFlowComplete={onFlowComplete}
              />
              <Panel position="bottom-center">
                <div className="bg-card p-2 rounded shadow-sm text-xs text-muted-foreground">
                  {isAnimating ? 'Visualizing data flow between agents...' : 'Click "Simulate Flow" to see data flow between agents'}
                </div>
              </Panel>
            </ReactFlow>
          </ReactFlowProvider>
        </div>
        <div className="p-4 border-t border-border">
          <h4 className="font-medium mb-2">Best Suited For:</h4>
          <div className="flex flex-wrap gap-2 mb-4">
            {patternData.useCases.map((useCase, index) => (
              <Badge key={index} variant="secondary">{useCase}</Badge>
            ))}
          </div>
          
          {patternContents.find(p => p.id === patternData.id) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <h4 className="font-medium text-primary mb-2 flex items-center gap-1">
                  <Play size={14} className="text-primary" /> Key Advantages
                </h4>
                <ul className="text-sm space-y-1">
                  {patternContents.find(p => p.id === patternData.id)?.advantages.slice(0, 3).map((advantage, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{advantage}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-secondary mb-2 flex items-center gap-1">
                  <InfoCircledIcon className="h-4 w-4" /> Limitations to Consider
                </h4>
                <ul className="text-sm space-y-1">
                  {patternContents.find(p => p.id === patternData.id)?.limitations.slice(0, 3).map((limitation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-secondary mt-1">•</span>
                      <span>{limitation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default PatternVisualizer