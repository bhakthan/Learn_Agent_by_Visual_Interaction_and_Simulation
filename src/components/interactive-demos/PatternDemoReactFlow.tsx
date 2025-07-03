import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PatternData } from '@/lib/data/patterns';
import { 
  Play, 
  Stop, 
  ArrowsClockwise, 
  CheckCircle,
  ClockClockwise, 
  Lightning, 
  Snail,
  Turtle, 
  Horse, 
  Rabbit 
} from "@phosphor-icons/react";
import { useTheme } from '@/components/theme/ThemeProvider';
import { ReactFlowProvider } from 'reactflow';
import { EnhancedStandardFlowVisualizer, StandardFlowMessage, DataFlowType } from '../visualization/EnhancedStandardFlowVisualizer';
import { getStandardNodeStyle, getStandardEdgeStyle, standardNodePositions } from '@/lib/utils/standardNodeUtils';
import { resetReactFlowRendering } from '@/lib/utils/visualizationUtils';

// Types
interface PatternDemoReactFlowProps {
  patternData: PatternData;
  className?: string;
}

// Step type for visualization
interface StepState {
  id: string;
  node: string;
  label: string;
  status: 'pending' | 'active' | 'complete' | 'error';
  result?: string;
  startTime?: number;
  endTime?: number;
}

// Speed multipliers for animation
const SPEED_MULTIPLIERS = {
  'slow': 0.5,
  'normal': 1,
  'fast': 2,
  'very-fast': 4
};

/**
 * PatternDemoReactFlow - An interactive component to visualize agent pattern flows
 * using EnhancedStandardFlowVisualizer for consistent styling and animations
 */
export const PatternDemoReactFlow = memo(({ patternData, className }: PatternDemoReactFlowProps) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // Container ref for flow visualization
  const flowContainerRef = useRef<HTMLDivElement>(null);
  
  // State
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<Record<string, StepState>>({});
  const [currentStepId, setCurrentStepId] = useState<string | null>(null);
  const [output, setOutput] = useState<string | null>(null);
  const [dataFlows, setDataFlows] = useState<StandardFlowMessage[]>([]);
  const [animationSpeed, setAnimationSpeed] = useState<'slow' | 'normal' | 'fast' | 'very-fast'>('normal');
  const [animationMode, setAnimationMode] = useState<'auto' | 'step-by-step'>('auto');
  const [isWaitingForStep, setIsWaitingForStep] = useState(false);
  
  // Create stable node and edge definitions from pattern data
  const nodes = useMemo(() => {
    return patternData.nodes.map(node => ({
      id: node.id,
      type: 'default',
      data: { 
        label: node.label,
        nodeType: node.type
      },
      position: standardNodePositions[node.type as keyof typeof standardNodePositions] || node.position || { x: 0, y: 0 },
      style: getStandardNodeStyle(node.type, isDarkMode ? 'dark' : 'light'),
      className: `node-${node.type}`
    }));
  }, [patternData.nodes, isDarkMode]);
  
  const edges = useMemo(() => {
    return patternData.edges.map(edge => {
      // Extract type from label or use default
      const edgeType = edge.label?.toLowerCase().replace(/[^a-z_]/g, '') as DataFlowType || 'default';
      
      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        animated: edge.animated || false,
        style: getStandardEdgeStyle(edgeType, isDarkMode ? 'dark' : 'light', edge.animated),
        label: edge.label,
        className: `edge-${edgeType}`
      };
    });
  }, [patternData.edges, isDarkMode]);
  
  // Reset flow when component mounts or when nodes/edges change
  useEffect(() => {
    if (flowContainerRef.current) {
      resetReactFlowRendering(flowContainerRef);
    }
  }, [nodes, edges]);

  // Step controller for step-by-step mode
  const stepController = useRef({
    waitForNextStep: (callback: () => void) => {
      stepController.current.callback = callback;
      setIsWaitingForStep(true);
    },
    callback: null as (() => void) | null,
    advance: () => {
      const callback = stepController.current.callback;
      if (callback) {
        stepController.current.callback = null;
        setIsWaitingForStep(false);
        callback();
      }
    },
    reset: () => {
      stepController.current.callback = null;
      setIsWaitingForStep(false);
    }
  });
  
  // Handle step advancement
  const handleNextStep = useCallback(() => {
    stepController.current.advance();
  }, []);
  
  // Update node status in visualization
  const updateNodeStatus = useCallback((nodeId: string, status: 'pending' | 'active' | 'complete' | 'error', result?: string) => {
    setSteps(prevSteps => ({
      ...prevSteps,
      [nodeId]: {
        ...prevSteps[nodeId],
        status,
        result,
        ...(status === 'active' ? { startTime: Date.now() } : {}),
        ...(status === 'complete' || status === 'error' ? { endTime: Date.now() } : {})
      }
    }));
    
    setCurrentStepId(nodeId);
  }, []);
  
  // Add a data flow message to visualization
  const addDataFlow = useCallback((sourceId: string, targetId: string, content: string, type: DataFlowType) => {
    const edgeId = patternData.edges.find(e => e.source === sourceId && e.target === targetId)?.id;
    
    if (!edgeId) {
      console.warn(`No edge found between ${sourceId} and ${targetId}`);
      return;
    }
    
    setDataFlows(prev => [...prev, {
      id: `flow-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      edgeId,
      source: sourceId,
      target: targetId,
      content,
      type,
      progress: 0,
      label: type
    }]);
  }, [patternData.edges]);
  
  // Simulate pattern execution
  const simulatePatternFlow = useCallback(async () => {
    // Reset state
    setSteps({});
    setCurrentStepId(null);
    setOutput(null);
    setDataFlows([]);
    
    setIsRunning(true);
    
    try {
      // Create a map of steps for quicker lookup
      const stepsMap = patternData.nodes.reduce<Record<string, StepState>>((acc, node) => {
        acc[node.id] = {
          id: node.id,
          node: node.id,
          label: node.label,
          status: 'pending'
        };
        return acc;
      }, {});
      
      setSteps(stepsMap);
      
      // Function to wait between steps
      const wait = (ms: number) => new Promise(resolve => {
        if (animationMode === 'auto') {
          setTimeout(resolve, ms / SPEED_MULTIPLIERS[animationSpeed]);
        } else {
          stepController.current.waitForNextStep(resolve);
        }
      });
      
      // Process each node based on pattern type
      switch (patternData.id) {
        case 'react': {
          // Simulate ReAct pattern
          
          // Step 1: Initialize query
          const inputNode = patternData.nodes.find(n => n.type === 'input' || n.type === 'user')?.id;
          if (inputNode) {
            updateNodeStatus(inputNode, 'active');
            await wait(500);
            updateNodeStatus(inputNode, 'complete', 'User query received');
          }
          
          // Step 2: Agent reasoning
          const agentNode = patternData.nodes.find(n => n.type === 'agent')?.id;
          if (agentNode) {
            updateNodeStatus(agentNode, 'active');
            if (inputNode) {
              addDataFlow(inputNode, agentNode, 'What is the current weather in Seattle?', 'query');
            }
            await wait(1500);
            updateNodeStatus(agentNode, 'complete', 'Need to check weather data for Seattle');
          }
          
          // Step 3: Tool use
          const toolNode = patternData.nodes.find(n => n.type === 'tool')?.id;
          if (toolNode && agentNode) {
            updateNodeStatus(toolNode, 'active');
            addDataFlow(agentNode, toolNode, 'weather("Seattle")', 'tool_call');
            await wait(1800);
            updateNodeStatus(toolNode, 'complete', 'Retrieved weather data');
          }
          
          // Step 4: Observation
          const envNode = patternData.nodes.find(n => n.type === 'environment')?.id;
          if (envNode && toolNode && agentNode) {
            updateNodeStatus(envNode, 'active');
            addDataFlow(toolNode, envNode, 'Processing weather API request...', 'message');
            await wait(1000);
            addDataFlow(envNode, agentNode, '{"temp": 62, "condition": "cloudy", "humidity": 72}', 'observation');
            updateNodeStatus(envNode, 'complete', 'Weather data processed');
          }
          
          // Step 5: Final response
          const resultNode = patternData.nodes.find(n => n.type === 'output' || n.type === 'result')?.id;
          if (resultNode && agentNode) {
            updateNodeStatus(agentNode, 'active');
            await wait(1200);
            addDataFlow(agentNode, resultNode, 'Weather in Seattle is currently 62°F and cloudy with 72% humidity', 'response');
            updateNodeStatus(agentNode, 'complete', 'Generated response');
            
            updateNodeStatus(resultNode, 'active');
            await wait(800);
            updateNodeStatus(resultNode, 'complete');
            
            setOutput('Weather in Seattle is currently 62°F and cloudy with 72% humidity.');
          }
          break;
        }
        
        default: {
          // Generic flow for other patterns
          
          // Step 1: Start with input
          const inputNode = patternData.nodes.find(n => n.type === 'input' || n.type === 'user')?.id;
          if (inputNode) {
            updateNodeStatus(inputNode, 'active');
            await wait(800);
            updateNodeStatus(inputNode, 'complete', 'User query received');
          }
          
          // Process all nodes with gradual flow
          for (const node of patternData.nodes) {
            if (node.id === inputNode) continue;
            
            const incomingEdges = patternData.edges.filter(e => e.target === node.id);
            const sourceNodes = incomingEdges.map(e => e.source);
            
            // Skip if no source nodes have been processed
            const sourceNodesComplete = sourceNodes.some(id => stepsMap[id]?.status === 'complete');
            if (sourceNodes.length > 0 && !sourceNodesComplete) continue;
            
            // Process the node
            updateNodeStatus(node.id, 'active');
            
            // Show data flows for each incoming edge
            for (const edge of incomingEdges) {
              if (stepsMap[edge.source]?.status === 'complete') {
                const edgeType = (edge.label || '').toLowerCase().replace(/[^a-z_]/g, '') as DataFlowType || 'message';
                addDataFlow(edge.source, node.id, `Data flow: ${edge.source} → ${node.id}`, edgeType);
                await wait(1000);
              }
            }
            
            await wait(1500);
            updateNodeStatus(node.id, 'complete', `Processed ${node.label}`);
            
            // If this is the final node, set output
            if (!patternData.edges.some(e => e.source === node.id)) {
              setOutput(`Pattern execution completed successfully. ${node.label} generated final result.`);
            }
          }
          break;
        }
      }
      
    } catch (error) {
      console.error('Error simulating pattern flow:', error);
    } finally {
      setIsRunning(false);
      stepController.current.reset();
    }
  }, [
    patternData, 
    updateNodeStatus, 
    addDataFlow, 
    animationMode, 
    animationSpeed
  ]);
  
  // Reset the demo
  const resetDemo = useCallback(() => {
    setSteps({});
    setCurrentStepId(null);
    setOutput(null);
    setDataFlows([]);
    setIsRunning(false);
    stepController.current.reset();
  }, []);
  
  // Handle flow completion
  const handleFlowComplete = useCallback((flowId: string) => {
    // Remove completed flow from visualization
    setDataFlows(prevFlows => prevFlows.filter(flow => flow.id !== flowId));
  }, []);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xl flex items-center justify-between">
          <span>Interactive Example</span>
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="sm" 
                    variant={animationMode === 'auto' ? "default" : "outline"}
                    onClick={() => setAnimationMode('auto')}
                    disabled={isRunning}
                  >
                    Auto
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Run automatically</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="sm" 
                    variant={animationMode === 'step-by-step' ? "default" : "outline"}
                    onClick={() => setAnimationMode('step-by-step')}
                    disabled={isRunning && animationMode === 'auto'}
                    className={animationMode === 'step-by-step' ? "pulse-animation" : ""}
                  >
                    Step-by-Step
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Advance through each step manually</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardTitle>
        <CardDescription>
          See how the {patternData.name} pattern works with an interactive flow demonstration.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Flow Visualization */}
          <div 
            className="border border-border rounded-md bg-card h-[400px] relative" 
            ref={flowContainerRef}
          >
            <ReactFlowProvider>
              <EnhancedStandardFlowVisualizer
                nodes={nodes}
                edges={edges}
                flows={dataFlows}
                onFlowComplete={handleFlowComplete}
                animationSpeed={SPEED_MULTIPLIERS[animationSpeed]}
                className="w-full h-full"
                autoFitView={true}
              />
            </ReactFlowProvider>
          </div>
          
          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {!isRunning ? (
                <Button 
                  onClick={simulatePatternFlow} 
                  size="sm"
                  className="gap-1"
                >
                  <Play size={16} weight="fill" /> 
                  Start Simulation
                </Button>
              ) : (
                <Button 
                  onClick={resetDemo}
                  size="sm"
                  variant="destructive"
                  className="gap-1"
                >
                  <Stop size={16} weight="fill" /> 
                  Stop
                </Button>
              )}
              
              <Button
                onClick={resetDemo}
                size="sm"
                variant="outline"
                disabled={isRunning}
                className="gap-1"
              >
                <ArrowsClockwise size={16} /> 
                Reset
              </Button>
              
              {isWaitingForStep && animationMode === 'step-by-step' && (
                <Button
                  onClick={handleNextStep}
                  size="sm"
                  variant="secondary"
                  className="gap-1 animate-pulse"
                >
                  <ClockClockwise size={16} weight="fill" />
                  Next Step
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Speed:</span>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="sm" 
                      variant={animationSpeed === 'slow' ? "default" : "outline"}
                      onClick={() => setAnimationSpeed('slow')}
                      disabled={isRunning && animationMode === 'auto'}
                    >
                      <Snail size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Slow</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="sm" 
                      variant={animationSpeed === 'normal' ? "default" : "outline"}
                      onClick={() => setAnimationSpeed('normal')}
                      disabled={isRunning && animationMode === 'auto'}
                    >
                      <Turtle size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Normal</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="sm" 
                      variant={animationSpeed === 'fast' ? "default" : "outline"}
                      onClick={() => setAnimationSpeed('fast')}
                      disabled={isRunning && animationMode === 'auto'}
                    >
                      <Horse size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Fast</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="sm" 
                      variant={animationSpeed === 'very-fast' ? "default" : "outline"}
                      onClick={() => setAnimationSpeed('very-fast')}
                      disabled={isRunning && animationMode === 'auto'}
                    >
                      <Lightning size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Very Fast</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          {/* Steps and Results */}
          {Object.keys(steps).length > 0 && (
            <Tabs defaultValue="steps">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="steps">Execution Steps</TabsTrigger>
                <TabsTrigger value="results">Results</TabsTrigger>
              </TabsList>
              
              <TabsContent value="steps" className="space-y-4 pt-4">
                <div className="space-y-2">
                  {Object.values(steps).map((step) => {
                    const getExecutionTime = (step: StepState) => {
                      if (step.startTime && step.endTime) {
                        return `${((step.endTime - step.startTime) / 1000).toFixed(1)}s`;
                      }
                      return '';
                    };
                    
                    return (
                      <div 
                        key={step.id} 
                        className={`p-3 rounded-md border ${
                          currentStepId === step.id ? 'border-primary bg-primary/5' : 'border-border'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {step.status === 'pending' && (
                              <Badge variant="outline" className="bg-muted">Pending</Badge>
                            )}
                            {step.status === 'active' && (
                              <Badge className="bg-primary text-primary-foreground animate-pulse">Active</Badge>
                            )}
                            {step.status === 'complete' && (
                              <Badge className="bg-green-600 text-white">Complete</Badge>
                            )}
                            {step.status === 'error' && (
                              <Badge variant="destructive">Error</Badge>
                            )}
                            <span className="font-medium">{step.label}</span>
                          </div>
                          
                          {step.status === 'complete' && (
                            <Badge variant="outline" className="ml-auto">
                              {getExecutionTime(step)}
                            </Badge>
                          )}
                        </div>
                        
                        {step.result && (
                          <div className="text-sm mt-1">
                            <div className="flex items-start gap-1 text-muted-foreground">
                              <ArrowsClockwise size={14} className="mt-1" />
                              <span>{step.result}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
              
              <TabsContent value="results" className="pt-4">
                <div className="p-4 rounded-md border border-border bg-card">
                  {output ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-500">
                        <CheckCircle size={20} weight="fill" />
                        <span className="font-medium">Execution Complete</span>
                      </div>
                      <p className="text-foreground">{output}</p>
                    </div>
                  ) : (
                    <div className="text-muted-foreground flex items-center gap-2">
                      <ClockClockwise size={18} className="animate-spin" />
                      <span>Waiting for execution to complete...</span>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

export default PatternDemoReactFlow;