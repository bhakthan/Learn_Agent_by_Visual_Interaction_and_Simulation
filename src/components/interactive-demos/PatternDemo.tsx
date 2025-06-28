import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { PatternData } from '@/lib/data/patterns'
import { Play, ArrowsClockwise, CheckCircle, Clock, WarningCircle, ArrowBendDownRight, Gauge } from "@phosphor-icons/react"
import { useTheme } from '@/components/theme/ThemeProvider'
import ReactFlow, {
  ReactFlowProvider,
  Node,
  Edge,
  Handle,
  Position,
  NodeTypes,
  useNodesState,
  useEdgesState,
  Background,
  useReactFlow,
  MiniMap,
  Controls,
  MarkerType
} from 'reactflow'
import { StepController } from '@/lib/utils/stepControl'
import 'reactflow/dist/style.css'
import { useFlowContainer } from '@/lib/hooks/useFlowContainer'
import { useResizeObserver } from '@/lib/hooks/useResizeObserver'

import DataFlowVisualizer from '../visualization/DataFlowVisualizer'
// Mock response generation to simulate LLM calls
const generateMockResponse = (text: string, patternId: string) => {
  return new Promise<string>((resolve) => {
    // Add random delay for realistic effect
    const delay = 500 + Math.random() * 1500;
    setTimeout(() => {
      if (patternId === 'prompt-chaining') {
        resolve(`This is an analysis of your input "${text}" using a chain of specialized prompts to extract meaning, determine intent, and formulate a response.`);
      } else if (patternId === 'parallelization') {
        resolve(`Three independent analyses of "${text}" run in parallel and aggregated to provide a more robust response with diverse perspectives.`);
      } else {
        resolve(`Processed your input "${text}" using the ${patternId} pattern.`);
      }
    }, delay);
  });
};

interface PatternDemoProps {
  patternData: PatternData;
}

interface StepState {
  status: 'idle' | 'running' | 'complete' | 'failed';
  result?: string;
  startTime?: number;
  endTime?: number;
}

interface DataFlowMessage {
  id: string;
  edgeId: string;
  source: string;
  target: string;
  content: string;
  timestamp: number;
  type: 'message' | 'data' | 'response' | 'error';
  progress: number;
  complete?: boolean;
}

// Custom node component for the demo with memoization
const CustomDemoNode = React.memo(({ data, id }: { data: any, id: string }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // Memoize node styles to prevent unnecessary recalculations
  const getNodeStyle = useCallback(() => {
    const baseStyle = {
      padding: '10px 20px',
      borderRadius: '8px',
      transition: 'all 0.2s ease',
      width: '180px',
      color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
    }
    
    // Add status-specific styling
    const statusStyle = data.status === 'running' ? {
      boxShadow: `0 0 0 2px var(--primary), 0 0 15px ${isDarkMode ? 'rgba(66, 153, 225, 0.3)' : 'rgba(66, 153, 225, 0.5)'}`,
      transform: 'scale(1.02)'
    } : data.status === 'complete' ? {
      boxShadow: `0 0 0 2px ${isDarkMode ? 'rgba(16, 185, 129, 0.8)' : 'rgba(16, 185, 129, 0.6)'}`,
    } : data.status === 'failed' ? {
      boxShadow: `0 0 0 2px ${isDarkMode ? 'rgba(239, 68, 68, 0.8)' : 'rgba(239, 68, 68, 0.6)'}`,
    } : {};
    
    // Node type specific styling with dark mode support
    switch(data.nodeType) {
      case 'input':
        return { 
          ...baseStyle, 
          backgroundColor: isDarkMode ? 'rgba(51, 65, 85, 0.8)' : 'rgb(226, 232, 240)', 
          border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.8)' : 'rgb(203, 213, 225)'}`, 
          ...statusStyle 
        }
      case 'llm':
        return { 
          ...baseStyle, 
          backgroundColor: isDarkMode ? 'rgba(30, 58, 138, 0.4)' : 'rgb(219, 234, 254)', 
          border: `1px solid ${isDarkMode ? 'rgba(59, 130, 246, 0.5)' : 'rgb(147, 197, 253)'}`, 
          ...statusStyle 
        }
      case 'output':
        return { 
          ...baseStyle, 
          backgroundColor: isDarkMode ? 'rgba(20, 83, 45, 0.4)' : 'rgb(220, 252, 231)', 
          border: `1px solid ${isDarkMode ? 'rgba(34, 197, 94, 0.5)' : 'rgb(134, 239, 172)'}`, 
          ...statusStyle 
        }
      case 'router':
        return { 
          ...baseStyle, 
          backgroundColor: isDarkMode ? 'rgba(113, 63, 18, 0.4)' : 'rgb(254, 242, 220)', 
          border: `1px solid ${isDarkMode ? 'rgba(234, 179, 8, 0.5)' : 'rgb(253, 224, 71)'}`, 
          ...statusStyle 
        }
      case 'aggregator':
        return { 
          ...baseStyle, 
          backgroundColor: isDarkMode ? 'rgba(22, 101, 52, 0.4)' : 'rgb(240, 253, 240)', 
          border: `1px solid ${isDarkMode ? 'rgba(74, 222, 128, 0.5)' : 'rgb(187, 247, 208)'}`, 
          ...statusStyle 
        }
      default:
        return { 
          ...baseStyle, 
          backgroundColor: isDarkMode ? 'rgba(51, 65, 85, 0.6)' : 'white', 
          border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.6)' : 'rgb(226, 232, 240)'}`, 
          ...statusStyle 
        }
    }
  }, [data.status, data.nodeType, isDarkMode]); // Only recalculate when these dependencies change

  // Memoize the truncated result text
  const resultText = useMemo(() => {
    if (!data.result) return null;
    return data.result.length > 40 ? `${data.result.substring(0, 40)}...` : data.result;
  }, [data.result]);
  
  const nodeStyle = useMemo(() => getNodeStyle(), [getNodeStyle]);
  
  return (
    <div style={nodeStyle}>
      <Handle type="target" position={Position.Left} />
      <div>
        <div className="flex items-center gap-2">
          {data.status === 'running' && <Clock className="text-amber-500" size={16} />}
          {data.status === 'complete' && <CheckCircle className="text-green-500" size={16} />}
          {data.status === 'failed' && <WarningCircle className="text-destructive" size={16} />}
          <strong>{data.label}</strong>
        </div>
        
        {resultText && (
          <div className={`mt-2 text-xs p-1.5 rounded border ${isDarkMode ? 'bg-background/80 border-border text-foreground' : 'bg-background/50 border-border/50 text-foreground'}`}>
            {resultText}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render when relevant props change
  if (prevProps.id !== nextProps.id) return false;
  
  const prevData = prevProps.data;
  const nextData = nextProps.data;
  
  // Compare important data properties
  if (prevData.status !== nextData.status) return false;
  if (prevData.label !== nextData.label) return false;
  if (prevData.result !== nextData.result) return false;
  
  // If we got here, nothing important changed, skip re-render
  return true;
});

const PatternDemo = React.memo(({ patternData }: PatternDemoProps) => {
  const { theme } = useTheme();
  const [userInput, setUserInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [steps, setSteps] = useState<Record<string, StepState>>({});
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [dataFlows, setDataFlows] = useState<DataFlowMessage[]>([]);

  // Step controller for managing execution flow
  const stepControllerRef = useRef<StepController | null>(null);

  // Initialize step controller
  useEffect(() => {
    stepControllerRef.current = new StepController((isWaiting) => {
      setWaitingForNextStep(isWaiting);
    });
    
    return () => {
      // Clean up on unmount
      if (stepControllerRef.current) {
        stepControllerRef.current.stop();
      }
    };
  }, []);
  
  // Animation speeds
  const [animationSpeed, setAnimationSpeed] = useState<number>(1); // Default to normal speed (1x)
  // Animation mode (auto/step-by-step)
  const [animationMode, setAnimationMode] = useState<'auto' | 'step-by-step'>('auto'); 
  // Track number of steps in the execution
  const [iterations, setIterations] = useState<number>(0);
  // Track if we're waiting for user to advance to next step
  const [waitingForNextStep, setWaitingForNextStep] = useState<boolean>(false);
  
  // Create demo nodes for visualization - memoize them based on patternData
  const initialDemoNodes = useMemo(() => patternData.nodes.map(node => ({
    ...node,
    type: 'demoNode',
    data: {
      ...node.data,
      status: 'idle',
    },
    draggable: false,
    selectable: false,
  })), [patternData.nodes]);
  
  // Optimize node positions for the demo display - memoized
  const optimizedNodes = useMemo(() => initialDemoNodes.map(node => {
    // Scale and center the nodes for better visualization
    return {
      ...node,
      position: {
        x: node.position.x * 0.8 + 50,
        y: node.position.y + 50
      }
    };
  }), [initialDemoNodes]);
  
  const [nodes, setNodes, onNodesChange] = useNodesState(optimizedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(patternData.edges);
  
  // Remove completed flows
  const onFlowComplete = (flowId: string) => {
    setDataFlows(prev => prev.filter(flow => flow.id !== flowId));
  };
  
  const resetDemo = () => {
    setIsRunning(false);
    setOutput(null);
    setSteps({});
    setCurrentNodeId(null);
    setDataFlows([]);
    setIterations(0); // Reset iterations count
    setWaitingForNextStep(false); // Reset step-by-step state
    
    // Reset nodes
    setNodes(nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        status: 'idle',
        result: undefined
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
    const sourceX = sourceNode.position.x + 150;  // assuming node width
    const sourceY = sourceNode.position.y + 40;   // assuming node height
    const targetX = targetNode.position.x;
    const targetY = targetNode.position.y + 40;
    
    return { sourceX, sourceY, targetX, targetY };
  }, [edges, nodes]);

  const runDemo = async () => {
    if (!userInput.trim() || isRunning) return;
    
    resetDemo();
    setIsRunning(true);
    setIterations(0); // Initialize iterations counter
    
    // Initialize all nodes as idle
    const initialSteps = patternData.nodes.reduce((acc, node) => {
      acc[node.id] = { status: 'idle' };
      return acc;
    }, {} as Record<string, StepState>);
    setSteps(initialSteps);
    
    try {
      // Find input node
      const inputNode = patternData.nodes.find(node => node.data.nodeType === 'input');
      if (!inputNode) throw new Error('No input node found');
      
      // Process input node
      await processNode(inputNode.id);
      
      // Final output
      setIsRunning(false);
      setWaitingForNextStep(false);
    } catch (error) {
      console.error('Error in demo:', error);
      setIsRunning(false);
      setWaitingForNextStep(false);
      setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    }
  };
  
  const processNode = async (nodeId: string) => {
    // Mark node as running
    setCurrentNodeId(nodeId);
    setSteps(prev => ({
      ...prev,
      [nodeId]: { ...prev[nodeId], status: 'running', startTime: Date.now() }
    }));
    
    // Increment iterations counter
    setIterations(prev => prev + 1);
    
    // Update node status in visualization
    setNodes(nodes => nodes.map(node => 
      node.id === nodeId ? {
        ...node,
        data: { ...node.data, status: 'running' }
      } : node
    ));
    
    const node = patternData.nodes.find(n => n.id === nodeId);
    if (!node) throw new Error(`Node ${nodeId} not found`);
    
    try {
      // Process node based on type
      let result = '';
      
      if (node.data.nodeType === 'input') {
        result = `Processing input: "${userInput}"`;
        await new Promise(resolve => setTimeout(resolve, 500 / animationSpeed)); // Short delay for input
      } else if (node.data.nodeType === 'llm') {
        result = await generateMockResponse(userInput, patternData.id);
      } else if (node.data.nodeType === 'router') {
        result = 'Determining next steps based on input analysis...';
        await new Promise(resolve => setTimeout(resolve, 800 / animationSpeed)); // Delay for router decision
        
        // Router logic - randomly choose a path for demo purposes
        const shouldSucceed = Math.random() > 0.2; // 80% success rate
        if (!shouldSucceed) {
          throw new Error('Router determined input cannot be processed further');
        }
      } else if (node.data.nodeType === 'aggregator') {
        result = 'Combining results from parallel processes...';
        await new Promise(resolve => setTimeout(resolve, 1200 / animationSpeed)); // Longer delay for aggregation
      } else {
        result = `Processed by ${node.data.label}`;
        await new Promise(resolve => setTimeout(resolve, 700 / animationSpeed));
      }
      
      // Mark node as complete
      setSteps(prev => ({
        ...prev,
        [nodeId]: { 
          ...prev[nodeId], 
          status: 'complete', 
          result, 
          endTime: Date.now() 
        }
      }));
      
      // Update node in visualization
      setNodes(nodes => nodes.map(node => 
        node.id === nodeId ? {
          ...node,
          data: { 
            ...node.data, 
            status: 'complete',
            result
          }
        } : node
      ));
      
      // If output node, set final output
      if (node.data.nodeType === 'output') {
        setOutput(result);
        return;
      }
      
      // Find next nodes
      const outgoingEdges = patternData.edges.filter(edge => edge.source === nodeId);
      
      // Process next nodes sequentially
      for (const edge of outgoingEdges) {
        // Animate edge
        setEdges(edges => edges.map(e => 
          e.id === edge.id ? { ...e, animated: true } : e
        ));
        
        // Create data flow visualization
        const newFlow = {
          id: `flow-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          edgeId: edge.id,
          source: edge.source,
          target: edge.target,
          content: result,
          timestamp: Date.now(),
          type: node.data.nodeType === 'router' ? 'data' : 
                node.data.nodeType === 'llm' ? 'response' : 'message',
          progress: 0
        };
        setDataFlows(flows => [...flows, newFlow]);
        
        // Wait proportionally to the animation speed (faster speed = shorter delay)
        await new Promise(resolve => setTimeout(resolve, 800 / animationSpeed));
        
        // If step-by-step mode is active, wait for user to click "Next Step" button
        if (animationMode === 'step-by-step') {
          setWaitingForNextStep(true);
          await new Promise<void>(resolve => {
            const checkInterval = setInterval(() => {
              if (!waitingForNextStep) {
                clearInterval(checkInterval);
                resolve();
              }
            }, 100);
          });
        }
        
        // Process target node
        await processNode(edge.target);
      }
    } catch (error) {
      console.error(`Error processing node ${nodeId}:`, error);
      
      // Mark node as failed
      setSteps(prev => ({
        ...prev,
        [nodeId]: { 
          ...prev[nodeId], 
          status: 'failed', 
          result: error instanceof Error ? error.message : 'Unknown error',
          endTime: Date.now()
        }
      }));
      
      // Update node in visualization
      setNodes(nodes => nodes.map(node => 
        node.id === nodeId ? {
          ...node,
          data: { 
            ...node.data, 
            status: 'failed',
            result: error instanceof Error ? error.message : 'Unknown error'
          }
        } : node
      ));
      
      // Create error flow visualization
      const failureEdges = patternData.edges.filter(edge => 
        edge.source === nodeId && 
        patternData.nodes.find(n => n.id === edge.target)?.data.label?.toLowerCase().includes('fail')
      );
      
      for (const edge of failureEdges) {
        // Animate edge
        setEdges(edges => edges.map(e => 
          e.id === edge.id ? { ...e, animated: true } : e
        ));
        
        // Create error flow visualization
        const errorFlow = {
          id: `flow-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          edgeId: edge.id,
          source: edge.source,
          target: edge.target,
          content: 'Error',
          timestamp: Date.now(),
          type: 'error',
          progress: 0
        };
        setDataFlows(flows => [...flows, errorFlow]);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // If step-by-step mode is active, wait for user to click "Next Step" button
        if (animationMode === 'step-by-step') {
          setWaitingForNextStep(true);
          await new Promise<void>(resolve => {
            const checkInterval = setInterval(() => {
              if (!waitingForNextStep) {
                clearInterval(checkInterval);
                resolve();
              }
            }, 100);
          });
        }
        
        // Process failure path
        await processNode(edge.target);
        return;
      }
      
      throw error; // Propagate error if no failure path
    }
  };
  
  // Calculate execution time for a step with memoization
  const getExecutionTime = useCallback((step: StepState) => {
    if (step.startTime && step.endTime) {
      return `${((step.endTime - step.startTime) / 1000).toFixed(1)}s`;
    }
    return '';
  }, []);

  // Use the FlowContainer hook for better handling of ReactFlow resizing
  const flowContainerRef = useFlowContainer<HTMLDivElement>();
  
  // Use resize observer with longer debounce time to detect container size changes
  const [wrapperRef, wrapperDimensions] = useResizeObserver<HTMLDivElement>(300);
  
  // Track whether the flow has been properly initialized
  const flowInitializedRef = useRef(false);
  
  // Listen for flow-specific resize events with enhanced error handling
  useEffect(() => {
    const handleFlowResize = (e?: Event) => {
      if (!flowContainerRef.current) return;
      
      // Skip excessive resizes
      if ((e as any)?.detail?.skipReactFlow) return;
      
      // Use a proper debounce approach to safely handle resizes
      const triggerFlowUpdate = () => {
        try {
          // Only trigger flow updates after initialization
          if (flowInitializedRef.current) {
            // Mark a layout update is in progress to prevent duplicate processing
            const layoutUpdateEvent = new CustomEvent('layout-update');
            window.dispatchEvent(layoutUpdateEvent);
          }
        } catch (error) {
          // Silently handle any errors to prevent loops
        }
      };
      
      // Cancel any previous animation frames
      if ((window as any).__flowResizeRafId) {
        cancelAnimationFrame((window as any).__flowResizeRafId);
      }
      
      // Schedule update with double RAF for layout stability
      (window as any).__flowResizeRafId = requestAnimationFrame(() => {
        (window as any).__flowResizeRafId = requestAnimationFrame(triggerFlowUpdate);
      });
    };
    
    // Handle both custom events and window resize
    window.addEventListener('flow-resize', handleFlowResize);
    
    // Add a delayed resize handler for initial render with multiple attempts
    // to ensure ReactFlow properly initializes
    const initTimers: number[] = [];
    
    // Try multiple times with increasing delays to ensure proper initialization
    [500, 1000, 2000].forEach(delay => {
      const timer = window.setTimeout(() => {
        flowInitializedRef.current = true;
        handleFlowResize();
      }, delay);
      initTimers.push(timer);
    });
    
    return () => {
      window.removeEventListener('flow-resize', handleFlowResize);
      initTimers.forEach(timer => clearTimeout(timer));
      
      if ((window as any).__flowResizeRafId) {
        cancelAnimationFrame((window as any).__flowResizeRafId);
      }
    };
  }, []);
  
  // Define nodeTypes for ReactFlow
  const nodeTypes: NodeTypes = {
    demoNode: CustomDemoNode
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{patternData.name} Pattern Demo</CardTitle>
        <CardDescription>
          Interactive demonstration of the {patternData.name} agent pattern with step-by-step visualization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Enter some text to process..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={isRunning}
              className="flex-1"
            />
            <Button 
              onClick={runDemo} 
              disabled={!userInput.trim() || isRunning}
            >
              {isRunning ? <ArrowsClockwise className="mr-2 animate-spin" size={16} /> : <Play className="mr-2" size={16} />}
              {isRunning ? 'Running...' : 'Run Demo'}
            </Button>
            <Button 
              variant="outline" 
              onClick={resetDemo}
              disabled={isRunning}
              className="ml-2"
            >
              Reset
            </Button>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium">Animation Mode:</div>
            <div className="flex items-center gap-2">
              <Button 
                size="sm"
                variant={animationMode === 'auto' ? "default" : "outline"}
                onClick={() => {
                  setAnimationMode('auto');
                  // Resume execution if we were waiting for next step
                  if (waitingForNextStep) {
                    setWaitingForNextStep(false);
                  }
                }}
                disabled={isRunning && !waitingForNextStep}
                className="min-w-[110px]"
              >
                Auto
              </Button>
              <Button 
                size="sm"
                variant={animationMode === 'step-by-step' ? "default" : "outline"}
                onClick={() => setAnimationMode('step-by-step')}
                disabled={isRunning && !waitingForNextStep}
                className="min-w-[110px]"
              >
                Step-by-Step
              </Button>
              {waitingForNextStep && (
                <Button 
                  size="sm"
                  variant="secondary"
                  className="ml-2 pulse-animation"
                  onClick={() => {
                    if (stepControllerRef.current) {
                      stepControllerRef.current.advanceToNextStep();
                    } else {
                      setWaitingForNextStep(false);
                    }
                  }}
                >
                  <Gauge size={16} weight="bold" className="mr-1" /> Next Step
                </Button>
              )}
            </div>
          </div>
          
          <div className="space-y-1.5 mb-4">
            <div className="text-sm text-muted-foreground">
              Switch between <span className="font-bold text-primary">Auto</span> and <span className="font-bold text-primary">Step-by-Step</span> modes to analyze how agents interact. Auto mode runs automatically, while Step-by-Step lets you control the pace to understand each agent communication in detail.
            </div>
            {animationMode === 'step-by-step' && (
              <div className="text-sm flex items-center text-primary-foreground bg-primary/10 px-3 py-2 rounded-md">
                <span className="mr-2">•</span> Click <span className="mx-1 font-semibold">Next Step</span> to advance through each interaction in the workflow
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium">Animation Speed:</div>
            <div className="flex items-center gap-2">
              <Button 
                size="sm"
                variant={animationSpeed === 0.5 ? "default" : "outline"}
                onClick={() => setAnimationSpeed(0.5)}
                disabled={isRunning && animationMode === 'auto'}
              >
                Slow
              </Button>
              <Button 
                size="sm"
                variant={animationSpeed === 1 ? "default" : "outline"}
                onClick={() => setAnimationSpeed(1)}
                disabled={isRunning && animationMode === 'auto'}
              >
                Normal
              </Button>
              <Button 
                size="sm"
                variant={animationSpeed === 2 ? "default" : "outline"}
                onClick={() => setAnimationSpeed(2)}
                disabled={isRunning && animationMode === 'auto'}
              >
                Fast
              </Button>
              <span className="ml-4 text-xs text-muted-foreground">
                Iterations: {iterations}
              </span>
            </div>
          </div>
          
          {/* Flow visualization */}
          <div 
            ref={(el) => {
              // Set both refs to the same element
              if (typeof flowContainerRef === 'function') {
                flowContainerRef(el);
              } else if (flowContainerRef) {
                flowContainerRef.current = el;
              }
              
              if (typeof wrapperRef === 'function') {
                wrapperRef(el);
              } else if (wrapperRef) {
                wrapperRef.current = el;
              }
            }}
            className="border border-border rounded-md overflow-hidden" 
            style={{ height: '400px' }}
          >
            <ReactFlowProvider>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                panOnScroll
                minZoom={0.5}
                maxZoom={1.5}
                defaultEdgeOptions={{
                  style: { 
                    strokeWidth: 2,
                    stroke: theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : undefined // Enhanced edge visibility in dark mode
                  },
                  markerEnd: { type: MarkerType.Arrow }
                }}
              >
                <Background color={theme === 'dark' ? '#ffffff20' : '#aaa'} gap={16} />
                <Controls className={theme === 'dark' ? 'dark-controls' : ''} />
                  <MiniMap 
                    style={{ 
                      backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.6)' : undefined,
                      maskColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : undefined
                    }} 
                  />
                  <DataFlowVisualizer 
                    flows={dataFlows} 
                    edges={edges}
                    getEdgePoints={getEdgePoints}
                    onFlowComplete={onFlowComplete}
                    speed={animationSpeed}
                  />
                </ReactFlow>
            </ReactFlowProvider>
          </div>
          
          {Object.keys(steps).length > 0 && (
            <>
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Execution Log</h3>
                
                <div className="space-y-3">
                  {patternData.nodes.map((node) => {
                    const step = steps[node.id];
                    if (!step) return null;
                    
                    return (
                        <div 
                          key={node.id} 
                          className={`p-3 rounded-md border ${
                            node.id === currentNodeId ? 'border-primary bg-primary/5' :
                            step.status === 'complete' ? 'border-green-500/20 bg-green-500/5' :
                            step.status === 'failed' ? 'border-destructive/20 bg-destructive/5' :
                            step.status === 'running' ? 'border-amber-500/20 bg-amber-500/5' :
                            'border-border'
                          } ${theme === 'dark' ? 'text-foreground' : ''}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {step.status === 'running' && <Clock className="text-amber-500" size={16} />}
                              {step.status === 'complete' && <CheckCircle className="text-green-500" size={16} />}
                              {step.status === 'failed' && <WarningCircle className="text-destructive" size={16} />}
                              
                              <span className="font-medium">{node.data.label}</span>
                              
                              <Badge variant="outline" className="ml-1">
                                {node.data.nodeType}
                              </Badge>
                            </div>
                            
                            {step.status !== 'idle' && (
                              <span className="text-xs text-muted-foreground">
                                {getExecutionTime(step)}
                              </span>
                            )}
                          </div>
                          
                          {step.result && (
                            <div className="text-sm mt-1">
                              <div className="flex items-start gap-1 text-muted-foreground">
                                <ArrowBendDownRight size={14} className="mt-1" />
                                <span>{step.result}</span>
                              </div>
                            </div>
                          )}
                        </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
          
          {output && (
            <>
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Final Output</h3>
                <Alert>
                  <AlertDescription className="whitespace-pre-wrap">
                    {output}
                  </AlertDescription>
                </Alert>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Only re-render when pattern data has changed in a meaningful way
  if (prevProps.patternData.id !== nextProps.patternData.id) return false;
  
  // Deep compare important pattern data properties that would affect rendering
  const prevNodes = prevProps.patternData.nodes;
  const nextNodes = nextProps.patternData.nodes;
  
  if (prevNodes.length !== nextNodes.length) return false;
  
  // Check if edges have changed significantly
  if (prevProps.patternData.edges.length !== nextProps.patternData.edges.length) return false;
  
  // If we got here, pattern data is similar enough to skip re-rendering
  // The component will handle its own state changes internally
  return true;
});

export default PatternDemo;