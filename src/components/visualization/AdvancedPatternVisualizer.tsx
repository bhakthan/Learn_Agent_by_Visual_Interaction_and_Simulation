import React, { useState, useCallback, useRef, useEffect, memo, useMemo } from 'react'
import ReactFlow, { 
  Background, 
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowInstance,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { PatternData } from '@/lib/data/patterns'
import { patternContents } from '@/lib/data/patternContent'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { 
  Play, Stop, ArrowsCounterClockwise, Info, 
  FastForward, Pause, StepForward, Rewind, 
  CaretDown, CaretUp, ChartLine, List, Gear, DotsSixVertical
} from '@phosphor-icons/react'
import NodeDragHint from './NodeDragHint'
// Import necessary functions from dataFlowUtils
import { simulatePatternFlow, FlowMessage, DataFlowState, DataFlow, getDataFlowAnimationStyle } from '@/lib/utils/dataFlowUtils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import EnhancedDataFlowVisualizer from './EnhancedDataFlowVisualizer'
import DataFlowControls, { DataFlowFilter } from './DataFlowControls'
import { nodeTypes } from './PatternVisualizerNodeTypes'

interface AdvancedPatternVisualizerProps {
  patternData: PatternData;
  onReady?: () => void;
}

// Data flow types
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

// Animation control state
type AnimationSpeed = 'slow' | 'normal' | 'fast';
type AnimationMode = 'auto' | 'step-by-step';
interface AnimationState {
  speed: AnimationSpeed;
  mode: AnimationMode;
  isPaused: boolean;
  step: number;
}

const AdvancedPatternVisualizer = ({ patternData, onReady }: AdvancedPatternVisualizerProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(patternData.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(patternData.edges)
  const [dataFlows, setDataFlows] = useState<DataFlow[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('visualization')
  const [queryInput, setQueryInput] = useState<string>("Tell me about agent patterns")
  const [animationState, setAnimationState] = useState<AnimationState>({
    speed: 'normal',
    mode: 'auto',
    isPaused: false,
    step: 0
  })
  const [speedFactor, setSpeedFactor] = useState<number>(1)
  const [dataFlowFilter, setDataFlowFilter] = useState<DataFlowFilter>({
    messageTypes: ['message', 'data', 'response', 'error'],
    nodeTypes: [],
    connections: [],
    visualizationMode: 'basic',
    highlightPattern: null
  })
  const [visualizationMode, setVisualizationMode] = useState<'basic' | 'detailed' | 'timeline'>('basic')
  
  const flowInstanceRef = useRef<ReactFlowInstance | null>(null)
  const simulationRef = useRef<NodeJS.Timeout | null>(null)
  const simulationCleanupRef = useRef<(() => void) | null>(null)
  const stepQueueRef = useRef<Array<() => void>>([])
  const reactFlowInstance = useReactFlow()
  
  // Initialize available message types
  const availableMessageTypes = ['message', 'data', 'response', 'error'];
  
  // Reset flow and nodes when pattern changes
  useEffect(() => {
    resetVisualization();
    // Make sure isAnimating is reset when pattern changes
    setIsAnimating(false);
    setDataFlows([]);
    
    // Signal that the component is ready
    if (onReady) {
      onReady();
    }
  }, [patternData.id]);

  // Initialize node type filters when nodes change
  useEffect(() => {
    const nodeTypes = Array.from(new Set(nodes.map(node => node.data.nodeType)));
    setDataFlowFilter(prev => ({
      ...prev,
      nodeTypes
    }));
  }, [nodes]);

  // Speed factor effect
  useEffect(() => {
    const factors = {
      'slow': 0.5,
      'normal': 1,
      'fast': 2
    };
    setSpeedFactor(factors[animationState.speed]);
  }, [animationState.speed]);
  
  const resetVisualization = useCallback(() => {
    // Clear any running timeouts
    if (simulationRef.current) {
      clearTimeout(simulationRef.current);
      simulationRef.current = null;
    }
    
    // Run cleanup if available
    if (simulationCleanupRef.current) {
      simulationCleanupRef.current();
      simulationCleanupRef.current = null;
    }
    
    setIsAnimating(false);
    setDataFlows([]); // Clear all data flows
    
    // Reset animation state
    setAnimationState({
      speed: 'normal',
      mode: 'auto',
      isPaused: false,
      step: 0
    });
    
    // Reset visualization mode
    setVisualizationMode('basic');
    
    // Clear step queue
    stepQueueRef.current = [];
    
    // Reset all nodes (remove active state and status)
    setNodes(currentNodes => currentNodes.map(node => ({
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
  }, [patternData.edges, setNodes, setEdges]);
  
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
    setDataFlows(currentFlows => {
      const flow = currentFlows.find(f => f.id === flowId);
      if (!flow) return currentFlows;
      
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
      
      // Return flows with completed flow filtered out
      return currentFlows.filter(f => f.id !== flowId);
    });
  }, [setNodes]);
  
  const togglePauseSimulation = useCallback(() => {
    setAnimationState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);
  
  const executeNextStep = useCallback(() => {
    if (stepQueueRef.current.length > 0) {
      const nextStep = stepQueueRef.current.shift();
      if (nextStep) {
        nextStep();
        setAnimationState(prev => ({ ...prev, step: prev.step + 1 }));
      }
    }
  }, []);
  
  const startSimulation = useCallback(() => {
    resetVisualization();
    setIsAnimating(true);
    
    // Create handlers for the simulation
    const handleNodeStatus = (nodeId: string, status: string | null) => {
      setNodes(currentNodes => 
        currentNodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            isActive: status !== null,
            status: node.id === nodeId ? status : node.data.status
          }
        }))
      );
    };
    
    const handleEdgeStatus = (edgeId: string, animated: boolean) => {
      setEdges(currentEdges => 
        currentEdges.map(edge => ({
          ...edge,
          animated: edge.id === edgeId ? animated : edge.animated
        }))
      );
    };
    
    const handleDataFlow = (flow: any) => {
      setDataFlows(currentFlows => [...currentFlows, flow]);
    };
    
    // Create step handler for step-by-step mode
    const handleAddStep = (stepFn: () => void) => {
      if (animationState.mode === 'step-by-step') {
        stepQueueRef.current.push(stepFn);
      } else {
        // In auto mode, execute based on speed factor
        const timeoutId = setTimeout(() => {
          if (!animationState.isPaused) {
            stepFn();
          }
        }, 100 / speedFactor);
        return timeoutId;
      }
      return null;
    };
    
    // Start the simulation using our utility
    const { cleanup } = simulatePatternFlow(
      nodes,
      edges,
      handleNodeStatus,
      handleEdgeStatus,
      handleDataFlow,
      queryInput,
      handleAddStep,
      animationState.mode === 'auto' ? speedFactor : undefined
    );
    
    // Store the cleanup function
    simulationCleanupRef.current = cleanup;
    
    // In auto mode, start simulation immediately
    if (animationState.mode === 'auto') {
      simulationRef.current = setTimeout(() => {}, 100);
    }
    
    // Clean up the simulation when component unmounts or resets
    return () => {
      if (cleanup) cleanup();
    };
  }, [nodes, edges, setNodes, setEdges, resetVisualization, animationState.mode, animationState.isPaused, speedFactor]);
  
  const onInit = useCallback((instance: ReactFlowInstance) => {
    flowInstanceRef.current = instance;
  }, []);
  
  const changeAnimationSpeed = useCallback((newSpeed: AnimationSpeed) => {
    setAnimationState(prev => ({ ...prev, speed: newSpeed }));
  }, []);
  
  const changeAnimationMode = useCallback((newMode: AnimationMode) => {
    // Reset visualization when changing mode
    resetVisualization();
    setAnimationState(prev => ({ ...prev, mode: newMode, step: 0 }));
  }, [resetVisualization]);

  // Reset node layout to original positions
  const resetLayout = useCallback(() => {
    setNodes(patternData.nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        isActive: false,
        status: null
      }
    })));
    
    // Also fit the view to ensure all nodes are visible
    if (flowInstanceRef.current) {
      setTimeout(() => {
        flowInstanceRef.current?.fitView({ duration: 800 });
      }, 100);
    }
  }, [patternData.nodes, setNodes]);

  const handleDataFlowFilterChange = useCallback((filter: DataFlowFilter) => {
    setDataFlowFilter(filter);
    setVisualizationMode(filter.visualizationMode);
  }, []);

  const handleVisualizationModeChange = useCallback((mode: 'basic' | 'detailed' | 'timeline') => {
    setVisualizationMode(mode);
  }, []);

  return (
    <Card className="mb-6">
      <CardContent className="p-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-muted">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{patternData.name}</h3>
            <Badge variant="outline" className="ml-2">{patternData.id}</Badge>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
            <TabsList>
              <TabsTrigger value="visualization" className="flex items-center gap-1">
                <ChartLine size={14} /> Visualization
              </TabsTrigger>
              <TabsTrigger value="data-flow" className="flex items-center gap-1">
                <List size={14} /> Data Flow
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-1">
                <Gear size={14} /> Settings
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={resetLayout}
              title="Restore original node positions"
              className="hidden sm:flex"
            >
              <ArrowsCounterClockwise className="mr-1" size={14} />
              Reset Layout
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={resetVisualization}
              disabled={isAnimating && !animationState.isPaused}
            >
              <ArrowsCounterClockwise className="mr-2" size={14} />
              Reset
            </Button>
            <Button 
              size="sm"
              onClick={isAnimating ? togglePauseSimulation : startSimulation}
              disabled={isAnimating && animationState.mode === 'step-by-step'}
              className={animationState.isPaused ? "bg-yellow-500 hover:bg-yellow-600" : ""}
            >
              {isAnimating ? (
                animationState.isPaused ? <Play className="mr-2" size={14} /> : <Pause className="mr-2" size={14} />
              ) : (
                <Play className="mr-2" size={14} />
              )}
              {isAnimating ? 
                (animationState.isPaused ? 'Resume' : 'Pause') : 
                'Start Simulation'}
            </Button>
          </div>
        </div>
        
        <TabsContent value="visualization" className="m-0">
          {isAnimating && (
            <div className="p-4 pt-0 bg-muted">
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Mode:</span>
                  <div className="flex items-center gap-1">
                    <Button 
                      size="sm" 
                      variant={animationState.mode === 'auto' ? "default" : "outline"}
                      className="h-8"
                      onClick={() => changeAnimationMode('auto')}
                      disabled={isAnimating && !animationState.isPaused && animationState.mode !== 'auto'}
                    >
                      Auto
                    </Button>
                    <Button 
                      size="sm" 
                      variant={animationState.mode === 'step-by-step' ? "default" : "outline"}
                      className="h-8"
                      onClick={() => changeAnimationMode('step-by-step')}
                      disabled={isAnimating && !animationState.isPaused && animationState.mode !== 'step-by-step'}
                    >
                      Step by Step
                    </Button>
                  </div>
                </div>
                
                {animationState.mode === 'step-by-step' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="h-8"
                    onClick={executeNextStep}
                    disabled={!isAnimating || stepQueueRef.current.length === 0}
                  >
                    <StepForward size={14} className="mr-2" />
                    Next Step {stepQueueRef.current.length > 0 ? `(${stepQueueRef.current.length})` : ''}
                  </Button>
                )}
                
                {animationState.mode === 'auto' && (
                  <div className="flex items-center gap-2 flex-grow max-w-xs">
                    <Rewind size={14} />
                    <input
                      type="range"
                      min={0.5}
                      max={2}
                      step={0.5}
                      value={speedFactor}
                      onChange={(e) => {
                        const factor = parseFloat(e.target.value);
                        if (factor === 0.5) changeAnimationSpeed('slow');
                        else if (factor === 1) changeAnimationSpeed('normal');
                        else if (factor === 1.5 || factor === 2) changeAnimationSpeed('fast');
                      }}
                      className="w-full h-2 bg-muted rounded-md appearance-none cursor-pointer"
                    />
                    <FastForward size={14} />
                  </div>
                )}
                
                <div className="flex items-center gap-1 ml-auto">
                  <span className="text-sm">Speed:</span>
                  <Badge variant={animationState.speed === 'slow' ? 'default' : 'outline'} onClick={() => changeAnimationSpeed('slow')} className="cursor-pointer">
                    Slow
                  </Badge>
                  <Badge variant={animationState.speed === 'normal' ? 'default' : 'outline'} onClick={() => changeAnimationSpeed('normal')} className="cursor-pointer">
                    Normal
                  </Badge>
                  <Badge variant={animationState.speed === 'fast' ? 'default' : 'outline'} onClick={() => changeAnimationSpeed('fast')} className="cursor-pointer">
                    Fast
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="data-flow" className="m-0 p-4 border-t">
          <DataFlowControls
            availableNodes={nodes}
            availableEdges={edges}
            availableMessageTypes={availableMessageTypes}
            onFilterChange={handleDataFlowFilterChange}
            onVisualizationModeChange={handleVisualizationModeChange}
          />
        </TabsContent>
        
        <TabsContent value="settings" className="m-0 p-4 border-t">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Visualization Settings</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Show mini-map</span>
                  <input type="checkbox" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Enable animation</span>
                  <input type="checkbox" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Node spacing</span>
                  <input type="range" min="1" max="3" step="0.5" defaultValue="1.5" className="w-32" />
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Display Options</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Node descriptions</span>
                  <input type="checkbox" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Edge labels</span>
                  <input type="checkbox" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Dark background</span>
                  <input type="checkbox" />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <div className="p-4">
          <Collapsible open={showDetails} onOpenChange={setShowDetails}>
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">{patternData.description}</p>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  {showDetails ? <Info size={14} /> : <Info size={14} />}
                  {showDetails ? "Hide Details" : "Show Details"}
                  {showDetails ? <CaretUp size={14} /> : <CaretDown size={14} />}
                </Button>
              </CollapsibleTrigger>
            </div>
            
            <CollapsibleContent>
              {patternContents.find(p => p.id === patternData.id) && (
                <div className="mt-3 p-3 bg-muted/50 rounded text-sm border border-muted">
                  <p className="leading-relaxed">
                    {patternContents.find(p => p.id === patternData.id)?.longDescription}
                  </p>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
        
        <div style={{ height: 500 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            onInit={onInit}
            nodesDraggable={true}
            nodesConnectable={false}
            elementsSelectable={true}
          >
            <Background />
            <Controls />
            <MiniMap />
            <NodeDragHint />
            <EnhancedDataFlowVisualizer 
              flows={dataFlows} 
              edges={edges}
              nodes={nodes}
              getEdgePoints={getEdgePoints}
              onFlowComplete={onFlowComplete}
              speed={speedFactor}
              filter={dataFlowFilter}
              visualizationMode={visualizationMode}
            />
            <Panel position="bottom-center">
              <div className="bg-card p-2 rounded shadow-sm text-xs text-muted-foreground flex items-center gap-2">
                <DotsSixVertical size={12} />
                {isAnimating ? 
                  animationState.mode === 'step-by-step' ? 
                    `Step by step mode: ${animationState.step} steps completed` : 
                    'Visualizing data flow between agents...' 
                  : 'Drag nodes to customize layout. Click "Start Simulation" to see data flow between agents'}
              </div>
            </Panel>
          </ReactFlow>
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
                  <Info className="h-4 w-4" /> Limitations to Consider
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

export default memo(AdvancedPatternVisualizer, (prevProps, nextProps) => {
  // Only re-render if the pattern ID changes
  return prevProps.patternData.id === nextProps.patternData.id;
});