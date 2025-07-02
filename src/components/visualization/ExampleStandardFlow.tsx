import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Stop, ArrowsCounterClockwise } from '@phosphor-icons/react';
import StandardFlowVisualizer from './StandardFlowVisualizer';
import { createNode, createEdge, SpeedOption, speedValues } from '@/types/visualization';
import { DataFlowType } from '@/lib/utils/dataFlowUtils';

/**
 * Example visualization using the standardized flow system
 */
const ExampleStandardFlow: React.FC = () => {
  // Define nodes and edges using our helper functions
  const initialNodes = [
    createNode('input', 'Input Query', 'user', 150, 50),
    createNode('agent', 'Agent', 'agent', 150, 150),
    createNode('reflection', 'Reflection', 'reflection', 300, 200),
    createNode('output', 'Output', 'environment', 150, 250),
  ];
  
  const initialEdges = [
    createEdge('e1-2', 'input', 'agent', 'query', 'query'),
    createEdge('e2-3', 'agent', 'reflection', 'draft', 'data'),
    createEdge('e3-2', 'reflection', 'agent', 'feedback', 'reflection'),
    createEdge('e2-4', 'agent', 'output', 'response', 'response'),
  ];
  
  // State for flows and controls
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [flows, setFlows] = useState<any[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState<SpeedOption>('normal');
  const [showLabels, setShowLabels] = useState(true);
  
  // Flow step definitions for the animation
  const flowSteps = [
    {
      id: 'flow-1',
      edgeId: 'e1-2',
      source: 'input',
      target: 'agent',
      content: 'Explain quantum computing',
      type: 'query' as DataFlowType,
      label: 'query',
      delay: 1000
    },
    {
      id: 'flow-2',
      edgeId: 'e2-3',
      source: 'agent',
      target: 'reflection',
      content: 'V1: Quantum computing uses qubits...',
      type: 'data' as DataFlowType,
      label: 'draft',
      delay: 3500
    },
    {
      id: 'flow-3',
      edgeId: 'e3-2',
      source: 'reflection',
      target: 'agent',
      content: 'Add more examples',
      type: 'reflection' as DataFlowType,
      label: 'feedback',
      delay: 6000
    },
    {
      id: 'flow-4',
      edgeId: 'e2-3',
      source: 'agent',
      target: 'reflection',
      content: 'V2: Quantum computing with examples...',
      type: 'data' as DataFlowType,
      label: 'revised draft',
      delay: 8500
    },
    {
      id: 'flow-5',
      edgeId: 'e3-2',
      source: 'reflection',
      target: 'agent',
      content: 'Improve readability',
      type: 'reflection' as DataFlowType,
      label: 'final feedback',
      delay: 11000
    },
    {
      id: 'flow-6',
      edgeId: 'e2-4',
      source: 'agent',
      target: 'output',
      content: 'Clear quantum computing explanation',
      type: 'response' as DataFlowType,
      label: 'response',
      delay: 13500
    }
  ];
  
  // Timeouts for animation
  let timeoutsRef = React.useRef<number[]>([]);
  
  // Start the animation
  const playAnimation = useCallback(() => {
    // Reset first
    stopAnimation();
    setIsPlaying(true);
    
    // Update node statuses
    setNodes(nodes => nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        status: null
      }
    })));
    
    // Get speed multiplier
    const speedMultiplier = speedValues[animationSpeed];
    
    // Create animation sequence
    const newTimeouts = flowSteps.map(step => {
      const adjustedDelay = step.delay / speedMultiplier;
      
      return setTimeout(() => {
        // Activate source node
        setNodes(nodes => nodes.map(node => 
          node.id === step.source 
            ? { ...node, data: { ...node.data, status: 'active' } }
            : node
        ));
        
        // Animate edge
        setEdges(edges => edges.map(edge => 
          edge.id === step.edgeId 
            ? { ...edge, animated: true }
            : edge
        ));
        
        // Add flow with label if needed
        setFlows(prev => [...prev, {
          ...step,
          progress: 0,
          timestamp: Date.now(),
          label: showLabels ? step.label : undefined
        }]);
        
        // After flow animation completes, update target node
        setTimeout(() => {
          setNodes(nodes => nodes.map(node => 
            node.id === step.target 
              ? { ...node, data: { ...node.data, status: 'active' } }
              : node
          ));
        }, 2000 / speedMultiplier);
        
      }, adjustedDelay);
    });
    
    // Store timeouts for cleanup
    timeoutsRef.current = newTimeouts;
    
    // Add timeout to mark animation complete
    const completionTimeout = setTimeout(() => {
      setIsPlaying(false);
    }, (flowSteps[flowSteps.length - 1].delay + 2000) / speedMultiplier);
    
    timeoutsRef.current.push(completionTimeout);
    
  }, [animationSpeed, showLabels]);
  
  // Stop animation and reset state
  const stopAnimation = useCallback(() => {
    setIsPlaying(false);
    
    // Clear timeouts
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    
    // Reset flows
    setFlows([]);
    
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
  }, []);
  
  // Clean up on unmount
  React.useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);
  
  // Handle flow completion
  const handleFlowComplete = useCallback((flowId: string) => {
    setFlows(prev => prev.filter(flow => flow.id !== flowId));
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Self-Reflection Loop</CardTitle>
        <CardDescription>
          Visualize how agents transform data through self-reflection iterations
        </CardDescription>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <Button
              onClick={isPlaying ? stopAnimation : playAnimation}
              variant={isPlaying ? "destructive" : "default"}
              size="sm"
            >
              {isPlaying ? <Stop className="mr-1" /> : <Play className="mr-1" />}
              {isPlaying ? 'Stop' : 'Start Animation'}
            </Button>
            <Button onClick={stopAnimation} variant="outline" size="sm" disabled={isPlaying}>
              <ArrowsCounterClockwise className="mr-1" />
              Reset
            </Button>
          </div>
          
          <div className="flex items-center gap-4">
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
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <StandardFlowVisualizer
          nodes={nodes}
          edges={edges}
          flows={flows}
          onFlowComplete={handleFlowComplete}
          animationSpeed={speedValues[animationSpeed]}
          showLabels={showLabels}
        />
      </CardContent>
    </Card>
  );
};

export default ExampleStandardFlow;