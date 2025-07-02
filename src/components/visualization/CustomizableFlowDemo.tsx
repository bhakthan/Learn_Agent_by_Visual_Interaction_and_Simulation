import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  useReactFlow,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Stop, ArrowsCounterClockwise } from '@phosphor-icons/react';

import DataFlowVisualizer from './DataFlowVisualizer';
import FlowColorCustomizer from './FlowColorCustomizer';
import { FlowColorType } from '@/lib/hooks/useFlowColors';
import { simulatePatternFlow } from '@/lib/utils/dataFlowUtils';

// Sample nodes for a basic agent pattern
const initialNodes = [
  {
    id: 'user',
    position: { x: 100, y: 100 },
    data: { 
      label: 'User', 
      nodeType: 'user',
      status: null 
    },
    type: 'input',
  },
  {
    id: 'agent',
    position: { x: 350, y: 100 },
    data: { 
      label: 'Agent', 
      nodeType: 'agent',
      status: null 
    },
  },
  {
    id: 'tool',
    position: { x: 600, y: 100 },
    data: { 
      label: 'Tool', 
      nodeType: 'tool',
      status: null 
    },
  },
  {
    id: 'result',
    position: { x: 350, y: 200 },
    data: { 
      label: 'Result', 
      nodeType: 'result',
      status: null 
    },
    type: 'output',
  },
];

// Initial edges connecting the nodes
const initialEdges = [
  { id: 'e1-2', source: 'user', target: 'agent', animated: false, label: 'Query' },
  { id: 'e2-3', source: 'agent', target: 'tool', animated: false, label: 'Tool Call' },
  { id: 'e3-2', source: 'tool', target: 'agent', animated: false, label: 'Result' },
  { id: 'e2-4', source: 'agent', target: 'result', animated: false, label: 'Response' },
];

// Node types for customization
const nodeTypes = ['user', 'agent', 'tool', 'result', 'planner', 'evaluator', 'environment', 'reflection'];

// Flow types for simulation
const flowTypes: FlowColorType[] = [
  'query', 'response', 'tool_call', 'observation', 'reflection', 'plan', 'message', 'data'
];

const CustomizableFlowDemo = () => {
  // Set up nodes and edges with React Flow hooks
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  // State for data flows, custom colors, and simulation control
  const [dataFlows, setDataFlows] = useState([]);
  const [customColors, setCustomColors] = useState({});
  const [isSimulating, setIsSimulating] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  
  // Reference to cleanup function for simulation
  const cleanupRef = useRef(null);
  
  // Get ReactFlow instance
  const reactFlowInstance = useReactFlow();
  
  // Reference to the ReactFlow wrapper element
  const reactFlowWrapper = useRef(null);
  
  // Function to get points for a specific edge by ID
  const getEdgePoints = useCallback((edgeId) => {
    // Return null if ReactFlow isn't ready
    if (!reactFlowInstance) return null;
    
    try {
      // Get edge by ID
      const edge = edges.find(e => e.id === edgeId);
      if (!edge) return null;
      
      // Get source and target nodes
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      if (!sourceNode || !targetNode) return null;
      
      // Calculate center points of nodes
      const sourceX = sourceNode.position.x + 75;
      const sourceY = sourceNode.position.y + 20;
      const targetX = targetNode.position.x + 75;
      const targetY = targetNode.position.y + 20;
      
      return { sourceX, sourceY, targetX, targetY };
    } catch (e) {
      console.error("Error getting edge points:", e);
      return null;
    }
  }, [reactFlowInstance, edges, nodes]);
  
  // Update node status
  const updateNodeStatus = useCallback((nodeId, status) => {
    setNodes(nds => nds.map(node => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: {
            ...node.data,
            status
          }
        };
      }
      return node;
    }));
  }, [setNodes]);
  
  // Update edge animation status
  const updateEdgeStatus = useCallback((edgeId, animated) => {
    setEdges(eds => eds.map(edge => {
      if (edge.id === edgeId) {
        return {
          ...edge,
          animated
        };
      }
      return edge;
    }));
  }, [setEdges]);
  
  // Handle flow completion
  const handleFlowComplete = useCallback((flowId) => {
    setDataFlows(flows => flows.filter(f => f.id !== flowId));
  }, []);
  
  // Create a new data flow
  const handleDataFlow = useCallback((flow) => {
    setDataFlows(flows => [...flows, flow]);
  }, []);
  
  // Reset visualization to initial state
  const resetVisualization = useCallback(() => {
    // Reset nodes
    setNodes(initialNodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        status: null
      }
    })));
    
    // Reset edges
    setEdges(initialEdges.map(edge => ({
      ...edge,
      animated: false
    })));
    
    // Clear flows
    setDataFlows([]);
    
    // Cleanup any running simulation
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    
    setIsSimulating(false);
  }, [setNodes, setEdges]);
  
  // Start simulation
  const startSimulation = useCallback(() => {
    if (isSimulating) return;
    
    setIsSimulating(true);
    
    // Reset first
    resetVisualization();
    
    // Start new simulation
    const { cleanup } = simulatePatternFlow(
      nodes,
      edges,
      updateNodeStatus,
      updateEdgeStatus,
      handleDataFlow,
      "User query input",
      null,
      animationSpeed
    );
    
    cleanupRef.current = cleanup;
  }, [
    nodes, 
    edges, 
    updateNodeStatus, 
    updateEdgeStatus, 
    handleDataFlow, 
    isSimulating, 
    resetVisualization,
    animationSpeed
  ]);
  
  // Stop simulation
  const stopSimulation = useCallback(() => {
    if (!isSimulating) return;
    
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    
    setIsSimulating(false);
  }, [isSimulating]);
  
  // Handle color changes from the customizer
  const handleColorsChange = useCallback((colorMap) => {
    setCustomColors(colorMap);
  }, []);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, []);
  
  // Fit flow view to visible area
  useEffect(() => {
    if (reactFlowInstance) {
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2 });
      }, 200);
    }
  }, [reactFlowInstance]);
  
  return (
    <div className="flex flex-col space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Customizable Flow Visualization Demo</CardTitle>
          <CardDescription>
            Customize colors for different flow types and visualize agent interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="visualization" className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="visualization">Visualization</TabsTrigger>
              <TabsTrigger value="customization">Color Customization</TabsTrigger>
            </TabsList>
            
            <TabsContent value="visualization" className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <Button
                  onClick={startSimulation}
                  disabled={isSimulating}
                  className="gap-2"
                >
                  <Play size={16} />
                  Start Flow
                </Button>
                <Button
                  onClick={stopSimulation}
                  disabled={!isSimulating}
                  variant="outline"
                  className="gap-2"
                >
                  <Stop size={16} />
                  Stop
                </Button>
                <Button
                  onClick={resetVisualization}
                  variant="outline"
                  className="gap-2"
                >
                  <ArrowsCounterClockwise size={16} />
                  Reset
                </Button>
                
                <div className="flex items-center ml-auto gap-2">
                  <Label htmlFor="speed">Speed:</Label>
                  <Select
                    value={String(animationSpeed)}
                    onValueChange={(value) => setAnimationSpeed(Number(value))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Speed" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">Slow (0.5x)</SelectItem>
                      <SelectItem value="1">Normal (1x)</SelectItem>
                      <SelectItem value="2">Fast (2x)</SelectItem>
                      <SelectItem value="3">Very Fast (3x)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Label htmlFor="show-controls">Controls</Label>
                  <Switch
                    id="show-controls"
                    checked={showControls}
                    onCheckedChange={setShowControls}
                  />
                </div>
              </div>
              
              <div 
                className="w-full border border-border rounded-md bg-background"
                ref={reactFlowWrapper} 
                style={{ height: 400 }}
              >
                <ReactFlowProvider>
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    fitView
                    attributionPosition="bottom-right"
                  >
                    {showControls && <Controls />}
                    {showControls && <MiniMap />}
                    <Background color="#aaa" gap={16} />
                    
                    <DataFlowVisualizer
                      flows={dataFlows}
                      edges={edges}
                      getEdgePoints={getEdgePoints}
                      onFlowComplete={handleFlowComplete}
                      speed={animationSpeed}
                      colorMap={customColors}
                    />
                  </ReactFlow>
                </ReactFlowProvider>
              </div>
            </TabsContent>
            
            <TabsContent value="customization">
              <div className="grid place-items-center py-4">
                <FlowColorCustomizer onColorsChange={handleColorsChange} />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

// Wrap the component with ReactFlowProvider for use in other components
const CustomizableFlowDemoWithProvider = () => (
  <ReactFlowProvider>
    <CustomizableFlowDemo />
  </ReactFlowProvider>
);

export default CustomizableFlowDemoWithProvider;