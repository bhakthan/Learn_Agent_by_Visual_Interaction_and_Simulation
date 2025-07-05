import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Play, ArrowsClockwise, Info, CaretDown, CaretUp, FastForward, Rewind, DotsSixVertical } from "@phosphor-icons/react";
import { PatternData } from '@/lib/data/patterns';
import { patternContents } from '@/lib/data/patternContent';
import { useTheme } from '@/components/theme/ThemeProvider';

interface SimplePatternVisualizerProps {
  patternData: PatternData;
}

interface FlowStep {
  id: string;
  nodeId: string;
  message: string;
  type: 'input' | 'processing' | 'output' | 'tool' | 'reflection';
  timestamp: number;
}

interface AnimatedEdge {
  id: string;
  from: string;
  to: string;
  progress: number;
  active: boolean;
  message?: string;
}

const SimplePatternVisualizer: React.FC<SimplePatternVisualizerProps> = ({ patternData }) => {
  const { theme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [flowSteps, setFlowSteps] = useState<FlowStep[]>([]);
  const [animatedEdges, setAnimatedEdges] = useState<AnimatedEdge[]>([]);
  const [queryInput, setQueryInput] = useState('Tell me about agent patterns');
  const [speed, setSpeed] = useState(1);
  const [activeNodes, setActiveNodes] = useState<Set<string>>(new Set());
  const [showDetails, setShowDetails] = useState(false);

  // Create layout for nodes using simple grid layout (same as SimplePatternFlow)
  const nodeLayout = useMemo(() => {
    if (!patternData.nodes) return {};
    
    const layout: Record<string, { x: number; y: number; width: number; height: number }> = {};
    const containerWidth = 1000;
    const containerHeight = 600;
    const nodeWidth = 160;
    const nodeHeight = 100;
    
    // Simple grid layout - same as SimplePatternFlow
    const cols = Math.ceil(Math.sqrt(patternData.nodes.length));
    const rows = Math.ceil(patternData.nodes.length / cols);
    
    patternData.nodes.forEach((node, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      layout[node.id] = {
        x: (col * (containerWidth / cols)) + (containerWidth / cols - nodeWidth) / 2,
        y: (row * (containerHeight / rows)) + (containerHeight / rows - nodeHeight) / 2,
        width: nodeWidth,
        height: nodeHeight
      };
    });
    
    return layout;
  }, [patternData.nodes]);

  // Generate realistic flow steps
  const generateFlowSteps = useCallback(() => {
    if (!patternData.nodes || !patternData.edges) return [];
    
    const steps: FlowStep[] = [];
    let stepId = 0;
    
    // Find entry points (nodes with no incoming edges)
    const entryNodes = patternData.nodes.filter(node => 
      !patternData.edges.some(edge => edge.target === node.id)
    );
    
    if (entryNodes.length === 0) {
      // If no clear entry point, use the first node
      entryNodes.push(patternData.nodes[0]);
    }
    
    // Create a realistic flow simulation
    const processedNodes = new Set<string>();
    const queue = [...entryNodes];
    
    // Add initial input
    entryNodes.forEach(node => {
      steps.push({
        id: `step-${stepId++}`,
        nodeId: node.id,
        message: `Input received: "${queryInput}"`,
        type: 'input',
        timestamp: Date.now() + stepId * 1000
      });
    });
    
    // Process nodes in order
    while (queue.length > 0) {
      const currentNode = queue.shift();
      if (!currentNode || processedNodes.has(currentNode.id)) continue;
      
      processedNodes.add(currentNode.id);
      
      // Add processing step
      const nodeType = currentNode.data?.nodeType || 'agent';
      const processingMessage = getProcessingMessage(nodeType, currentNode.data?.label || currentNode.id);
      
      steps.push({
        id: `step-${stepId++}`,
        nodeId: currentNode.id,
        message: processingMessage,
        type: 'processing',
        timestamp: Date.now() + stepId * 1000
      });
      
      // Find connected nodes
      const outgoingEdges = patternData.edges.filter(edge => edge.source === currentNode.id);
      outgoingEdges.forEach(edge => {
        const targetNode = patternData.nodes.find(n => n.id === edge.target);
        if (targetNode && !processedNodes.has(targetNode.id)) {
          queue.push(targetNode);
        }
      });
    }
    
    // Add final output step
    const outputNodes = patternData.nodes.filter(node => 
      !patternData.edges.some(edge => edge.source === node.id)
    );
    
    outputNodes.forEach(node => {
      steps.push({
        id: `step-${stepId++}`,
        nodeId: node.id,
        message: `Generated response based on ${patternData.name} pattern`,
        type: 'output',
        timestamp: Date.now() + stepId * 1000
      });
    });
    
    return steps;
  }, [patternData, queryInput]);

  const getProcessingMessage = (nodeType: string, label: string) => {
    const messages = {
      'input': `Processing input in ${label}`,
      'agent': `Agent ${label} analyzing request`,
      'tool': `Using tool: ${label}`,
      'memory': `Retrieving from ${label}`,
      'reflection': `Reflecting on results in ${label}`,
      'output': `Generating output from ${label}`,
      'llm': `LLM processing in ${label}`,
      'planner': `Planning next steps in ${label}`,
      'executor': `Executing actions in ${label}`
    };
    
    return messages[nodeType] || `Processing in ${label}`;
  };

  // Start simulation
  const startSimulation = useCallback(() => {
    setIsAnimating(true);
    setCurrentStep(0);
    setActiveNodes(new Set());
    const steps = generateFlowSteps();
    setFlowSteps(steps);
    
    // Create animated edges
    const edges = patternData.edges?.map(edge => ({
      id: edge.id,
      from: edge.source,
      to: edge.target,
      progress: 0,
      active: false,
      message: (typeof edge.label === 'string' ? edge.label : '') || 'data flow'
    })) || [];
    
    setAnimatedEdges(edges);
    
    // Execute steps with timing
    let stepIndex = 0;
    const executeStep = () => {
      if (stepIndex >= steps.length) {
        setIsAnimating(false);
        setActiveNodes(new Set());
        return;
      }
      
      const step = steps[stepIndex];
      setCurrentStep(stepIndex);
      setActiveNodes(prev => new Set([...prev, step.nodeId]));
      
      // Animate edges from this node
      const nodeEdges = edges.filter(edge => edge.from === step.nodeId);
      nodeEdges.forEach(edge => {
        setAnimatedEdges(prev => prev.map(e => 
          e.id === edge.id ? { ...e, active: true, progress: 0 } : e
        ));
        
        // Animate edge progress
        let progress = 0;
        const animateEdge = () => {
          progress += 0.05;
          if (progress <= 1) {
            setAnimatedEdges(prev => prev.map(e => 
              e.id === edge.id ? { ...e, progress } : e
            ));
            setTimeout(animateEdge, 30 / speed);
          } else {
            setAnimatedEdges(prev => prev.map(e => 
              e.id === edge.id ? { ...e, active: false, progress: 1 } : e
            ));
          }
        };
        setTimeout(animateEdge, 200);
      });
      
      stepIndex++;
      setTimeout(executeStep, 2000 / speed);
    };
    
    executeStep();
  }, [patternData, generateFlowSteps, speed]);

  // Reset simulation
  const resetVisualization = useCallback(() => {
    setIsAnimating(false);
    setCurrentStep(0);
    setFlowSteps([]);
    setAnimatedEdges([]);
    setActiveNodes(new Set());
  }, []);

  // Create SVG path for edges - same as SimplePatternFlow
  const createEdgePath = (fromId: string, toId: string) => {
    const fromLayout = nodeLayout[fromId];
    const toLayout = nodeLayout[toId];
    
    if (!fromLayout || !toLayout) return '';
    
    const fromX = fromLayout.x + fromLayout.width / 2;
    const fromY = fromLayout.y + fromLayout.height / 2;
    const toX = toLayout.x + toLayout.width / 2;
    const toY = toLayout.y + toLayout.height / 2;
    
    // Simple curved path
    const midX = (fromX + toX) / 2;
    const midY = (fromY + toY) / 2;
    const controlY = midY - 30;
    
    return `M ${fromX} ${fromY} Q ${midX} ${controlY} ${toX} ${toY}`;
  };

  // Get node colors based on type and theme
  const getNodeColors = (nodeType: string, isActive: boolean) => {
    const colors = {
      light: {
        input: { bg: '#f0f9ff', border: '#0ea5e9', text: '#0c4a6e' },
        agent: { bg: '#f0fdf4', border: '#22c55e', text: '#14532d' },
        tool: { bg: '#fffbeb', border: '#f59e0b', text: '#92400e' },
        memory: { bg: '#f5f3ff', border: '#8b5cf6', text: '#581c87' },
        output: { bg: '#fdf2f8', border: '#ec4899', text: '#be185d' },
        llm: { bg: '#faf5ff', border: '#a855f7', text: '#6b21a8' },
        reflection: { bg: '#fef2f2', border: '#ef4444', text: '#991b1b' },
        default: { bg: '#ffffff', border: '#6b7280', text: '#374151' }
      },
      dark: {
        input: { bg: '#0c4a6e', border: '#0ea5e9', text: '#bae6fd' },
        agent: { bg: '#14532d', border: '#22c55e', text: '#bbf7d0' },
        tool: { bg: '#92400e', border: '#f59e0b', text: '#fed7aa' },
        memory: { bg: '#581c87', border: '#8b5cf6', text: '#e9d5ff' },
        output: { bg: '#be185d', border: '#ec4899', text: '#fce7f3' },
        llm: { bg: '#6b21a8', border: '#a855f7', text: '#f3e8ff' },
        reflection: { bg: '#991b1b', border: '#ef4444', text: '#fecaca' },
        default: { bg: '#374151', border: '#6b7280', text: '#f3f4f6' }
      }
    };
    
    const themeColors = colors[theme === 'dark' ? 'dark' : 'light'];
    const nodeColors = themeColors[nodeType] || themeColors.default;
    
    if (isActive) {
      return {
        bg: theme === 'dark' ? '#1d4ed8' : '#3b82f6',
        border: theme === 'dark' ? '#60a5fa' : '#1d4ed8',
        text: '#ffffff'
      };
    }
    
    return nodeColors;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>{patternData.name}</span>
            <Badge variant="outline">{patternData.id}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSpeed(s => s === 0.5 ? 1 : s === 1 ? 2 : 0.5)}
            >
              {speed === 0.5 ? <Rewind size={14} /> : speed === 2 ? <FastForward size={14} /> : 'Normal'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetVisualization}
              disabled={isAnimating}
            >
              <ArrowsClockwise size={14} />
              Reset
            </Button>
            <Button
              size="sm"
              onClick={startSimulation}
              disabled={isAnimating}
            >
              <Play size={14} />
              {isAnimating ? 'Running...' : 'Start Simulation'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Enter your query to see how the pattern processes it..."
              disabled={isAnimating}
            />
          </div>
          
          <div className="relative border rounded-lg p-4 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm" style={{ height: '700px' }}>
            <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none">
              {/* Render edges */}
              {patternData.edges?.map(edge => {
                const animatedEdge = animatedEdges.find(ae => ae.id === edge.id);
                const path = createEdgePath(edge.source, edge.target);
                
                if (!path) return null;
                
                return (
                  <g key={edge.id}>
                    {/* Base edge */}
                    <path
                      d={path}
                      fill="none"
                      stroke={theme === 'dark' ? '#374151' : '#d1d5db'}
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                    />
                    {/* Animated edge */}
                    {animatedEdge?.active && (
                      <path
                        d={path}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3"
                        strokeDasharray="10,5"
                        strokeDashoffset={-animatedEdge.progress * 50}
                        opacity={0.8}
                        markerEnd="url(#arrowhead-active)"
                      />
                    )}
                  </g>
                );
              })}
              
              {/* Arrow markers */}
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill={theme === 'dark' ? '#374151' : '#d1d5db'} />
                </marker>
                <marker id="arrowhead-active" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                </marker>
              </defs>
            </svg>
            
            {/* Render nodes */}
            {patternData.nodes?.map(node => {
              const layout = nodeLayout[node.id];
              const isActive = activeNodes.has(node.id);
              const nodeType = node.data?.nodeType || 'default';
              const colors = getNodeColors(nodeType, isActive);
              
              return (
                <div
                  key={node.id}
                  className="absolute rounded-xl border-2 p-4 transition-all duration-300 cursor-pointer hover:shadow-xl shadow-md"
                  style={{
                    left: layout.x,
                    top: layout.y,
                    width: layout.width,
                    height: layout.height,
                    backgroundColor: colors.bg,
                    borderColor: colors.border,
                    color: colors.text,
                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                    zIndex: isActive ? 10 : 1,
                    boxShadow: isActive 
                      ? '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' 
                      : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                >
                  <div className="font-semibold text-base mb-2 leading-tight">
                    {node.data?.label || node.id}
                  </div>
                  <div className="text-sm opacity-75 mb-2 capitalize font-medium">
                    {nodeType}
                  </div>
                  {node.data?.description && (
                    <div className="text-sm opacity-70 line-clamp-2 leading-relaxed">
                      {node.data.description}
                    </div>
                  )}
                  {isActive && (
                    <>
                      <div className="absolute top-2 right-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                      </div>
                      <div className="absolute inset-0 rounded-xl border-2 border-blue-400 animate-pulse opacity-50 pointer-events-none" />
                    </>
                  )}
                </div>
              );
            })}
            
            {/* Status indicator */}
            <div className="absolute bottom-2 left-2 right-2 text-center">
              <div className="inline-flex items-center gap-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm shadow-sm border border-gray-200 dark:border-gray-700">
                <DotsSixVertical size={14} className="text-gray-500 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  {isAnimating ? 
                    `Processing step ${currentStep + 1} of ${flowSteps.length}...` : 
                    'Click "Start Simulation" to see how the pattern processes your query'
                  }
                </span>
              </div>
            </div>
          </div>
          
          {/* Pattern description */}
          <Collapsible open={showDetails} onOpenChange={setShowDetails}>
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">{patternData.description}</p>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Info size={14} />
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
          
          {/* Flow steps log */}
          {flowSteps.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Execution Log:</h4>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {flowSteps.slice(0, currentStep + 1).map((step, index) => (
                  <div 
                    key={step.id}
                    className={`text-sm p-2 rounded flex items-center gap-2 ${
                      index === currentStep 
                        ? 'bg-blue-100 dark:bg-blue-900/20' 
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}
                  >
                    <Badge variant="outline" className="text-sm">
                      {step.type}
                    </Badge>
                    <span>{step.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Pattern advantages and limitations */}
          {patternContents.find(p => p.id === patternData.id) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <h4 className="font-medium text-green-600 dark:text-green-400 mb-2 flex items-center gap-1">
                  <Play size={14} /> Key Advantages
                </h4>
                <ul className="text-sm space-y-1">
                  {patternContents.find(p => p.id === patternData.id)?.advantages.slice(0, 3).map((advantage, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>{advantage}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1">
                  <Info size={14} /> Limitations
                </h4>
                <ul className="text-sm space-y-1">
                  {patternContents.find(p => p.id === patternData.id)?.limitations.slice(0, 3).map((limitation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-amber-500 mt-1">•</span>
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
  );
};

export default SimplePatternVisualizer;
