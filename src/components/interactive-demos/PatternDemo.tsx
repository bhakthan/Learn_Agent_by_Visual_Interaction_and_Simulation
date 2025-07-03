import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { PatternData } from '@/lib/data/patterns';
import { Play, ArrowsClockwise, CheckCircle, Clock, WarningCircle, ArrowBendDownRight } from "@phosphor-icons/react";
import { useTheme } from '@/components/theme/ThemeProvider';
import { ReactFlowProvider } from 'reactflow';
import { StableFlowContainer } from '../visualization/StableFlowContainer';
import StandardFlowVisualizerWithProvider from '../visualization/StandardFlowVisualizer';

// Simple step controller class
class StepController {
  private waitingCallback: (() => void) | null = null;
  private isWaiting = false;
  
  constructor(private onWaitingChange: (isWaiting: boolean) => void) {}
  
  waitForNextStep(callback: () => void) {
    this.waitingCallback = callback;
    this.isWaiting = true;
    this.onWaitingChange(true);
  }
  
  advanceToNextStep() {
    if (this.waitingCallback) {
      const callback = this.waitingCallback;
      this.waitingCallback = null;
      this.isWaiting = false;
      this.onWaitingChange(false);
      callback();
    }
  }
  
  stop() {
    this.waitingCallback = null;
    this.isWaiting = false;
    this.onWaitingChange(false);
  }
}

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

// Create a DragHint component that shows a helpful message when nodes are dragged
const DragHint = React.memo(() => {
  const [showDragHint, setShowDragHint] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDragHint(false);
    }, 6000); // Auto-hide after 6 seconds
    
    return () => clearTimeout(timer);
  }, []);

  if (!showDragHint) return null;

  return (
    <div 
      className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-background/90 border border-border px-4 py-2 rounded-full shadow-md z-10 animate-fade-in flex items-center"
      style={{ backdropFilter: 'blur(4px)' }}
    >
      <div className="mr-2 text-primary">👆</div>
      <div className="text-sm">Nodes are draggable! Try moving them around</div>
      <button 
        className="ml-2 text-muted-foreground hover:text-foreground"
        onClick={() => setShowDragHint(false)}
      >
        ✕
      </button>
    </div>
  );
});

// Custom node component
const CustomDemoNode = React.memo(({ data, id }: { data: any, id: string }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // Basic node styling
  const getNodeStyle = () => {
    const baseStyle = {
      padding: '10px 20px',
      borderRadius: '8px',
      transition: 'all 0.2s ease',
      width: '180px',
      color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
      cursor: 'grab',
      position: 'relative',
      zIndex: 1,
      display: 'block',
      visibility: 'visible',
      transform: 'translateZ(0)',
      boxShadow: '0 0 0 1px var(--border)',
      backgroundColor: isDarkMode ? 'var(--card)' : 'white',
      opacity: 1,
    };
    
    // Add status-specific styling
    const statusStyle = data.status === 'running' ? {
      boxShadow: `0 0 0 2px var(--primary), 0 0 15px ${isDarkMode ? 'rgba(66, 153, 225, 0.3)' : 'rgba(66, 153, 225, 0.5)'}`,
    } : data.status === 'complete' ? {
      boxShadow: `0 0 0 2px ${isDarkMode ? 'rgba(16, 185, 129, 0.8)' : 'rgba(16, 185, 129, 0.6)'}`,
    } : data.status === 'failed' ? {
      boxShadow: `0 0 0 2px ${isDarkMode ? 'rgba(239, 68, 68, 0.8)' : 'rgba(239, 68, 68, 0.6)'}`,
    } : {};
    
    // Apply type-specific and status-specific styling
    switch(data.nodeType) {
      case 'input':
        return { 
          ...baseStyle, 
          backgroundColor: isDarkMode ? 'rgba(51, 65, 85, 0.8)' : 'rgb(226, 232, 240)', 
          border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.8)' : 'rgb(203, 213, 225)'}`, 
          ...statusStyle 
        };
      case 'llm':
        return { 
          ...baseStyle, 
          backgroundColor: isDarkMode ? 'rgba(30, 58, 138, 0.4)' : 'rgb(219, 234, 254)', 
          border: `1px solid ${isDarkMode ? 'rgba(59, 130, 246, 0.5)' : 'rgb(147, 197, 253)'}`, 
          ...statusStyle 
        };
      case 'output':
        return { 
          ...baseStyle, 
          backgroundColor: isDarkMode ? 'rgba(20, 83, 45, 0.4)' : 'rgb(220, 252, 231)', 
          border: `1px solid ${isDarkMode ? 'rgba(34, 197, 94, 0.5)' : 'rgb(134, 239, 172)'}`, 
          ...statusStyle 
        };
      default:
        return { 
          ...baseStyle, 
          backgroundColor: isDarkMode ? 'rgba(51, 65, 85, 0.6)' : 'white', 
          border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.6)' : 'rgb(226, 232, 240)'}`, 
          ...statusStyle 
        };
    }
  };

  // Calculate the truncated result text
  const resultText = data.result ? 
    (data.result.length > 40 ? `${data.result.substring(0, 40)}...` : data.result) : 
    null;
  
  // Force visibility of node
  useEffect(() => {
    const nodeElement = document.querySelector(`[data-id="${id}"]`);
    if (nodeElement instanceof HTMLElement) {
      nodeElement.style.opacity = '1';
      nodeElement.style.visibility = 'visible';
      nodeElement.style.display = 'block';
    }
  }, [id]);

  return (
    <div style={getNodeStyle()}>
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
    </div>
  );
});

const PatternDemo = React.memo(({ patternData }: PatternDemoProps) => {
  // Ensure patternData exists to prevent errors
  if (!patternData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Demo Unavailable</CardTitle>
          <CardDescription>Pattern data is missing or invalid</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              The pattern demo cannot be loaded due to missing data. Please try a different pattern.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const { theme } = useTheme();
  const [userInput, setUserInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [steps, setSteps] = useState<Record<string, StepState>>({});
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [dataFlows, setDataFlows] = useState<DataFlowMessage[]>([]);
  const [waitingForNextStep, setWaitingForNextStep] = useState<boolean>(false);
  const [iterations, setIterations] = useState<number>(0);
  const [animationSpeed, setAnimationSpeed] = useState<number>(1); // Default to normal speed (1x)
  const [animationMode, setAnimationMode] = useState<'auto' | 'step-by-step'>('auto'); 
  
  // Prepare nodes and edges for visualization
  const demoNodes = patternData.nodes?.map(node => ({
    ...node,
    type: 'demoNode',
    data: {
      ...node.data,
      status: 'idle',
    },
    draggable: true,
    selectable: true,
    style: { opacity: 1, visibility: 'visible' },
  })) || [];
  
  const demoEdges = patternData.edges?.map(edge => ({
    ...edge,
    animated: false,
    style: { opacity: 1, visibility: 'visible' },
  })) || [];
  
  // Step controller for managing execution flow
  const stepControllerRef = useRef<StepController | null>(null);
  
  // Initialize step controller
  useEffect(() => {
    stepControllerRef.current = new StepController((isWaiting) => {
      setWaitingForNextStep(isWaiting);
    });
    
    return () => {
      if (stepControllerRef.current) {
        stepControllerRef.current.stop();
      }
    };
  }, []);
  
  // Flow container ref
  const flowContainerRef = useRef<HTMLDivElement>(null);
  
  // Reset the demo state
  const resetDemo = useCallback(() => {
    setIsRunning(false);
    setOutput(null);
    setSteps({});
    setCurrentNodeId(null);
    setDataFlows([]);
    setIterations(0);
    setWaitingForNextStep(false);
  }, []);

  // Update node status in the visualization
  const updateNodeStatus = useCallback((nodeId: string, status: 'idle' | 'running' | 'complete' | 'failed', result?: string) => {
    setDataFlows(prev => {
      // If the node is complete, also complete any flows targeting it
      if (status === 'complete') {
        return prev.map(flow => 
          flow.target === nodeId ? { ...flow, progress: 1 } : flow
        );
      }
      return prev;
    });
    
    // Update the step state
    setSteps(prev => ({
      ...prev,
      [nodeId]: { 
        ...prev[nodeId], 
        status, 
        result,
        endTime: status === 'complete' || status === 'failed' ? Date.now() : undefined
      }
    }));
  }, []);
  
  // Helper function for step-by-step control
  const waitForNextStep = useCallback(async () => {
    if (!stepControllerRef.current) return;
    
    setWaitingForNextStep(true);
    return new Promise<void>(resolve => {
      stepControllerRef.current?.waitForNextStep(() => {
        resolve();
      });
    });
  }, []);
  
  // Create a data flow between nodes
  const createDataFlow = useCallback((source: string, target: string, content: string, type: 'message' | 'data' | 'response' | 'error') => {
    const id = `flow-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const edgeId = `${source}-${target}`;
    
    const flow: DataFlowMessage = {
      id,
      edgeId,
      source,
      target,
      content,
      timestamp: Date.now(),
      type,
      progress: 0
    };
    
    setDataFlows(prev => [...prev, flow]);
  }, []);

  // Process node based on type
  const processNode = async (nodeId: string) => {
    if (!patternData || !Array.isArray(patternData.nodes) || !Array.isArray(patternData.edges)) {
      throw new Error('Invalid pattern data');
    }
    
    // Mark node as running
    setCurrentNodeId(nodeId);
    setSteps(prev => ({
      ...prev,
      [nodeId]: { ...prev[nodeId], status: 'running', startTime: Date.now() }
    }));
    
    // Increment iterations counter
    setIterations(prev => prev + 1);
    
    // Update node status in visualization
    updateNodeStatus(nodeId, 'running');
    
    try {
      const node = patternData.nodes.find(n => n.id === nodeId);
      if (!node) throw new Error(`Node ${nodeId} not found`);
      
      // Process node based on type
      let result = '';
      
      if (node.data.nodeType === 'input') {
        result = `Processing input: "${userInput}"`;
        await new Promise(resolve => setTimeout(resolve, 500 / animationSpeed));
      } else if (node.data.nodeType === 'llm') {
        result = await generateMockResponse(userInput, patternData.id);
      } else {
        result = `Processed by ${node.data?.label || nodeId}`;
        await new Promise(resolve => setTimeout(resolve, 700 / animationSpeed));
      }
      
      // Mark node as complete
      updateNodeStatus(nodeId, 'complete', result);
      
      // If output node, set final output
      if (node.data.nodeType === 'output') {
        setOutput(result);
        return;
      }
      
      // Find next nodes
      const outgoingEdges = patternData.edges.filter(edge => edge.source === nodeId);
      
      // Process next nodes sequentially
      for (const edge of outgoingEdges) {
        // Create data flow visualization
        createDataFlow(
          edge.source,
          edge.target,
          result,
          node.data?.nodeType === 'llm' ? 'response' : 'message'
        );
        
        // Wait proportionally to the animation speed
        await new Promise(resolve => setTimeout(resolve, 800 / animationSpeed));
        
        // If step-by-step mode is active, wait for user to click "Next Step" button
        if (animationMode === 'step-by-step' && stepControllerRef.current) {
          await waitForNextStep();
        }
        
        // Process target node
        await processNode(edge.target);
      }
    } catch (error) {
      console.error(`Error processing node ${nodeId}:`, error);
      
      // Mark node as failed
      updateNodeStatus(nodeId, 'failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  // Run the demo
  const runDemo = async () => {
    if (!userInput.trim() || isRunning || !patternData || !Array.isArray(patternData.nodes)) return;
    
    resetDemo();
    setIsRunning(true);
    
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
      
      setIsRunning(false);
      setWaitingForNextStep(false);
    } catch (error) {
      console.error('Error in demo:', error);
      setIsRunning(false);
      setWaitingForNextStep(false);
      setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Calculate execution time for a step
  const getExecutionTime = (step: StepState) => {
    if (step.startTime && step.endTime) {
      return ((step.endTime - step.startTime) / 1000).toFixed(1) + 's';
    }
    return '';
  };

  // Define nodeTypes for ReactFlow
  const nodeTypes = {
    demoNode: CustomDemoNode
  };

  // Flow completion handler
  const handleFlowComplete = useCallback((flowId: string) => {
    setDataFlows(prev => prev.filter(flow => flow.id !== flowId));
  }, []);

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
                  if (waitingForNextStep && stepControllerRef.current) {
                    stepControllerRef.current.advanceToNextStep();
                  }
                }}
                disabled={isRunning && !waitingForNextStep}
              >
                Auto
              </Button>
              <Button 
                size="sm"
                variant={animationMode === 'step-by-step' ? "default" : "outline"}
                onClick={() => setAnimationMode('step-by-step')}
                disabled={isRunning && !waitingForNextStep}
              >
                Step-by-Step
              </Button>
              {waitingForNextStep && (
                <Button 
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    if (stepControllerRef.current) {
                      stepControllerRef.current.advanceToNextStep();
                    }
                  }}
                  className="pulse-animation"
                >
                  Next Step
                </Button>
              )}
            </div>
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
                Iterations: {iterations || 0}
              </span>
            </div>
          </div>
          
          {/* Flow visualization with stabilized container */}
          <ReactFlowProvider>
            <StableFlowContainer
              ref={flowContainerRef}
              className="border border-border rounded-md overflow-hidden relative"
              style={{ height: '400px', minHeight: '400px' }}
            >
              <DragHint />
              <StandardFlowVisualizerWithProvider
                nodes={demoNodes}
                edges={demoEdges}
                flows={dataFlows}
                onFlowComplete={handleFlowComplete}
                animationSpeed={animationSpeed}
                nodeTypes={nodeTypes}
                showControls={true}
                autoFitView={true}
              />
            </StableFlowContainer>
          </ReactFlowProvider>
          
          {Object.keys(steps).length > 0 && (
            <>
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Execution Log</h3>
                
                <div className="space-y-3">
                  {Array.isArray(patternData?.nodes) && patternData.nodes.map((node) => {
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
                            
                            <span className="font-medium">{node.data?.label || 'Unknown Node'}</span>
                            
                            <Badge variant="outline" className="ml-1">
                              {node.data?.nodeType || 'node'}
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
                  <AlertDescription>
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
});

export default PatternDemo;