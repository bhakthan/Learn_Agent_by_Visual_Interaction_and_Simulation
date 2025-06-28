import { Node, Edge } from 'reactflow';
import { PatternData } from '../data/patterns';

// The speed at which flow animations happen
export type FlowSpeed = 'slow' | 'normal' | 'fast';

export interface FlowMessage {
  id: string;
  source: string;
  target: string;
  content: string;
  startTime: number;
  endTime?: number;
  delivered: boolean;
  type?: 'query' | 'response' | 'tool_call' | 'observation' | 'reflection' | 'plan' | 'message' | 'data' | 'error';
}

export interface DataFlowState {
  messages: FlowMessage[];
  activeNodes: Set<string>;
  activeEdges: Set<string>;
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  selectedMessage: FlowMessage | null;
  speed: FlowSpeed;
  stepMode: boolean;
  hasSimulationRun: boolean;
}

export interface DataFlow {
  id: string;
  source: string;
  target: string;
  content: string;
  type?: 'query' | 'response' | 'tool_call' | 'observation' | 'reflection' | 'plan' | 'message' | 'data' | 'error';
  delay?: number;
  duration?: number;
}

// Initial state for the flow visualization
export const initialDataFlowState: DataFlowState = {
  messages: [],
  activeNodes: new Set(),
  activeEdges: new Set(),
  isPlaying: false,
  isPaused: false,
  currentTime: 0,
  duration: 0,
  selectedMessage: null,
  speed: 'normal',
  stepMode: false,
  hasSimulationRun: false
};

/**
 * Create a new data flow message
 */
export const createDataFlow = (
  source: string,
  target: string,
  content: string,
  type?: 'query' | 'response' | 'tool_call' | 'observation' | 'reflection' | 'plan' | 'message' | 'data' | 'error',
  delay: number = 0,
  duration: number = 1000
): DataFlow => {
  return {
    id: `flow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    source,
    target,
    content,
    type: type || 'message',
    delay,
    duration
  };
};

/**
 * Get speed multiplier based on speed setting
 */
export const getSpeedMultiplier = (speed: 'slow' | 'normal' | 'fast'): number => {
  switch (speed) {
    case 'slow': return 0.5;
    case 'fast': return 2;
    case 'normal':
    default: return 1;
  }
};

/**
 * Filter messages to those that should be visible at the current time
 */
export const getVisibleMessages = (messages: FlowMessage[], currentTime: number): FlowMessage[] => {
  return messages.filter(msg => msg.startTime <= currentTime && (!msg.endTime || msg.endTime > currentTime));
};

/**
 * Calculate which nodes and edges should be active based on visible messages
 */
export const calculateActiveElements = (messages: FlowMessage[], patternNodes: { id: string }[], patternEdges: { id: string, source: string, target: string }[]): { activeNodes: Set<string>, activeEdges: Set<string> } => {
  const activeNodes = new Set<string>();
  const activeEdges = new Set<string>();

  messages.forEach(msg => {
    activeNodes.add(msg.source);
    activeNodes.add(msg.target);

    // Find the edge that corresponds to this message
    const edge = patternEdges.find(e => e.source === msg.source && e.target === msg.target);
    if (edge) {
      activeEdges.add(edge.id);
    }
  });

  return { activeNodes, activeEdges };
};

/**
 * Get the latest message for each edge
 */
export const getLatestMessages = (messages: FlowMessage[]): FlowMessage[] => {
  // Map to store the latest message for each edge (source -> target)
  const edgeLatestMessage = new Map<string, FlowMessage>();
  
  // Process messages from oldest to newest
  [...messages].sort((a, b) => a.startTime - b.startTime).forEach(msg => {
    const edgeKey = `${msg.source}-${msg.target}`;
    edgeLatestMessage.set(edgeKey, msg);
  });
  
  // Return only the latest message for each edge
  return Array.from(edgeLatestMessage.values());
};

/**
 * Truncate flow message content for display
 */
export const truncateFlowContent = (content: string, maxLength: number = 30): string => {
  if (content.length <= maxLength) return content;
  return `${content.substring(0, maxLength)}...`;
};

/**
 * Generate sample flow data for a pattern
 */
export const generateSampleFlowData = (pattern: any): FlowMessage[] => {
  const messages: FlowMessage[] = [];
  
  // Simple flow generation based on edges
  pattern.edges.forEach((edge: any, index: number) => {
    messages.push({
      id: `sample-${index}`,
      source: edge.source,
      target: edge.target,
      content: `Sample ${edge.label || 'message'} ${index + 1}`,
      startTime: (index + 1) * 1000,
      delivered: true,
      type: index % 3 === 0 ? 'query' : index % 3 === 1 ? 'response' : 'tool_call'
    });
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
  type?: 'query' | 'response' | 'tool_call' | 'observation' | 'reflection' | 'plan' | 'message' | 'data' | 'error',
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

  // Customize based on message type
  switch (type) {
    case 'query':
      return {
        stroke: params.color || '#3b82f6', // Blue
        fill: params.color || '#3b82f6',
        strokeWidth: 2,
        strokeDasharray: '5,5',
        animationDuration: params.pulseSpeed ? `${params.pulseSpeed}s` : '2s',
      };
    case 'response':
      return {
        stroke: params.color || '#10b981', // Green
        fill: params.color || '#10b981', 
        strokeWidth: 2,
        strokeDasharray: '5,3',
        animationDuration: params.pulseSpeed ? `${params.pulseSpeed}s` : '1.5s',
      };
    case 'tool_call':
      return {
        stroke: params.color || '#8b5cf6', // Purple
        fill: params.color || '#8b5cf6',
        strokeWidth: 2,
        strokeDasharray: '5,2,2,2',
        animationDuration: params.pulseSpeed ? `${params.pulseSpeed}s` : '1.8s',
      };
    default:
      return defaultStyle;
  }
};

export const getNodeDataFlowParams = (
  nodeType: string | undefined
): { 
  color: string; 
  icon?: string;
  pulseSpeed: number;
} => {
  // Default values
  const defaultParams = {
    color: '#64748b',
    pulseSpeed: 1.5
  };

  // No specific type
  if (!nodeType) {
    return defaultParams;
  }

  // Customize based on node type
  switch (nodeType) {
    case 'input':
      return { color: '#3b82f6', pulseSpeed: 1.2 }; // Blue
    case 'llm':
      return { color: '#10a37f', pulseSpeed: 1.5 }; // Green
    case 'tool':
      return { color: '#8b5cf6', pulseSpeed: 1.8 }; // Purple
    case 'output':
      return { color: '#ef4444', pulseSpeed: 2.0 }; // Red
    case 'router':
      return { color: '#f97316', pulseSpeed: 1.2 }; // Orange
    case 'evaluator':
      return { color: '#06b6d4', pulseSpeed: 1.8 }; // Cyan
    case 'planner':
      return { color: '#ec4899', pulseSpeed: 1.5 }; // Pink
    case 'executor':
      return { color: '#84cc16', pulseSpeed: 1.8 }; // Lime
    case 'aggregator':
      return { color: '#f59e0b', pulseSpeed: 2.0 }; // Amber
    default:
      return defaultParams;
  }
};

/**
 * Simulate the flow of data through a pattern
 */
export const simulatePatternFlow = (
  pattern: PatternData,
  nodes: Node[],
  edges: Edge[],
  onUpdate: (state: Partial<DataFlowState>) => void,
  speedSetting: FlowSpeed = 'normal',
  stepMode: boolean = false
) => {
  const timeouts: (number | null)[] = [];
  let cancelled = false;
  const speedMultiplier = getSpeedMultiplier(speedSetting);
  let currentTime = 0;
  
  // Find nodes and edges in the simulation
  const getNode = (id: string) => nodes.find(n => n.id === id);
  
  // New messages array for the simulation
  const messages: FlowMessage[] = [];
  
  // Core simulation functions
  const startSimulation = () => {
    // Reset state
    onUpdate({
      messages: [],
      activeNodes: new Set(),
      activeEdges: new Set(),
      currentTime: 0,
      duration: 0,
      hasSimulationRun: true
    });

    // Find the input node(s)
    const inputNodes = nodes.filter(node => 
      (node.type === 'input' || (node.data?.nodeType === 'input')) ||
      !edges.some(e => e.target === node.id)
    );
    
    if (inputNodes.length === 0) {
      console.error('No input nodes found in the pattern');
      return;
    }
    
    // Start with the input nodes
    inputNodes.forEach(node => {
      simulateNodeProcessing(node.id, 0);
    });
  };
  
  // Process a node and its outgoing edges
  const simulateNodeProcessing = (nodeId: string, startTime: number) => {
    const node = getNode(nodeId);
    if (!node || cancelled) return;
    
    // Calculate node processing time
    const processingTime = calculateNodeProcessingTime(node);
    const processedTime = startTime + processingTime;
    
    // Activate the node with a delay
    const activateNode = () => {
      if (cancelled) return;
      
      onUpdate(prevState => ({
        activeNodes: new Set([...prevState.activeNodes, nodeId])
      }));
      
      // Schedule the node to finish processing and send data to connected nodes
      timeouts.push(window.setTimeout(processNode, processingTime / speedMultiplier));
    };
    
    // Process outgoing edges from this node
    const processNode = () => {
      if (cancelled) return;
      
      const outEdges = edges.filter(e => e.source === nodeId);
      
      // If there are no outgoing edges, we're done with this branch
      if (outEdges.length === 0) return;
      
      // Send data along each edge
      outEdges.forEach((edge, index) => {
        const targetNode = getNode(edge.target);
        if (!targetNode) return;
        
        // Calculate delay for this edge based on index (for visual effect)
        const edgeDelay = 300 * index;
        
        // Send data along this edge
        const sendData = () => {
          if (cancelled) return;
          
          // Create a data flow message
          const flow = createDataFlow(
            nodeId,
            edge.target,
            generateMessageContent(nodeId, edge.target),
            determineMessageType(node, targetNode),
            0,
            1000
          );
          
          const message: FlowMessage = {
            ...flow,
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            startTime: processedTime + edgeDelay,
            delivered: false
          };
          
          messages.push(message);
          onUpdate({ messages: [...messages] });
          
          // Process the target node after the message is delivered
          const processTarget = () => {
            if (cancelled) return;
            
            // Mark message as delivered
            const updatedMessages = messages.map(m => 
              m.id === message.id 
                ? { ...m, delivered: true, endTime: message.startTime + 1000 } 
                : m
            );
            
            messages.splice(0, messages.length, ...updatedMessages);
            onUpdate({ messages: [...messages] });
            
            // Process the next node 
            simulateNodeProcessing(edge.target, processedTime + edgeDelay + 1000);
          };
          
          // Schedule the next node to process
          timeouts.push(window.setTimeout(processTarget, 1000 / speedMultiplier));
        };
        
        // Schedule sending data with the edge delay
        timeouts.push(window.setTimeout(sendData, edgeDelay / speedMultiplier));
      });
    };
    
    // Start activating this node
    timeouts.push(window.setTimeout(activateNode, 0));
  };
  
  // Helper to calculate node processing time based on node type
  const calculateNodeProcessingTime = (node: Node): number => {
    const nodeType = node.data?.nodeType || node.type;
    
    // Different processing times for different types of nodes
    switch (nodeType) {
      case 'llm': return 2000; // LLM nodes take longer to process
      case 'tool': return 1500; // Tool calls take a medium amount of time
      case 'evaluator': return 1800; // Evaluators take a bit more time
      case 'router': return 1000; // Routers are relatively quick
      case 'aggregator': return 1500; // Aggregators take a medium amount of time
      default: return 800; // Default processing time
    }
  };
  
  // Generate content for messages between nodes
  const generateMessageContent = (sourceId: string, targetId: string): string => {
    const sourceNode = getNode(sourceId);
    const targetNode = getNode(targetId);
    
    if (!sourceNode || !targetNode) return 'Data';
    
    const sourceType = sourceNode.data?.nodeType || sourceNode.type;
    const targetType = targetNode.data?.nodeType || targetNode.type;
    
    // Generate different content based on node types
    if (sourceType === 'input' && targetType === 'llm') {
      return 'User query';
    } else if (sourceType === 'llm' && targetType === 'tool') {
      return 'Tool request';
    } else if (sourceType === 'tool' && targetType === 'llm') {
      return 'Tool response';
    } else if (sourceType === 'llm' && targetType === 'output') {
      return 'Final response';
    } else if (sourceType === 'router') {
      return 'Routing decision';
    } else if (targetType === 'evaluator') {
      return 'Evaluation request';
    } else if (sourceType === 'evaluator') {
      return 'Evaluation result';
    } else if (sourceType === 'planner' && targetType === 'executor') {
      return 'Execution plan';
    } else if (sourceType === 'executor') {
      return 'Execution result';
    }
    
    return 'Data transfer';
  };
  
  // Determine the message type based on source and target nodes
  const determineMessageType = (
    sourceNode: Node,
    targetNode: Node
  ): 'query' | 'response' | 'tool_call' | 'observation' | 'reflection' | 'plan' | 'message' | 'data' | 'error' => {
    const sourceType = sourceNode.data?.nodeType || sourceNode.type;
    const targetType = targetNode.data?.nodeType || targetNode.type;
    
    if (sourceType === 'input' || sourceNode.id === 'input') {
      return 'query';
    } else if (targetType === 'output' || targetNode.id === 'output' || targetNode.id === 'result') {
      return 'response';
    } else if (sourceType === 'llm' && targetType === 'tool') {
      return 'tool_call';
    } else if (sourceType === 'tool' && targetType === 'llm') {
      return 'observation';
    } else if (targetType === 'evaluator' || sourceType === 'evaluator') {
      return 'reflection';
    } else if (sourceType === 'planner') {
      return 'plan';
    }
    
    return 'message';
  };
  
  // Complete the entire node to show it's done processing
  const completeNode = () => {};
  
  // Start the simulation
  startSimulation();
  
  // Return a cleanup function
  return {
    cleanup: () => {
      cancelled = true;
      // Clear all timeouts
      timeouts.forEach(timeout => {
        if (timeout !== null && typeof window !== 'undefined') {
          window.clearTimeout(timeout);
        }
      });
    }
  };
};