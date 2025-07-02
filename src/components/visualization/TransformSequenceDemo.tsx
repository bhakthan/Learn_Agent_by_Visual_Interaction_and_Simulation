import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
  BackgroundVariant,
  Node,
  Edge
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { ArrowsCounterClockwise, Play, Stop, Lightning, SlowMotion, SkipForward, Plus, Minus, GearSix } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AgentNode } from './node-types/AgentNode';
import DataTransformVisualizer from './DataTransformVisualizer';
import { DataFlowType } from '@/lib/utils/dataFlowUtils';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme/ThemeProvider';

// Custom node types for the flow
const nodeTypes = {
  agent: AgentNode,
};

// Demo scenario types
type DemoScenario = 'agent-to-agent' | 'workflow' | 'multi-agent' | 'reflection' | 'planner-executor';

// Animation speeds
type SpeedOption = 'very-slow' | 'slow' | 'normal' | 'fast' | 'very-fast';
const speedValues = {
  'very-slow': 0.3,
  'slow': 0.6,
  'normal': 1,
  'fast': 1.8,
  'very-fast': 3
};

// Interface for data flow message with transformation details
interface TransformableDataFlow {
  id: string;
  edgeId: string;
  source: string;
  target: string;
  content: string;
  rawContent?: string;
  transformedContent?: string;
  timestamp: number;
  type: DataFlowType;
  progress: number;
  transformStage?: 'raw' | 'processing' | 'transformed';
  transformationProgress?: number;
  label?: string;
  metadata?: Record<string, any>;
  complete?: boolean;
}

// Scenarios for the demo
const scenarioConfigs: Record<DemoScenario, {
  title: string;
  description: string;
  initialNodes: Node[];
  initialEdges: Edge[];
  nodeTypeMap: Record<string, string>;
  transformSequences: {
    source: string;
    target: string;
    type: DataFlowType;
    rawContent: string;
    transformedContent: string;
    metadata?: Record<string, any>;
    delay: number;
    duration?: number;
  }[];
}> = {
  'agent-to-agent': {
    title: 'Agent-to-Agent Communication',
    description: 'Visualize how data is transformed between two agents using the A2A protocol',
    initialNodes: [
      {
        id: 'agent1',
        data: { label: 'Planner Agent', nodeType: 'agent' },
        position: { x: 100, y: 100 },
        type: 'agent',
      },
      {
        id: 'agent2',
        data: { label: 'Worker Agent', nodeType: 'agent' },
        position: { x: 400, y: 100 },
        type: 'agent',
      },
    ],
    initialEdges: [
      { id: 'e1-2', source: 'agent1', target: 'agent2', animated: false, label: 'request task', data: { flowType: 'message' } },
      { id: 'e2-1', source: 'agent2', target: 'agent1', animated: false, label: 'send result', data: { flowType: 'response' } },
    ],
    nodeTypeMap: {
      'agent1': 'agent',
      'agent2': 'agent'
    },
    transformSequences: [
      {
        source: 'agent1',
        target: 'agent2',
        type: 'message',
        rawContent: 'Task Assignment',
        transformedContent: 'Task: Data Analysis',
        metadata: {
          protocol: 'A2A',
          taskId: '123456',
        },
        delay: 1000,
        duration: 2500,
      },
      {
        source: 'agent2',
        target: 'agent1',
        type: 'response',
        rawContent: 'Result Data',
        transformedContent: 'Completed Analysis',
        metadata: {
          status: 'success',
          taskId: '123456',
        },
        delay: 4500,
        duration: 2500,
      }
    ]
  },
  'workflow': {
    title: 'Agent Workflow Sequence',
    description: 'Data transformation through a multi-step agent workflow',
    initialNodes: [
      {
        id: 'user',
        data: { label: 'User', nodeType: 'user' },
        position: { x: 100, y: 100 },
        type: 'agent',
      },
      {
        id: 'orchestrator',
        data: { label: 'Orchestrator', nodeType: 'agent' },
        position: { x: 300, y: 100 },
        type: 'agent',
      },
      {
        id: 'tool',
        data: { label: 'Search Tool', nodeType: 'tool' },
        position: { x: 500, y: 50 },
        type: 'agent',
      },
      {
        id: 'result',
        data: { label: 'Result', nodeType: 'environment' },
        position: { x: 500, y: 150 },
        type: 'agent',
      },
    ],
    initialEdges: [
      { id: 'e1-2', source: 'user', target: 'orchestrator', animated: false, label: 'query', data: { flowType: 'query' } },
      { id: 'e2-3', source: 'orchestrator', target: 'tool', animated: false, label: 'tool call', data: { flowType: 'tool_call' } },
      { id: 'e3-2', source: 'tool', target: 'orchestrator', animated: false, label: 'response', data: { flowType: 'response' } },
      { id: 'e2-4', source: 'orchestrator', target: 'result', animated: false, label: 'final answer', data: { flowType: 'response' } },
    ],
    nodeTypeMap: {
      'user': 'user',
      'orchestrator': 'agent',
      'tool': 'tool',
      'result': 'environment'
    },
    transformSequences: [
      {
        source: 'user',
        target: 'orchestrator',
        type: 'query',
        rawContent: 'Raw Query',
        transformedContent: 'Weather in Seattle',
        metadata: { 
          requestId: 'q-123',
          timestamp: 'now'
        },
        delay: 1000,
        duration: 2000,
      },
      {
        source: 'orchestrator',
        target: 'tool',
        type: 'tool_call',
        rawContent: 'Function Call',
        transformedContent: 'get_weather("Seattle")',
        metadata: { 
          toolId: 'weather-api',
          params: '{"location":"Seattle"}'
        },
        delay: 4000,
        duration: 1800,
      },
      {
        source: 'tool',
        target: 'orchestrator',
        type: 'response',
        rawContent: 'API Response',
        transformedContent: '62°F, Cloudy',
        metadata: { 
          format: 'JSON',
          success: 'true'
        },
        delay: 7000,
        duration: 1800,
      },
      {
        source: 'orchestrator',
        target: 'result',
        type: 'response',
        rawContent: 'Raw Response',
        transformedContent: 'It\'s 62°F and cloudy in Seattle',
        metadata: { 
          confidence: 'high',
          sources: 'weather-api'
        },
        delay: 10000,
        duration: 2000,
      }
    ]
  },
  'multi-agent': {
    title: 'Multi-Agent Collaboration',
    description: 'Visualize data transformation in a collaborative agent system',
    initialNodes: [
      {
        id: 'user',
        data: { label: 'User', nodeType: 'user' },
        position: { x: 250, y: 50 },
        type: 'agent',
      },
      {
        id: 'router',
        data: { label: 'Router Agent', nodeType: 'agent' },
        position: { x: 250, y: 150 },
        type: 'agent',
      },
      {
        id: 'agent1',
        data: { label: 'Research Agent', nodeType: 'agent' },
        position: { x: 100, y: 250 },
        type: 'agent',
      },
      {
        id: 'agent2',
        data: { label: 'Analysis Agent', nodeType: 'agent' },
        position: { x: 250, y: 250 },
        type: 'agent',
      },
      {
        id: 'agent3',
        data: { label: 'Drafting Agent', nodeType: 'agent' },
        position: { x: 400, y: 250 },
        type: 'agent',
      },
      {
        id: 'result',
        data: { label: 'Final Output', nodeType: 'environment' },
        position: { x: 250, y: 350 },
        type: 'agent',
      },
    ],
    initialEdges: [
      { id: 'e1-2', source: 'user', target: 'router', animated: false, data: { flowType: 'query' } },
      { id: 'e2-3', source: 'router', target: 'agent1', animated: false, data: { flowType: 'message' } },
      { id: 'e2-4', source: 'router', target: 'agent2', animated: false, data: { flowType: 'message' } },
      { id: 'e2-5', source: 'router', target: 'agent3', animated: false, data: { flowType: 'message' } },
      { id: 'e3-4', source: 'agent1', target: 'agent2', animated: false, data: { flowType: 'data' } },
      { id: 'e4-5', source: 'agent2', target: 'agent3', animated: false, data: { flowType: 'data' } },
      { id: 'e5-6', source: 'agent3', target: 'result', animated: false, data: { flowType: 'response' } },
    ],
    nodeTypeMap: {
      'user': 'user',
      'router': 'agent',
      'agent1': 'agent',
      'agent2': 'agent',
      'agent3': 'agent',
      'result': 'environment'
    },
    transformSequences: [
      {
        source: 'user',
        target: 'router',
        type: 'query',
        rawContent: 'User Request',
        transformedContent: 'Market Analysis Report',
        delay: 1000,
        duration: 1500,
      },
      {
        source: 'router',
        target: 'agent1',
        type: 'message',
        rawContent: 'Task Assignment',
        transformedContent: 'Research Market Data',
        delay: 3500,
        duration: 1200,
      },
      {
        source: 'router',
        target: 'agent2',
        type: 'message',
        rawContent: 'Task Assignment',
        transformedContent: 'Analyze Trends',
        delay: 3700,
        duration: 1200,
      },
      {
        source: 'router',
        target: 'agent3',
        type: 'message',
        rawContent: 'Task Assignment',
        transformedContent: 'Draft Report',
        delay: 3900,
        duration: 1200,
      },
      {
        source: 'agent1',
        target: 'agent2',
        type: 'data',
        rawContent: 'Raw Dataset',
        transformedContent: 'Market Statistics',
        metadata: {
          datapoints: '1250',
          timeframe: 'Q2 2023'
        },
        delay: 6000,
        duration: 1800,
      },
      {
        source: 'agent2',
        target: 'agent3',
        type: 'data',
        rawContent: 'Analysis Results',
        transformedContent: 'Growth Trends +15%',
        metadata: {
          confidence: '92%',
          sectors: '5'
        },
        delay: 8800,
        duration: 1800,
      },
      {
        source: 'agent3',
        target: 'result',
        type: 'response',
        rawContent: 'Document Draft',
        transformedContent: 'Final Market Report',
        metadata: {
          pages: '24',
          format: 'PDF'
        },
        delay: 11600,
        duration: 2000,
      }
    ]
  },
  'reflection': {
    title: 'Self-Reflection Loop',
    description: 'Visualize how agents transform data through self-reflection iterations',
    initialNodes: [
      {
        id: 'input',
        data: { label: 'Input Query', nodeType: 'user' },
        position: { x: 150, y: 50 },
        type: 'agent',
      },
      {
        id: 'agent',
        data: { label: 'Agent', nodeType: 'agent' },
        position: { x: 150, y: 150 },
        type: 'agent',
      },
      {
        id: 'reflection',
        data: { label: 'Reflection', nodeType: 'reflection' },
        position: { x: 300, y: 200 },
        type: 'agent',
      },
      {
        id: 'output',
        data: { label: 'Output', nodeType: 'environment' },
        position: { x: 150, y: 250 },
        type: 'agent',
      },
    ],
    initialEdges: [
      { id: 'e1-2', source: 'input', target: 'agent', animated: false, label: 'query', data: { flowType: 'query' } },
      { id: 'e2-3', source: 'agent', target: 'reflection', animated: false, label: 'draft', data: { flowType: 'data' } },
      { id: 'e3-2', source: 'reflection', target: 'agent', animated: false, label: 'feedback', data: { flowType: 'reflection' } },
      { id: 'e2-4', source: 'agent', target: 'output', animated: false, label: 'response', data: { flowType: 'response' } },
    ],
    nodeTypeMap: {
      'input': 'user',
      'agent': 'agent',
      'reflection': 'reflection',
      'output': 'environment'
    },
    transformSequences: [
      {
        source: 'input',
        target: 'agent',
        type: 'query',
        rawContent: 'Problem',
        transformedContent: 'Explain quantum computing',
        delay: 1000,
        duration: 1500,
      },
      {
        source: 'agent',
        target: 'reflection',
        type: 'data',
        rawContent: 'Initial Draft',
        transformedContent: 'V1: Quantum computing uses qubits...',
        delay: 3500,
        duration: 1500,
      },
      {
        source: 'reflection',
        target: 'agent',
        type: 'reflection',
        rawContent: 'Review Comments',
        transformedContent: 'Add more examples',
        delay: 6000,
        duration: 1500,
      },
      {
        source: 'agent',
        target: 'reflection',
        type: 'data',
        rawContent: 'Revised Draft',
        transformedContent: 'V2: Quantum computing with examples...',
        delay: 8500,
        duration: 1500,
      },
      {
        source: 'reflection',
        target: 'agent',
        type: 'reflection',
        rawContent: 'Final Feedback',
        transformedContent: 'Improve readability',
        delay: 11000,
        duration: 1500,
      },
      {
        source: 'agent',
        target: 'output',
        type: 'response',
        rawContent: 'Final Answer',
        transformedContent: 'Clear quantum computing explanation',
        metadata: {
          revisions: '2',
          quality: 'high'
        },
        delay: 13500,
        duration: 2000,
      }
    ]
  },
  'planner-executor': {
    title: 'Planner-Executor Pattern',
    description: 'Data transformation in a planner-executor agent pattern',
    initialNodes: [
      {
        id: 'user',
        data: { label: 'User', nodeType: 'user' },
        position: { x: 250, y: 50 },
        type: 'agent',
      },
      {
        id: 'planner',
        data: { label: 'Planner Agent', nodeType: 'planner' },
        position: { x: 150, y: 150 },
        type: 'agent',
      },
      {
        id: 'executor1',
        data: { label: 'Executor 1', nodeType: 'agent' },
        position: { x: 300, y: 150 },
        type: 'agent',
      },
      {
        id: 'executor2',
        data: { label: 'Executor 2', nodeType: 'agent' },
        position: { x: 350, y: 220 },
        type: 'agent',
      },
      {
        id: 'evaluator',
        data: { label: 'Evaluator', nodeType: 'evaluator' },
        position: { x: 150, y: 250 },
        type: 'agent',
      },
      {
        id: 'output',
        data: { label: 'Final Result', nodeType: 'environment' },
        position: { x: 250, y: 350 },
        type: 'agent',
      }
    ],
    initialEdges: [
      { id: 'e1-2', source: 'user', target: 'planner', animated: false, data: { flowType: 'query' } },
      { id: 'e2-3', source: 'planner', target: 'executor1', animated: false, data: { flowType: 'plan' } },
      { id: 'e2-4', source: 'planner', target: 'executor2', animated: false, data: { flowType: 'plan' } },
      { id: 'e3-5', source: 'executor1', target: 'evaluator', animated: false, data: { flowType: 'data' } },
      { id: 'e4-5', source: 'executor2', target: 'evaluator', animated: false, data: { flowType: 'data' } },
      { id: 'e5-6', source: 'evaluator', target: 'output', animated: false, data: { flowType: 'response' } },
    ],
    nodeTypeMap: {
      'user': 'user',
      'planner': 'planner',
      'executor1': 'agent',
      'executor2': 'agent',
      'evaluator': 'evaluator',
      'output': 'environment'
    },
    transformSequences: [
      {
        source: 'user',
        target: 'planner',
        type: 'query',
        rawContent: 'Problem Statement',
        transformedContent: 'Calculate portfolio risk',
        delay: 1000,
        duration: 1800,
      },
      {
        source: 'planner',
        target: 'executor1',
        type: 'plan',
        rawContent: 'Task Assignment',
        transformedContent: 'Plan: Analyze stock data',
        metadata: {
          priority: 'high',
          step: '1 of 2'
        },
        delay: 3800,
        duration: 1500,
      },
      {
        source: 'planner',
        target: 'executor2',
        type: 'plan',
        rawContent: 'Task Assignment',
        transformedContent: 'Plan: Calculate correlations',
        metadata: {
          priority: 'medium',
          step: '2 of 2'
        },
        delay: 4000,
        duration: 1500,
      },
      {
        source: 'executor1',
        target: 'evaluator',
        type: 'data',
        rawContent: 'Execution Results',
        transformedContent: 'Stock volatility: 12.4%',
        metadata: {
          datapoints: '500',
          timeframe: '12 months'
        },
        delay: 6500,
        duration: 1800,
      },
      {
        source: 'executor2',
        target: 'evaluator',
        type: 'data',
        rawContent: 'Execution Results',
        transformedContent: 'Asset correlation: 0.72',
        metadata: {
          confidence: '91%',
          method: 'Pearson'
        },
        delay: 7000,
        duration: 1800,
      },
      {
        source: 'evaluator',
        target: 'output',
        type: 'response',
        rawContent: 'Evaluation Results',
        transformedContent: 'Portfolio risk: Medium (6.8%)',
        metadata: {
          confidence: 'high',
          method: 'Combined analysis'
        },
        delay: 9800,
        duration: 2000,
      }
    ]
  }
};

/**
 * Flow component using ReactFlow to demonstrate data transformation between agents
 */
const FlowWithDataTransform = ({ scenario }: { scenario: DemoScenario }) => {
  const config = scenarioConfigs[scenario];
  const { theme } = useTheme();
  const reactFlowInstance = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState(config.initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(config.initialEdges);
  const [dataFlows, setDataFlows] = useState<TransformableDataFlow[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState<SpeedOption>('normal');
  const [showLabels, setShowLabels] = useState(true);
  const [showTransformations, setShowTransformations] = useState(true);
  
  // References for animation control
  const timeoutsRef = useRef<number[]>([]);
  const isInitializedRef = useRef(false);

  // Get edge points for data flow visualization
  const getEdgePoints = useCallback((edgeId: string) => {
    if (!reactFlowInstance) return null;
    
    const edge = edges.find(e => e.id === edgeId);
    if (!edge) return null;
    
    // Get source and target nodes
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    if (!sourceNode || !targetNode) return null;
    
    // Get node width and height (with default values if not available)
    const sourceWidth = (sourceNode as any).width || 150;
    const sourceHeight = (sourceNode as any).height || 40;
    const targetWidth = (targetNode as any).width || 150;
    const targetHeight = (targetNode as any).height || 40;
    
    // Calculate center points
    const sourceX = sourceNode.position.x + sourceWidth / 2;
    const sourceY = sourceNode.position.y + sourceHeight / 2;
    const targetX = targetNode.position.x + targetWidth / 2;
    const targetY = targetNode.position.y + targetHeight / 2;
    
    return { sourceX, sourceY, targetX, targetY };
  }, [reactFlowInstance, nodes, edges]);

  // Function to center flow view
  const centerView = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({
        padding: 0.2,
        includeHiddenNodes: false,
        duration: 800,
      });
    }
  }, [reactFlowInstance]);
  
  // Initialize and center view on load
  useEffect(() => {
    if (!isInitializedRef.current && reactFlowInstance) {
      // Center the view with a slight delay to ensure proper initialization
      const timer = setTimeout(() => {
        centerView();
        isInitializedRef.current = true;
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [reactFlowInstance, centerView]);

  // Reset when scenario changes
  useEffect(() => {
    stopAnimation();
    setNodes(config.initialNodes);
    setEdges(config.initialEdges);
    setDataFlows([]);
    
    // Reset initialized state to trigger recentering
    isInitializedRef.current = false;
    
  }, [scenario, config.initialNodes, config.initialEdges, setNodes, setEdges]);
  
  // Function to reset the animation state
  const resetAnimation = useCallback(() => {
    // Clear any pending timeouts
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    
    // Reset flow data
    setDataFlows([]);
    
    // Reset node statuses
    setNodes(nodes => nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        status: null
      }
    })));
    
    // Reset edge animations
    setEdges(edges => edges.map(edge => ({
      ...edge,
      animated: false
    })));
  }, [setNodes, setEdges]);

  // Function to stop animation
  const stopAnimation = useCallback(() => {
    setIsPlaying(false);
    resetAnimation();
  }, [resetAnimation]);

  // Function to play animation
  const playAnimation = useCallback(() => {
    // Reset first
    resetAnimation();
    setIsPlaying(true);
    
    // Schedule animation sequences based on configuration
    const speedMultiplier = speedValues[animationSpeed] || 1;
    
    // Create sequences with adjusted timings
    const newTimeouts = config.transformSequences.map(sequence => {
      const adjustedDelay = sequence.delay / speedMultiplier;
      
      return setTimeout(() => {
        // Get the edge for this sequence
        const edge = edges.find(e => e.source === sequence.source && e.target === sequence.target);
        if (!edge) return;
        
        // Create a unique ID for this flow
        const flowId = `flow-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        
        // Create the data flow
        const newFlow: TransformableDataFlow = {
          id: flowId,
          edgeId: edge.id,
          source: sequence.source,
          target: sequence.target,
          content: sequence.rawContent,
          rawContent: sequence.rawContent,
          transformedContent: sequence.transformedContent,
          timestamp: Date.now(),
          type: sequence.type,
          progress: 0,
          transformStage: 'raw',
          transformationProgress: 0,
          label: sequence.rawContent,
          metadata: sequence.metadata || {},
        };
        
        // Activate source node
        setNodes(nodes => nodes.map(node => 
          node.id === sequence.source 
            ? { ...node, data: { ...node.data, status: 'active' } }
            : node
        ));
        
        // Activate edge
        setEdges(edges => edges.map(e => 
          e.id === edge.id 
            ? { ...e, animated: true }
            : e
        ));
        
        // Add flow
        setDataFlows(prev => [...prev, newFlow]);
        
        // After flow completes, activate target node
        setTimeout(() => {
          setNodes(nodes => nodes.map(node => 
            node.id === sequence.target 
              ? { ...node, data: { ...node.data, status: 'active' } }
              : node
          ));
        }, (sequence.duration || 2000) / speedMultiplier);
        
      }, adjustedDelay);
    });
    
    // Store timeouts for cleanup
    timeoutsRef.current = [...timeoutsRef.current, ...newTimeouts];
    
    // Add timeout to mark animation complete
    const completionTimeout = setTimeout(() => {
      setIsPlaying(false);
    }, (Math.max(...config.transformSequences.map(seq => seq.delay + (seq.duration || 2000))) + 1000) / speedMultiplier);
    
    timeoutsRef.current.push(completionTimeout);
    
  }, [animationSpeed, config.transformSequences, edges, setNodes, setEdges, resetAnimation]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  // Handle flow completion
  const handleFlowComplete = useCallback((flowId: string) => {
    // Remove the completed flow
    setDataFlows(prev => prev.filter(flow => flow.id !== flowId));
  }, []);

  return (
    <div className="w-full h-full">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={isPlaying ? stopAnimation : playAnimation}
                    variant={isPlaying ? "destructive" : "default"}
                    size="sm"
                  >
                    {isPlaying ? <Stop weight="fill" className="mr-1" /> : <Play weight="fill" className="mr-1" />}
                    {isPlaying ? 'Stop' : 'Start Animation'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isPlaying ? 'Stop the animation sequence' : 'Start the animation sequence'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={resetAnimation} variant="outline" size="sm">
                    <ArrowsCounterClockwise className="mr-1" />
                    Reset
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reset the animation to its initial state</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Minus size={14} className="text-muted-foreground" />
              <Select
                value={animationSpeed}
                onValueChange={(value) => setAnimationSpeed(value as SpeedOption)}
              >
                <SelectTrigger className="w-[130px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="very-slow">Very Slow</SelectItem>
                  <SelectItem value="slow">Slow</SelectItem>
                  <SelectItem value="normal">Normal Speed</SelectItem>
                  <SelectItem value="fast">Fast</SelectItem>
                  <SelectItem value="very-fast">Very Fast</SelectItem>
                </SelectContent>
              </Select>
              <Plus size={14} className="text-muted-foreground" />
            </div>
            
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="show-labels" className="text-sm cursor-pointer">
                        Labels
                      </Label>
                      <Switch
                        id="show-labels"
                        checked={showLabels}
                        onCheckedChange={setShowLabels}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Show or hide data labels</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="show-transforms" className="text-sm cursor-pointer">
                        Effects
                      </Label>
                      <Switch
                        id="show-transforms"
                        checked={showTransformations}
                        onCheckedChange={setShowTransformations}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Show transformation effects</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
        
        <div className="flex-grow w-full h-[400px] border border-border rounded-md overflow-hidden">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.5}
            maxZoom={2}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            attributionPosition="bottom-right"
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={12}
              size={1}
              className={cn(
                "bg-background transition-all duration-300",
                theme === "dark" ? "bg-opacity-40" : "bg-opacity-100"
              )}
            />
            <Controls className="bg-card border border-border text-foreground" />
            
            <DataTransformVisualizer
              flows={dataFlows}
              edges={edges}
              getEdgePoints={getEdgePoints}
              onFlowComplete={handleFlowComplete}
              speed={speedValues[animationSpeed] || 1}
              showLabels={showLabels}
              showTransformationEffects={showTransformations}
              nodeTypeMap={config.nodeTypeMap}
            />
          </ReactFlow>
        </div>
        
        <div className="mt-4">
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className="bg-card flex items-center gap-1 text-xs">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              User
            </Badge>
            <Badge variant="outline" className="bg-card flex items-center gap-1 text-xs">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              Agent
            </Badge>
            <Badge variant="outline" className="bg-card flex items-center gap-1 text-xs">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              Tool
            </Badge>
            <Badge variant="outline" className="bg-card flex items-center gap-1 text-xs">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              Environment
            </Badge>
            <Badge variant="outline" className="bg-card flex items-center gap-1 text-xs">
              <div className="w-2 h-2 rounded-full bg-pink-500" />
              Reflection
            </Badge>
            <Badge variant="outline" className="bg-card flex items-center gap-1 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              Planner
            </Badge>
            <Badge variant="outline" className="bg-card flex items-center gap-1 text-xs">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              Evaluator
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * TransformSequenceDemo component to demonstrate data transformations between agents
 */
export const TransformSequenceDemo = () => {
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario>('agent-to-agent');
  const config = scenarioConfigs[selectedScenario];
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{config.title}</CardTitle>
        <CardDescription>{config.description}</CardDescription>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {(Object.keys(scenarioConfigs) as DemoScenario[]).map((scenario) => (
            <Button
              key={scenario}
              size="sm"
              variant={selectedScenario === scenario ? "default" : "outline"}
              onClick={() => setSelectedScenario(scenario)}
              className={cn(
                "flex items-center gap-1",
                selectedScenario === scenario && "shadow-md"
              )}
            >
              <GearSix size={14} weight={selectedScenario === scenario ? "fill" : "regular"} />
              {scenarioConfigs[scenario].title.split(" ")[0]}
            </Button>
          ))}
        </div>
        
        <Separator className="mt-4" />
      </CardHeader>
      <CardContent>
        <ReactFlowProvider>
          <FlowWithDataTransform scenario={selectedScenario} />
        </ReactFlowProvider>
      </CardContent>
    </Card>
  );
};

export default TransformSequenceDemo;