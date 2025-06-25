import { useState, useCallback } from 'react'
import ReactFlow, { 
  Background, 
  Controls,
  MiniMap,
  Node, 
  Edge,
  Panel,
  Handle,
  Position,
  NodeTypes,
  useNodesState,
  useEdgesState
} from 'reactflow'
import 'reactflow/dist/style.css'
import { PatternData } from '@/lib/data/patterns'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface PatternVisualizerProps {
  patternData: PatternData
}

// Custom node types
const CustomNode = ({ data }: { data: any }) => {
  const getNodeStyle = () => {
    const baseStyle = {
      padding: '10px 20px',
      borderRadius: '8px',
    }
    
    switch(data.nodeType) {
      case 'input':
        return { ...baseStyle, backgroundColor: 'rgb(226, 232, 240)', border: '1px solid rgb(203, 213, 225)' }
      case 'llm':
        return { ...baseStyle, backgroundColor: 'rgb(219, 234, 254)', border: '1px solid rgb(147, 197, 253)' }
      case 'output':
        return { ...baseStyle, backgroundColor: 'rgb(220, 252, 231)', border: '1px solid rgb(134, 239, 172)' }
      case 'router':
        return { ...baseStyle, backgroundColor: 'rgb(254, 242, 220)', border: '1px solid rgb(253, 224, 71)' }
      case 'aggregator':
        return { ...baseStyle, backgroundColor: 'rgb(240, 253, 240)', border: '1px solid rgb(187, 247, 208)' }
      case 'evaluator':
        return { ...baseStyle, backgroundColor: 'rgb(237, 233, 254)', border: '1px solid rgb(196, 181, 253)' }
      case 'tool':
        return { ...baseStyle, backgroundColor: 'rgb(254, 226, 226)', border: '1px solid rgb(252, 165, 165)' }
      case 'planner':
        return { ...baseStyle, backgroundColor: 'rgb(224, 242, 254)', border: '1px solid rgb(125, 211, 252)' }
      case 'executor':
        return { ...baseStyle, backgroundColor: 'rgb(243, 232, 255)', border: '1px solid rgb(216, 180, 254)' }
      default:
        return { ...baseStyle, backgroundColor: 'white', border: '1px solid rgb(226, 232, 240)' }
    }
  }
  
  return (
    <div style={getNodeStyle()}>
      <Handle type="target" position={Position.Left} />
      <div>
        <strong>{data.label}</strong>
        {data.description && <div style={{ fontSize: '12px' }}>{data.description}</div>}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  )
}

const nodeTypes: NodeTypes = {
  input: CustomNode,
  default: CustomNode,
  output: CustomNode
}

const PatternVisualizer = ({ patternData }: PatternVisualizerProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(patternData.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(patternData.edges)
  
  return (
    <Card className="mb-6">
      <CardContent className="p-0 overflow-hidden">
        <div className="flex items-center gap-2 p-4 bg-muted">
          <h3 className="font-semibold">{patternData.name}</h3>
          <Badge variant="outline" className="ml-2">{patternData.id}</Badge>
        </div>
        <div className="p-4">
          <p className="text-muted-foreground mb-4">{patternData.description}</p>
        </div>
        <div style={{ height: 400 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
            <Panel position="bottom-center">
              <div className="bg-card p-2 rounded shadow-sm text-xs text-muted-foreground">
                Interact with the diagram: Zoom, pan, and select nodes
              </div>
            </Panel>
          </ReactFlow>
        </div>
        <div className="p-4 border-t border-border">
          <h4 className="font-medium mb-2">Best Suited For:</h4>
          <div className="flex flex-wrap gap-2">
            {patternData.useCases.map((useCase, index) => (
              <Badge key={index} variant="secondary">{useCase}</Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default PatternVisualizer