/**
 * Utility functions for data flow visualizations
 */

export interface FlowMessage {
  id: string;
  source: string;
  target: string;
  content: string;
  timestamp: number;
  type?: 'query' | 'response' | 'tool_call' | 'observation' | 'reflection' | 'plan';
  status?: 'pending' | 'success' | 'error' | 'in_progress';
}

export interface DataFlowState {
  messages: FlowMessage[];
  currentTime: number;
  isPlaying: boolean;
  speed: 'slow' | 'normal' | 'fast';
  activeNodes: Set<string>;
  activeEdges: Set<string>;
}

export const initialDataFlowState: DataFlowState = {
  messages: [],
  currentTime: 0,
  isPlaying: false,
  speed: 'normal',
  activeNodes: new Set(),
  activeEdges: new Set()
};

/**
 * Returns a speed multiplier based on the selected speed
 */
export const getSpeedMultiplier = (speed: 'slow' | 'normal' | 'fast'): number => {
  switch (speed) {
    case 'slow': return 0.5;
    case 'fast': return 2.0;
    case 'normal':
    default: return 1.0;
  }
};

/**
 * Get messages visible at the current time
 */
export const getVisibleMessages = (messages: FlowMessage[], currentTime: number): FlowMessage[] => {
  return messages.filter(message => message.timestamp <= currentTime);
};

/**
 * Calculate active nodes and edges based on visible messages
 */
export const calculateActiveElements = (messages: FlowMessage[], patternNodes: { id: string }[], patternEdges: { id: string, source: string, target: string }[]): { activeNodes: Set<string>, activeEdges: Set<string> } => {
  const activeNodes = new Set<string>();
  const activeEdges = new Set<string>();
  
  // Add all source and target nodes from visible messages
  messages.forEach(message => {
    activeNodes.add(message.source);
    activeNodes.add(message.target);
    
    // Find matching edge
    const matchingEdge = patternEdges.find(
      edge => edge.source === message.source && edge.target === message.target
    );
    
    if (matchingEdge) {
      activeEdges.add(matchingEdge.id);
    }
  });
  
  return { activeNodes, activeEdges };
};

/**
 * Find the latest message for each node pair
 */
export const getLatestMessages = (messages: FlowMessage[]): FlowMessage[] => {
  const latestMessages = new Map<string, FlowMessage>();
  
  messages.forEach(message => {
    const key = message.source + '-' + message.target;
    
    if (!latestMessages.has(key) || latestMessages.get(key)!.timestamp < message.timestamp) {
      latestMessages.set(key, message);
    }
  });
  
  return Array.from(latestMessages.values());
};

/**
 * Truncate message content for display
 */
export const truncateFlowContent = (content: string, maxLength: number = 30): string => {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + "...";
};

/**
 * Generate sample flow data for a pattern
 */
export const generateSampleFlowData = (pattern: any): FlowMessage[] => {
  const messages: FlowMessage[] = [];
  const nodes = pattern.nodes;
  const edges = pattern.edges;
  
  let timestamp = 1000;
  
  // Generate sample data based on the pattern structure
  edges.forEach((edge, index) => {
    timestamp += 1000;
    
    const sourceNode = nodes.find(node => node.id === edge.source);
    const targetNode = nodes.find(node => node.id === edge.target);
    
    if (sourceNode && targetNode) {
      let messageType: 'query' | 'response' | 'tool_call' | 'observation' | 'reflection' | 'plan' = 'query';
      
      if (sourceNode.data.nodeType === 'input') messageType = 'query';
      else if (sourceNode.data.nodeType === 'llm') messageType = 'response';
      else if (sourceNode.data.nodeType === 'tool') messageType = 'observation';
      else if (sourceNode.data.nodeType === 'evaluator') messageType = 'reflection';
      else if (sourceNode.data.nodeType === 'planner') messageType = 'plan';
      
      messages.push({
        id: `msg-${index}`,
        source: edge.source,
        target: edge.target,
        content: `Sample ${messageType} from ${sourceNode.data.label} to ${targetNode.data.label}`,
        timestamp,
        type: messageType,
        status: 'success'
      });
    }
  });
  
  return messages;
};

/**
 * Reset flow to initial state
 */
export const resetDataFlow = (): DataFlowState => {
  return {
    ...initialDataFlowState,
    currentTime: 0,
    isPlaying: false
  };
};

/**
 * Get animation style parameters based on message type
 */
export const getDataFlowAnimationStyle = (
  type?: 'query' | 'response' | 'tool_call' | 'observation' | 'reflection' | 'plan',
  params?: { color: string; pulseSpeed: number }
) => {
  // Default values
  const defaultStyle = {
    stroke: '#10a37f',
    fill: '#10a37f',
    strokeWidth: 2,
    strokeDasharray: '10,5',
    animationDuration: '3s',
  };

  if (!type || !params) {
    return defaultStyle;
  }

  return {
    stroke: params.color,
    fill: params.color,
    strokeWidth: 2,
    strokeDasharray: type === 'reflection' ? '5,3' : '10,5',
    animationDuration: `${4 / params.pulseSpeed}s`,
  };
};

/**
 * Get node-specific flow parameters based on node type
 */
export const getNodeDataFlowParams = (
  nodeType: string
): { color: string; pulseSpeed: number } => {
  switch (nodeType) {
    case 'input':
      return { color: '#3b82f6', pulseSpeed: 1.2 }; // Blue
    case 'llm':
      return { color: '#10b981', pulseSpeed: 1.5 }; // Green
    case 'tool':
      return { color: '#f59e0b', pulseSpeed: 0.8 }; // Amber
    case 'evaluator':
      return { color: '#8b5cf6', pulseSpeed: 1 }; // Purple
    case 'planner':
      return { color: '#ec4899', pulseSpeed: 0.9 }; // Pink
    case 'memory':
      return { color: '#6366f1', pulseSpeed: 0.7 }; // Indigo
    case 'output':
      return { color: '#ef4444', pulseSpeed: 1.3 }; // Red
    default:
      return { color: '#10a37f', pulseSpeed: 1 }; // Default OpenAI green
  }
};