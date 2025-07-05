import React from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Controls,
  Background,
  BackgroundVariant,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes: Node[] = [
  {
    id: 'test-1',
    type: 'default',
    data: { label: 'Test Node 1' },
    position: { x: 100, y: 100 },
    style: {
      background: '#fff',
      border: '2px solid #000',
      borderRadius: '6px',
      padding: '8px',
      minWidth: '120px',
    }
  },
  {
    id: 'test-2',
    type: 'default',
    data: { label: 'Test Node 2' },
    position: { x: 300, y: 100 },
    style: {
      background: '#fff',
      border: '2px solid #000',
      borderRadius: '6px',
      padding: '8px',
      minWidth: '120px',
    }
  },
];

const initialEdges: Edge[] = [
  {
    id: 'test-edge-1',
    source: 'test-1',
    target: 'test-2',
    style: {
      stroke: '#000',
      strokeWidth: 2,
    }
  },
];

const SimpleReactFlowTest: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="w-full h-96 border border-gray-400 rounded-md">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        style={{
          width: '100%',
          height: '100%',
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Controls />
      </ReactFlow>
    </div>
  );
};

const SimpleReactFlowTestWithProvider: React.FC = () => {
  return (
    <ReactFlowProvider>
      <SimpleReactFlowTest />
    </ReactFlowProvider>
  );
};

export default SimpleReactFlowTestWithProvider;
