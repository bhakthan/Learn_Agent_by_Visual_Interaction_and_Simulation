import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Play, ArrowsCounterClockwise, FastForward, Rewind, User, Users } from "@phosphor-icons/react";
import { useTheme } from '@/components/theme/ThemeProvider';

interface Message {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: string;
  type: 'query' | 'response' | 'reflection' | 'tool_call';
}

interface ACPNode {
  id: string;
  label: string;
  type: 'user' | 'agent' | 'model' | 'tool';
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ACPEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  active?: boolean;
  progress?: number;
}

const SimpleACPDemo = () => {
  const { theme } = useTheme();
  const [activeDemo, setActiveDemo] = useState<'single' | 'multi'>('single');
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('Analyze recent tech trends and create a market report');
  const [speed, setSpeed] = useState(1);
  const [activeNodes, setActiveNodes] = useState<Set<string>>(new Set());
  const [animatedEdges, setAnimatedEdges] = useState<ACPEdge[]>([]);

  // Single agent configuration - improved node sizes
  const singleAgentNodes: ACPNode[] = useMemo(() => [
    { id: 'user', label: 'User', type: 'user', x: 50, y: 200, width: 180, height: 120 },
    { id: 'agent', label: 'ReAct Agent', type: 'agent', x: 280, y: 200, width: 180, height: 120 },
    { id: 'model', label: 'LLM', type: 'model', x: 510, y: 120, width: 180, height: 120 },
    { id: 'tool', label: 'Tools', type: 'tool', x: 510, y: 280, width: 180, height: 120 },
  ], []);

  const singleAgentEdges: ACPEdge[] = useMemo(() => [
    { id: 'user-agent', from: 'user', to: 'agent', label: 'Query' },
    { id: 'agent-model', from: 'agent', to: 'model', label: 'Reasoning' },
    { id: 'model-agent', from: 'model', to: 'agent', label: 'Response' },
    { id: 'agent-tool', from: 'agent', to: 'tool', label: 'Action' },
    { id: 'tool-agent', from: 'tool', to: 'agent', label: 'Observation' },
    { id: 'agent-user', from: 'agent', to: 'user', label: 'Result' },
  ], []);

  // Multi-agent configuration - improved node sizes
  const multiAgentNodes: ACPNode[] = useMemo(() => [
    { id: 'user', label: 'User', type: 'user', x: 50, y: 250, width: 160, height: 110 },
    { id: 'coordinator', label: 'Coordinator', type: 'agent', x: 230, y: 250, width: 160, height: 110 },
    { id: 'researcher', label: 'Researcher', type: 'agent', x: 410, y: 150, width: 160, height: 110 },
    { id: 'analyst', label: 'Analyst', type: 'agent', x: 410, y: 350, width: 160, height: 110 },
    { id: 'writer', label: 'Writer', type: 'agent', x: 590, y: 250, width: 160, height: 110 },
    { id: 'tools', label: 'Tools/APIs', type: 'tool', x: 770, y: 200, width: 160, height: 160 },
  ], []);

  const multiAgentEdges: ACPEdge[] = useMemo(() => [
    { id: 'user-coord', from: 'user', to: 'coordinator', label: 'Request' },
    { id: 'coord-researcher', from: 'coordinator', to: 'researcher', label: 'Research Task' },
    { id: 'coord-analyst', from: 'coordinator', to: 'analyst', label: 'Analysis Task' },
    { id: 'researcher-tools', from: 'researcher', to: 'tools', label: 'Data Query' },
    { id: 'tools-researcher', from: 'tools', to: 'researcher', label: 'Data' },
    { id: 'researcher-coord', from: 'researcher', to: 'coordinator', label: 'Research Results' },
    { id: 'analyst-coord', from: 'analyst', to: 'coordinator', label: 'Analysis Results' },
    { id: 'coord-writer', from: 'coordinator', to: 'writer', label: 'Write Task' },
    { id: 'writer-coord', from: 'writer', to: 'coordinator', label: 'Draft Report' },
    { id: 'coord-user', from: 'coordinator', to: 'user', label: 'Final Report' },
  ], []);

  // Get current configuration
  const currentNodes = activeDemo === 'single' ? singleAgentNodes : multiAgentNodes;
  const currentEdges = activeDemo === 'single' ? singleAgentEdges : multiAgentEdges;

  // Generate simulation steps
  const generateSimulationSteps = useCallback(() => {
    const steps: Message[] = [];
    let stepId = 0;

    if (activeDemo === 'single') {
      steps.push(
        { id: `msg-${stepId++}`, from: 'user', to: 'agent', content: userInput, timestamp: new Date().toISOString(), type: 'query' },
        { id: `msg-${stepId++}`, from: 'agent', to: 'model', content: 'I need to analyze tech trends. Let me think about this step by step.', timestamp: new Date().toISOString(), type: 'query' },
        { id: `msg-${stepId++}`, from: 'model', to: 'agent', content: 'I should gather recent tech news and market data to analyze trends.', timestamp: new Date().toISOString(), type: 'response' },
        { id: `msg-${stepId++}`, from: 'agent', to: 'tool', content: 'Search for recent tech industry news and market reports', timestamp: new Date().toISOString(), type: 'tool_call' },
        { id: `msg-${stepId++}`, from: 'tool', to: 'agent', content: 'Found 15 articles about AI, cloud computing, and cybersecurity trends', timestamp: new Date().toISOString(), type: 'response' },
        { id: `msg-${stepId++}`, from: 'agent', to: 'model', content: 'Based on the data, analyze key trends and create a structured report', timestamp: new Date().toISOString(), type: 'query' },
        { id: `msg-${stepId++}`, from: 'model', to: 'agent', content: 'Generated comprehensive market analysis with trend predictions', timestamp: new Date().toISOString(), type: 'response' },
        { id: `msg-${stepId++}`, from: 'agent', to: 'user', content: 'Here\'s your tech trends analysis with market insights and future predictions', timestamp: new Date().toISOString(), type: 'response' }
      );
    } else {
      steps.push(
        { id: `msg-${stepId++}`, from: 'user', to: 'coordinator', content: userInput, timestamp: new Date().toISOString(), type: 'query' },
        { id: `msg-${stepId++}`, from: 'coordinator', to: 'researcher', content: 'Research recent tech developments and market data', timestamp: new Date().toISOString(), type: 'query' },
        { id: `msg-${stepId++}`, from: 'coordinator', to: 'analyst', content: 'Prepare to analyze market trends and patterns', timestamp: new Date().toISOString(), type: 'query' },
        { id: `msg-${stepId++}`, from: 'researcher', to: 'tools', content: 'Query tech news APIs and market databases', timestamp: new Date().toISOString(), type: 'tool_call' },
        { id: `msg-${stepId++}`, from: 'tools', to: 'researcher', content: 'Retrieved comprehensive tech industry data', timestamp: new Date().toISOString(), type: 'response' },
        { id: `msg-${stepId++}`, from: 'researcher', to: 'coordinator', content: 'Research complete: AI adoption up 40%, cloud spending increased', timestamp: new Date().toISOString(), type: 'response' },
        { id: `msg-${stepId++}`, from: 'analyst', to: 'coordinator', content: 'Analysis ready: Identified 5 key growth areas and market opportunities', timestamp: new Date().toISOString(), type: 'response' },
        { id: `msg-${stepId++}`, from: 'coordinator', to: 'writer', content: 'Create market report combining research and analysis findings', timestamp: new Date().toISOString(), type: 'query' },
        { id: `msg-${stepId++}`, from: 'writer', to: 'coordinator', content: 'Draft report completed with executive summary and recommendations', timestamp: new Date().toISOString(), type: 'response' },
        { id: `msg-${stepId++}`, from: 'coordinator', to: 'user', content: 'Comprehensive tech trends report delivered with actionable insights', timestamp: new Date().toISOString(), type: 'response' }
      );
    }

    return steps;
  }, [activeDemo, userInput]);

  // Start simulation
  const startSimulation = useCallback(() => {
    setIsSimulationRunning(true);
    setCurrentStep(0);
    setActiveNodes(new Set());
    setAnimatedEdges(currentEdges.map(edge => ({ ...edge, active: false, progress: 0 })));
    
    const steps = generateSimulationSteps();
    setMessages(steps);

    let stepIndex = 0;
    const executeStep = () => {
      if (stepIndex >= steps.length) {
        setIsSimulationRunning(false);
        return;
      }

      const step = steps[stepIndex];
      setCurrentStep(stepIndex);
      
      // Activate source and target nodes
      setActiveNodes(prev => new Set([...prev, step.from, step.to]));
      
      // Find and animate the edge
      const edgeId = `${step.from}-${step.to}`;
      const edge = currentEdges.find(e => e.id === edgeId || e.id.includes(step.from) && e.id.includes(step.to));
      
      if (edge) {
        setAnimatedEdges(prev => prev.map(e => 
          e.id === edge.id ? { ...e, active: true, progress: 0 } : e
        ));
        
        // Animate edge progress
        let progress = 0;
        const animateEdge = () => {
          progress += 0.1;
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
        animateEdge();
      }

      stepIndex++;
      setTimeout(executeStep, 2000 / speed);
    };

    executeStep();
  }, [currentEdges, generateSimulationSteps, speed]);

  // Reset simulation
  const resetSimulation = useCallback(() => {
    setIsSimulationRunning(false);
    setCurrentStep(0);
    setMessages([]);
    setActiveNodes(new Set());
    setAnimatedEdges(currentEdges.map(edge => ({ ...edge, active: false, progress: 0 })));
  }, [currentEdges]);

  // Create SVG path for edges
  const createEdgePath = (from: string, to: string) => {
    const fromNode = currentNodes.find(n => n.id === from);
    const toNode = currentNodes.find(n => n.id === to);
    
    if (!fromNode || !toNode) return '';
    
    const fromX = fromNode.x + fromNode.width / 2;
    const fromY = fromNode.y + fromNode.height / 2;
    const toX = toNode.x + toNode.width / 2;
    const toY = toNode.y + toNode.height / 2;
    
    // Create curved path
    const midX = (fromX + toX) / 2;
    const midY = (fromY + toY) / 2;
    const controlY = midY - 20;
    
    return `M ${fromX} ${fromY} Q ${midX} ${controlY} ${toX} ${toY}`;
  };

  // Get node color based on type and theme
  const getNodeColor = (nodeType: string, isActive: boolean) => {
    const colors = {
      user: {
        bg: isActive 
          ? (theme === 'dark' ? 'bg-green-900/40 border-green-400' : 'bg-green-100 border-green-500')
          : (theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'),
        icon: theme === 'dark' ? 'text-green-400' : 'text-green-600'
      },
      agent: {
        bg: isActive 
          ? (theme === 'dark' ? 'bg-blue-900/40 border-blue-400' : 'bg-blue-100 border-blue-500')
          : (theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'),
        icon: theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
      },
      model: {
        bg: isActive 
          ? (theme === 'dark' ? 'bg-purple-900/40 border-purple-400' : 'bg-purple-100 border-purple-500')
          : (theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'),
        icon: theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
      },
      tool: {
        bg: isActive 
          ? (theme === 'dark' ? 'bg-orange-900/40 border-orange-400' : 'bg-orange-100 border-orange-500')
          : (theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'),
        icon: theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
      }
    };
    
    return colors[nodeType as keyof typeof colors] || colors.agent;
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Agent Communication Protocol Demo</h3>
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
                onClick={resetSimulation}
                disabled={isSimulationRunning}
              >
                <ArrowsCounterClockwise size={14} />
              </Button>
              <Button
                size="sm"
                onClick={startSimulation}
                disabled={isSimulationRunning}
              >
                <Play size={14} />
                {isSimulationRunning ? 'Running...' : 'Start Demo'}
              </Button>
            </div>
          </div>

          <Tabs value={activeDemo} onValueChange={(value) => setActiveDemo(value as 'single' | 'multi')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single" className="flex items-center gap-2">
                <User size={16} />
                Single Agent (ReAct)
              </TabsTrigger>
              <TabsTrigger value="multi" className="flex items-center gap-2">
                <Users size={16} />
                Multi-Agent System
              </TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Demonstrates a single ReAct agent that can reason, act, and observe in a loop to complete complex tasks.
              </div>
            </TabsContent>

            <TabsContent value="multi" className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Shows how multiple specialized agents coordinate to handle complex workflows with distributed responsibilities.
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex items-center gap-2">
            <Input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Enter your request..."
              disabled={isSimulationRunning}
            />
          </div>

          <div className="relative border rounded-lg p-4 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm" style={{ height: '600px' }}>
            <svg width="100%" height="100%" className="absolute inset-0">
              {/* Render edges */}
              {currentEdges.map(edge => {
                const animatedEdge = animatedEdges.find(ae => ae.id === edge.id);
                const path = createEdgePath(edge.from, edge.to);
                
                return (
                  <g key={edge.id}>
                    {/* Base edge */}
                    <path
                      d={path}
                      fill="none"
                      stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'}
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
                        strokeDasharray="8,4"
                        strokeDashoffset={-animatedEdge.progress * 40}
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
                  <polygon points="0 0, 10 3.5, 0 7" fill={theme === 'dark' ? '#9ca3af' : '#4b5563'} />
                </marker>
                <marker id="arrowhead-active" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                </marker>
              </defs>
            </svg>
            
            {/* Render nodes */}
            {currentNodes.map(node => {
              const isActive = activeNodes.has(node.id);
              const colors = getNodeColor(node.type, isActive);
              
              return (
                <div
                  key={node.id}
                  className={`absolute rounded-xl border-2 p-4 transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer ${colors.bg}`}
                  style={{
                    left: node.x,
                    top: node.y,
                    width: node.width,
                    height: node.height,
                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                    zIndex: isActive ? 10 : 1,
                    boxShadow: isActive 
                      ? '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' 
                      : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {node.type === 'user' && <User size={18} className={colors.icon} />}
                    {node.type === 'agent' && <Users size={18} className={colors.icon} />}
                    {node.type === 'model' && <div className={`w-5 h-5 rounded ${colors.icon.replace('text-', 'bg-')}`} />}
                    {node.type === 'tool' && <div className={`w-5 h-5 rounded-sm ${colors.icon.replace('text-', 'bg-')}`} />}
                    <div className="text-base font-semibold truncate">
                      {node.label}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground capitalize font-medium mb-1">
                    {node.type}
                  </div>
                  <div className="text-xs opacity-70 leading-relaxed">
                    {node.type === 'user' && 'Initiates requests'}
                    {node.type === 'agent' && 'Processes and coordinates'}
                    {node.type === 'model' && 'Language processing'}
                    {node.type === 'tool' && 'External resources'}
                  </div>
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
          </div>

          {/* Message log */}
          {messages.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Communication Log:</h4>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {messages.slice(0, currentStep + 1).map((message, index) => (
                  <div 
                    key={message.id}
                    className={`text-sm p-3 rounded-lg flex items-start gap-3 ${
                      index === currentStep 
                        ? (theme === 'dark' ? 'bg-blue-900/30 border border-blue-500/30' : 'bg-blue-50 border border-blue-200')
                        : (theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50')
                    }`}
                  >
                    <Badge variant="outline" className="text-xs shrink-0">
                      {message.from} → {message.to}
                    </Badge>
                    <span className="flex-1">{message.content}</span>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {message.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleACPDemo;
