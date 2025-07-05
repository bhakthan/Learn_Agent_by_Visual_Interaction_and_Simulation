import React, { useState, useCallback, useMemo, memo, useEffect } from 'react';
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
  Circle,
  CircleNotch, 
  Horse, 
  Rabbit 
} from "@phosphor-icons/react";
import { useTheme } from '@/components/theme/ThemeProvider';

// Types
interface PatternDemoSVGProps {
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

// Node layout logic - similar to SimplePatternFlow
const calculateNodePositions = (nodes: any[], edges: any[]) => {
  const positions: { [key: string]: { x: number; y: number } } = {};
  
  if (nodes.length === 0) return positions;
  
  // Grid layout with better spacing
  const cols = Math.min(3, Math.ceil(Math.sqrt(nodes.length)));
  const rows = Math.ceil(nodes.length / cols);
  
  // Calculate spacing
  const nodeWidth = 120;
  const nodeHeight = 60;
  const horizontalSpacing = 180;
  const verticalSpacing = 120;
  
  // Calculate total dimensions
  const totalWidth = (cols - 1) * horizontalSpacing + nodeWidth;
  const totalHeight = (rows - 1) * verticalSpacing + nodeHeight;
  
  // Center the grid
  const startX = (600 - totalWidth) / 2;
  const startY = (400 - totalHeight) / 2;
  
  nodes.forEach((node, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    
    positions[node.id] = {
      x: startX + col * horizontalSpacing,
      y: startY + row * verticalSpacing
    };
  });
  
  return positions;
};

/**
 * PatternDemoSVG - SVG-based replacement for PatternDemoReactFlow
 * Provides interactive pattern visualization without ReactFlow dependencies
 */
export const PatternDemoSVG = memo(({ patternData, className }: PatternDemoSVGProps) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // State
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<Record<string, StepState>>({});
  const [currentStepId, setCurrentStepId] = useState<string | null>(null);
  const [output, setOutput] = useState<string | null>(null);
  const [animationSpeed, setAnimationSpeed] = useState<'slow' | 'normal' | 'fast' | 'very-fast'>('normal');
  const [animationMode, setAnimationMode] = useState<'auto' | 'step-by-step'>('auto');
  const [isWaitingForStep, setIsWaitingForStep] = useState(false);
  const [activeEdges, setActiveEdges] = useState<Set<string>>(new Set());
  
  // Calculate positions
  const nodePositions = useMemo(() => {
    return calculateNodePositions(patternData.nodes, patternData.edges);
  }, [patternData.nodes, patternData.edges]);
  
  // Theme colors
  const colors = useMemo(() => ({
    node: {
      default: isDarkMode ? '#374151' : '#f3f4f6',
      active: isDarkMode ? '#3b82f6' : '#2563eb',
      complete: isDarkMode ? '#10b981' : '#059669',
      error: isDarkMode ? '#ef4444' : '#dc2626',
      border: isDarkMode ? '#6b7280' : '#d1d5db',
      text: isDarkMode ? '#f9fafb' : '#111827'
    },
    edge: {
      default: isDarkMode ? '#6b7280' : '#9ca3af',
      active: isDarkMode ? '#3b82f6' : '#2563eb',
      complete: isDarkMode ? '#10b981' : '#059669'
    }
  }), [isDarkMode]);
  
  // Get node color based on status
  const getNodeColor = useCallback((nodeId: string) => {
    const step = steps[nodeId];
    if (!step) return colors.node.default;
    
    switch (step.status) {
      case 'active': return colors.node.active;
      case 'complete': return colors.node.complete;
      case 'error': return colors.node.error;
      default: return colors.node.default;
    }
  }, [steps, colors.node]);
  
  // Get edge color based on status
  const getEdgeColor = useCallback((edgeId: string) => {
    return activeEdges.has(edgeId) ? colors.edge.active : colors.edge.default;
  }, [activeEdges, colors.edge]);
  
  // Update node status
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
  
  // Simulate pattern execution
  const simulatePatternFlow = useCallback(async () => {
    // Reset state
    setSteps({});
    setCurrentStepId(null);
    setOutput(null);
    setActiveEdges(new Set());
    
    setIsRunning(true);
    
    try {
      // Create a map of steps
      const stepsMap = patternData.nodes.reduce<Record<string, StepState>>((acc, node) => {
        acc[node.id] = {
          id: node.id,
          node: node.id,
          label: node.data.label,
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
          // Step-by-step mode - wait for user input
          const waitForStep = () => {
            setIsWaitingForStep(true);
            const checkForAdvance = () => {
              if (!isWaitingForStep) {
                resolve(undefined);
              } else {
                setTimeout(checkForAdvance, 100);
              }
            };
            checkForAdvance();
          };
          waitForStep();
        }
      });
      
      // Simulate execution through nodes in order
      for (let i = 0; i < patternData.nodes.length; i++) {
        const node = patternData.nodes[i];
        
        // Activate current node
        updateNodeStatus(node.id, 'active');
        
        // Find and activate incoming edges
        const incomingEdges = patternData.edges.filter(edge => edge.target === node.id);
        setActiveEdges(prev => new Set([...prev, ...incomingEdges.map(e => e.id)]));
        
        await wait(1000);
        
        // Generate result based on node type
        let result = '';
        switch (node.data.nodeType) {
          case 'input':
            result = 'Query received and processed';
            break;
          case 'llm':
            result = 'LLM processing complete';
            break;
          case 'tool':
            result = 'Tool execution finished';
            break;
          case 'output':
            result = 'Final output generated';
            break;
          default:
            result = 'Processing complete';
        }
        
        // Complete current node
        updateNodeStatus(node.id, 'complete', result);
        
        await wait(500);
      }
      
      // Set final output
      setOutput(`${patternData.name} pattern execution completed successfully. All ${patternData.nodes.length} steps processed.`);
      
    } catch (error) {
      console.error('Simulation failed:', error);
      setOutput('Simulation failed with an error.');
    } finally {
      setIsRunning(false);
      setIsWaitingForStep(false);
    }
  }, [patternData, animationSpeed, animationMode, updateNodeStatus, isWaitingForStep]);
  
  // Reset demo
  const resetDemo = useCallback(() => {
    setIsRunning(false);
    setSteps({});
    setCurrentStepId(null);
    setOutput(null);
    setActiveEdges(new Set());
    setIsWaitingForStep(false);
  }, []);
  
  // Handle step advancement
  const handleNextStep = useCallback(() => {
    setIsWaitingForStep(false);
  }, []);
  
  // Effect to handle step advancement
  useEffect(() => {
    if (isWaitingForStep && animationMode === 'step-by-step') {
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          handleNextStep();
        }
      };
      
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [isWaitingForStep, animationMode, handleNextStep]);
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{patternData.name} Interactive Demo</span>
          <div className="flex items-center gap-2">
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
          {/* SVG Visualization */}
          <div className="border border-border rounded-md bg-card h-[400px] relative overflow-hidden">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 600 400"
              className="w-full h-full"
            >
              {/* Define gradients and patterns */}
              <defs>
                <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={colors.node.default} />
                  <stop offset="100%" stopColor={colors.node.border} />
                </linearGradient>
                
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill={colors.edge.default}
                  />
                </marker>
                
                <marker
                  id="arrowhead-active"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill={colors.edge.active}
                  />
                </marker>
              </defs>
              
              {/* Render edges */}
              {patternData.edges.map((edge) => {
                const sourcePos = nodePositions[edge.source];
                const targetPos = nodePositions[edge.target];
                
                if (!sourcePos || !targetPos) return null;
                
                const isActive = activeEdges.has(edge.id);
                
                // Calculate edge path
                const dx = targetPos.x - sourcePos.x;
                const dy = targetPos.y - sourcePos.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Offset for node size
                const nodeRadius = 30;
                const offsetX = (dx / distance) * nodeRadius;
                const offsetY = (dy / distance) * nodeRadius;
                
                const startX = sourcePos.x + 60 + offsetX;
                const startY = sourcePos.y + 30 + offsetY;
                const endX = targetPos.x + 60 - offsetX;
                const endY = targetPos.y + 30 - offsetY;
                
                // Create curved path
                const midX = (startX + endX) / 2;
                const midY = (startY + endY) / 2;
                const controlX = midX + (startY - endY) * 0.2;
                const controlY = midY + (endX - startX) * 0.2;
                
                const path = `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
                
                return (
                  <g key={edge.id}>
                    <path
                      d={path}
                      stroke={getEdgeColor(edge.id)}
                      strokeWidth="2"
                      fill="none"
                      markerEnd={isActive ? "url(#arrowhead-active)" : "url(#arrowhead)"}
                      className={isActive ? "animate-pulse" : ""}
                    />
                    {edge.label && (
                      <text
                        x={midX}
                        y={midY - 5}
                        textAnchor="middle"
                        className="text-xs fill-current"
                        fill={colors.node.text}
                      >
                        {edge.label}
                      </text>
                    )}
                  </g>
                );
              })}
              
              {/* Render nodes */}
              {patternData.nodes.map((node) => {
                const pos = nodePositions[node.id];
                if (!pos) return null;
                
                const nodeColor = getNodeColor(node.id);
                const isActive = currentStepId === node.id;
                
                return (
                  <g key={node.id}>
                    <rect
                      x={pos.x}
                      y={pos.y}
                      width="120"
                      height="60"
                      rx="8"
                      fill={nodeColor}
                      stroke={colors.node.border}
                      strokeWidth="2"
                      className={isActive ? "animate-pulse" : ""}
                    />
                    <text
                      x={pos.x + 60}
                      y={pos.y + 30}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-sm font-medium fill-current"
                      fill={colors.node.text}
                    >
                      {node.data.label}
                    </text>
                    {steps[node.id] && (
                      <text
                        x={pos.x + 60}
                        y={pos.y + 45}
                        textAnchor="middle"
                        className="text-xs fill-current"
                        fill={colors.node.text}
                      >
                        {steps[node.id].status}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
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
                      <Circle size={16} />
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
                      <CircleNotch size={16} />
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

export default PatternDemoSVG;
