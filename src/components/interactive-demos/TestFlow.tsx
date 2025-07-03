import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import StandardFlowVisualizerWithProvider from '../visualization/StandardFlowVisualizer'
import { StableFlowContainer } from '../visualization/StableFlowContainer'
import { Button } from '@/components/ui/button'
import { Play, Stop, ArrowsCounterClockwise, ToggleRight } from '@phosphor-icons/react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

// Simple test nodes
const getInitialNodes = (randomize = false) => {
  if (!randomize) {
    return [
      {
        id: 'node1',
        data: { label: 'User Input', nodeType: 'input' },
        position: { x: 100, y: 100 },
        type: 'agent',
      },
      {
        id: 'node2',
        data: { label: 'Agent', nodeType: 'llm' },
        position: { x: 350, y: 100 },
        type: 'agent',
      },
      {
        id: 'node3',
        data: { label: 'Tool', nodeType: 'tool' },
        position: { x: 600, y: 100 },
        type: 'agent',
      },
      {
        id: 'node4',
        data: { label: 'Response', nodeType: 'output' },
        position: { x: 350, y: 250 },
        type: 'agent',
      }
    ];
  } else {
    // Return nodes with random positions
    return [
      {
        id: 'node1',
        data: { label: 'User Input', nodeType: 'input' },
        position: { x: Math.random() * 500, y: Math.random() * 300 },
        type: 'agent',
      },
      {
        id: 'node2',
        data: { label: 'Agent', nodeType: 'llm' },
        position: { x: Math.random() * 500, y: Math.random() * 300 },
        type: 'agent',
      },
      {
        id: 'node3',
        data: { label: 'Tool', nodeType: 'tool' },
        position: { x: Math.random() * 500, y: Math.random() * 300 },
        type: 'agent',
      },
      {
        id: 'node4',
        data: { label: 'Response', nodeType: 'output' },
        position: { x: Math.random() * 500, y: Math.random() * 300 },
        type: 'agent',
      }
    ];
  }
};

// Simple test edges
const initialEdges = [
  { id: 'edge1-2', source: 'node1', target: 'node2', animated: false },
  { id: 'edge2-3', source: 'node2', target: 'node3', animated: false },
  { id: 'edge3-2', source: 'node3', target: 'node2', animated: false },
  { id: 'edge2-4', source: 'node2', target: 'node4', animated: false },
];

const TestFlow = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [flows, setFlows] = useState<any[]>([]);
  const [useAdaptiveContainer, setUseAdaptiveContainer] = useState(true);
  const [randomizePositions, setRandomizePositions] = useState(false);
  const simulationTimer = useRef<NodeJS.Timeout | null>(null);

  // Reset flows and animation
  const resetSimulation = useCallback(() => {
    setFlows([]);
    setIsSimulating(false);
    if (simulationTimer.current) {
      clearTimeout(simulationTimer.current);
      simulationTimer.current = null;
    }
  }, []);

  // Randomize positions
  const toggleRandomPositions = useCallback(() => {
    setRandomizePositions(prev => !prev);
  }, []);

  // Start the simulation
  const startSimulation = useCallback(() => {
    resetSimulation();
    setIsSimulating(true);

    // Flow 1: User input to Agent
    simulationTimer.current = setTimeout(() => {
      setFlows(prev => [...prev, {
        id: 'flow1',
        edgeId: 'edge1-2',
        source: 'node1',
        target: 'node2',
        content: 'User query',
        type: 'query',
        progress: 0,
        label: 'Query'
      }]);
    }, 500);

    // Flow 2: Agent to Tool
    simulationTimer.current = setTimeout(() => {
      setFlows(prev => [...prev, {
        id: 'flow2',
        edgeId: 'edge2-3',
        source: 'node2',
        target: 'node3',
        content: 'Tool request',
        type: 'tool_call',
        progress: 0,
        label: 'Tool Call'
      }]);
    }, 2000);

    // Flow 3: Tool to Agent
    simulationTimer.current = setTimeout(() => {
      setFlows(prev => [...prev, {
        id: 'flow3',
        edgeId: 'edge3-2',
        source: 'node3',
        target: 'node2',
        content: 'Tool response',
        type: 'observation',
        progress: 0,
        label: 'Result'
      }]);
    }, 3500);

    // Flow 4: Agent to Output
    simulationTimer.current = setTimeout(() => {
      setFlows(prev => [...prev, {
        id: 'flow4',
        edgeId: 'edge2-4',
        source: 'node2',
        target: 'node4',
        content: 'Final response',
        type: 'response',
        progress: 0,
        label: 'Response'
      }]);
    }, 5000);
    
    // End simulation
    simulationTimer.current = setTimeout(() => {
      setIsSimulating(false);
    }, 7000);
  }, [resetSimulation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (simulationTimer.current) {
        clearTimeout(simulationTimer.current);
      }
    };
  }, []);

  // Handle flow completion
  const handleFlowComplete = (flowId: string) => {
    console.log(`Flow ${flowId} completed`);
    // Remove from active flows
    setFlows(prev => prev.filter(flow => flow.id !== flowId));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stable Flow Visualization Test</CardTitle>
        <p className="text-muted-foreground">Test the improved flow visualization with stable rendering</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Button
              onClick={isSimulating ? resetSimulation : startSimulation}
              disabled={isSimulating && !simulationTimer.current}
            >
              {isSimulating ? (
                <>
                  <Stop className="mr-2" size={16} />
                  Stop
                </>
              ) : (
                <>
                  <Play className="mr-2" size={16} />
                  Start Simulation
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={resetSimulation}
              disabled={!flows.length}
            >
              <ArrowsCounterClockwise className="mr-2" size={16} />
              Reset
            </Button>
            <Button
              variant="outline"
              onClick={toggleRandomPositions}
            >
              <ToggleRight className="mr-2" size={16} />
              {randomizePositions ? 'Use Ordered Layout' : 'Randomize Positions'}
            </Button>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="use-adaptive"
                checked={useAdaptiveContainer}
                onCheckedChange={setUseAdaptiveContainer}
              />
              <Label htmlFor="use-adaptive">Use Adaptive Flow</Label>
            </div>
          </div>
        </div>
        
        <div style={{ height: 400 }} className="optimized-flow-container border rounded-md">
          {useAdaptiveContainer ? (
            <StableFlowContainer minHeight="400px" style={{ height: "400px" }}>
              <StandardFlowVisualizerWithProvider
                nodes={getInitialNodes(randomizePositions)}
                edges={initialEdges}
                flows={flows}
                onFlowComplete={handleFlowComplete}
                animationSpeed={1}
                showLabels={true}
                showControls={true}
                autoFitView={true}
                className="h-full w-full"
              />
            </StableFlowContainer>
          ) : (
            <StandardFlowVisualizerWithProvider
              nodes={getInitialNodes(randomizePositions)}
              edges={initialEdges}
              flows={flows}
              onFlowComplete={handleFlowComplete}
              animationSpeed={1}
              showLabels={true}
              showControls={true}
              autoFitView={true}
              className="h-full w-full"
            />
          )}
        </div>
        
        <div className="mt-4 p-4 border rounded-md bg-muted/30">
          <h3 className="font-medium mb-2">Stable Flow Container Features</h3>
          <ul className="list-disc ml-6 space-y-1 text-sm">
            <li>Provides reliable rendering of flow components with consistent visibility</li>
            <li>Prevents common ReactFlow rendering issues and layout shifts</li>
            <li>Hardware-accelerated rendering with visual stability enhancements</li>
            <li>Handles resize events gracefully with proper re-rendering</li>
            <li>Prevents ResizeObserver loop errors with enhanced error handling</li>
            <li>Maintains optimal view of all nodes regardless of viewport size</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestFlow;