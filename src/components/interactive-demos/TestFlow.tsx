import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactFlowProvider } from 'reactflow';
import { StableFlowContainer } from '../visualization/StableFlowContainer';
import StandardFlowVisualizerWithProvider from '../visualization/StandardFlowVisualizer';

// Simple test nodes and edges
const testNodes = [
  {
    id: 'user',
    type: 'demoNode',
    position: { x: 100, y: 100 },
    data: { 
      label: 'User', 
      nodeType: 'user',
      status: 'complete'
    }
  },
  {
    id: 'agent',
    type: 'demoNode', 
    position: { x: 400, y: 100 },
    data: { 
      label: 'Agent',
      nodeType: 'agent',
      status: 'active'
    }
  },
  {
    id: 'output',
    type: 'demoNode',
    position: { x: 700, y: 100 },
    data: { 
      label: 'Output',
      nodeType: 'output',
      status: 'idle'
    }
  }
];

const testEdges = [
  {
    id: 'user-agent',
    source: 'user',
    target: 'agent',
    animated: true,
  },
  {
    id: 'agent-output',
    source: 'agent',
    target: 'output',
    animated: false,
  }
];

// Test data flow
const testFlows = [
  {
    id: 'flow-1',
    edgeId: 'user-agent',
    source: 'user',
    target: 'agent',
    content: 'User query',
    type: 'query',
    progress: 0.5,
    timestamp: Date.now()
  }
];

/**
 * Simple component to test ReactFlow visualization
 */
const TestFlow = () => {
  // Define the node types with AgentNode
  const nodeTypes = {
    demoNode: ({ data, id }: any) => (
      <div style={{
        padding: '10px', 
        background: 'white',
        border: '1px solid #ddd',
        borderRadius: '5px',
        width: '150px',
        boxShadow: data.status === 'active' ? '0 0 10px rgba(0, 0, 255, 0.5)' : 'none'
      }}>
        <div style={{ fontWeight: 'bold' }}>{data.label}</div>
        <div style={{ fontSize: '12px' }}>{data.nodeType}</div>
      </div>
    )
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Flow Visualization Test</CardTitle>
        <CardDescription>
          Testing the ReactFlow visualization components
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ReactFlowProvider>
            <StableFlowContainer
              className="border border-border rounded-md overflow-hidden"
              style={{ height: '400px', minHeight: '400px' }}
            >
              <StandardFlowVisualizerWithProvider
                nodes={testNodes}
                edges={testEdges}
                flows={testFlows}
                nodeTypes={nodeTypes}
                showControls={true}
                autoFitView={true}
              />
            </StableFlowContainer>
          </ReactFlowProvider>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestFlow;