import { Handle, Position, NodeTypes } from 'reactflow';

// Custom node types
const CustomNode = ({ data, id }: { data: any, id: string }) => {
  const getNodeStyle = () => {
    const baseStyle = {
      padding: '10px 20px',
      borderRadius: '8px',
      transition: 'all 0.2s ease',
    }
    
    // Add active state styles if the node is active
    const isActive = data.isActive;
    const activeStyle = isActive ? {
      boxShadow: '0 0 0 2px var(--primary), 0 0 15px rgba(66, 153, 225, 0.5)',
      transform: 'scale(1.02)'
    } : {};
    
    switch(data.nodeType) {
      case 'input':
        return { ...baseStyle, backgroundColor: 'rgb(226, 232, 240)', border: '1px solid rgb(203, 213, 225)', ...activeStyle }
      case 'llm':
        return { ...baseStyle, backgroundColor: 'rgb(219, 234, 254)', border: '1px solid rgb(147, 197, 253)', ...activeStyle }
      case 'output':
        return { ...baseStyle, backgroundColor: 'rgb(220, 252, 231)', border: '1px solid rgb(134, 239, 172)', ...activeStyle }
      case 'router':
        return { ...baseStyle, backgroundColor: 'rgb(254, 242, 220)', border: '1px solid rgb(253, 224, 71)', ...activeStyle }
      case 'aggregator':
        return { ...baseStyle, backgroundColor: 'rgb(240, 253, 240)', border: '1px solid rgb(187, 247, 208)', ...activeStyle }
      case 'evaluator':
        return { ...baseStyle, backgroundColor: 'rgb(237, 233, 254)', border: '1px solid rgb(196, 181, 253)', ...activeStyle }
      case 'tool':
        return { ...baseStyle, backgroundColor: 'rgb(254, 226, 226)', border: '1px solid rgb(252, 165, 165)', ...activeStyle }
      case 'planner':
        return { ...baseStyle, backgroundColor: 'rgb(224, 242, 254)', border: '1px solid rgb(125, 211, 252)', ...activeStyle }
      case 'executor':
        return { ...baseStyle, backgroundColor: 'rgb(243, 232, 255)', border: '1px solid rgb(216, 180, 254)', ...activeStyle }
      default:
        return { ...baseStyle, backgroundColor: 'white', border: '1px solid rgb(226, 232, 240)', ...activeStyle }
    }
  }
  
  return (
    <div style={getNodeStyle()}>
      <Handle type="target" position={Position.Left} />
      <div>
        <strong>{data.label}</strong>
        {data.description && <div style={{ fontSize: '12px' }}>{data.description}</div>}
        {data.status && (
          <div className="mt-1 text-xs px-2 py-1 rounded" style={{
            backgroundColor: 
              data.status === 'processing' ? 'rgba(59, 130, 246, 0.2)' : 
              data.status === 'success' ? 'rgba(16, 185, 129, 0.2)' : 
              data.status === 'error' ? 'rgba(239, 68, 68, 0.2)' : 
              'transparent',
            color: 
              data.status === 'processing' ? 'rgb(59, 130, 246)' : 
              data.status === 'success' ? 'rgb(16, 185, 129)' : 
              data.status === 'error' ? 'rgb(239, 68, 68)' : 
              'inherit'
          }}>
            {data.status === 'processing' ? 'Processing...' : 
             data.status === 'success' ? 'Complete' : 
             data.status === 'error' ? 'Error' : ''}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  )
}

export const nodeTypes: NodeTypes = {
  input: CustomNode,
  default: CustomNode,
  output: CustomNode
}

export const messageTemplates = {
  input: (text: string = '') => `User input: "${text}"`,
  llm: (text: string = '') => `Processing with AI: "${text}"`,
  router: () => "Routing decision being made...",
  aggregator: () => "Combining results from multiple sources...",
  tool: (toolName: string = 'External API') => `Using tool: ${toolName}`,
  output: (text: string = '') => `Final result: "${text}"`,
  error: () => "Error occurred during processing",
  planner: () => "Creating execution plan...",
  executor: () => "Executing tasks...",
  evaluator: () => "Evaluating results...",
  default: () => "Processing data..."
};

export default {
  nodeTypes,
  messageTemplates
};