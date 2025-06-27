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

// Sample messages for various node types
const sampleMessages = {
  input: (query: string) => `User query: ${query}`,
  llm: [
    "Processing request...",
    "Analyzing input...",
    "Generating response...",
    "Evaluating options..."
  ],
  tool: [
    "Retrieving data...",
    "Searching for information...",
    "Calling external API...",
    "Executing function..."
  ],
  evaluator: [
    "Evaluating result quality...",
    "Checking for errors...",
    "Validating response...",
    "Assessing coherence..."
  ],
  planner: [
    "Creating execution plan...",
    "Decomposing task...",
    "Prioritizing subtasks...",
    "Scheduling operations..."
  ],
  memory: [
    "Retrieving relevant context...",
    "Storing information...",
    "Updating knowledge base...",
    "Searching memory for similar examples..."
  ],
  router: [
    "Determining optimal path...",
    "Selecting appropriate agent...",
    "Routing request based on content...",
    "Analyzing request type..."
  ]
};

export interface DataFlowState {
  messages: FlowMessage[];
  currentTime: number;
  isPlaying: boolean;
  speed: 'slow' | 'normal' | 'fast';
  activeNodes: Set<string>;
  activeEdges: Set<string>;
}

export interface DataFlow {
  id: string;
  edgeId: string;
  source: string;
  target: string;
  content: string;
  timestamp: number;
  type: 'message' | 'data' | 'response' | 'error';
  progress: number;
  label?: string;
  complete?: boolean;
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
 * Creates a flow object between nodes
 * @param source Source node ID
 * @param target Target node ID 
 * @param edgeId Edge ID
 * @param content Content of the message
 * @param type Type of message
 * @returns DataFlow object
 */
export const createDataFlow = (
  source: string,
  target: string,
  edgeId: string,
  content: string,
  type: 'message' | 'data' | 'response' | 'error' = 'message'
): DataFlow => {
  return {
    id: `flow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    edgeId,
    source,
    target,
    content,
    timestamp: Date.now(),
    type,
    progress: 0,
    complete: false
  };
};
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

/**
 * Simulates the flow of data through a pattern
 * This function creates a visualization of how data flows through the pattern nodes
 */
export const simulatePatternFlow = (
  nodes: any[],
  edges: any[],
  onNodeStatus: (nodeId: string, status: string | null) => void,
  onEdgeStatus: (edgeId: string, animated: boolean) => void,
  onDataFlow: (flow: DataFlow) => void,
  query: string = "Tell me about agent patterns",
  addStep: (step: () => void) => number | null | undefined = setTimeout,
  speedFactor: number = 1
) => {
  // Keep track of timeouts to clear them on cleanup
  const timeouts: Array<number | null> = [];
  const flowsInProgress: Set<string> = new Set();
  let cancelled = false;

  // Helper to check if node exists
  const getNode = (id: string) => nodes.find(n => n.id === id);
  
  // Helper to check if edge exists
  const getEdge = (source: string, target: string) => 
    edges.find(e => e.source === source && e.target === target);
  
  // Helper to get a random message based on node type
  const getRandomMessage = (nodeType: string) => {
    if (nodeType === 'input') return sampleMessages.input(query);
    
    const messages = sampleMessages[nodeType as keyof typeof sampleMessages];
    if (Array.isArray(messages)) {
      return messages[Math.floor(Math.random() * messages.length)];
    }
    return "Processing...";
  };
  
  // Start the simulation process
  const startSimulation = () => {
    // We'll use this to track our timing through the simulation
    let currentTime = 0;
    
    // Find the input node (usually the first node)
    const inputNode = nodes.find(n => n.data.nodeType === 'input');
    
    if (inputNode) {
      // Set the first node as active
      const initStep = () => {
        onNodeStatus(inputNode.id, 'processing');
      };
      
      timeouts.push(addStep(initStep));
      currentTime += 1000;
      
      // Find edges coming from the input node
      const firstEdges = edges.filter(e => e.source === inputNode.id);
      
      // Send data along each edge
      firstEdges.forEach(edge => {
        const targetNode = getNode(edge.target);
        if (targetNode) {
          const sendData = () => {
            // Activate the edge
            onEdgeStatus(edge.id, true);
            
            // Create a data flow animation along the edge
            const flow = createDataFlow(
              edge.source,
              edge.target,
              edge.id,
              getRandomMessage(inputNode.data.nodeType),
              'message'
            );
            
            flowsInProgress.add(flow.id);
            onDataFlow(flow);
            
            // Schedule processing at the target node
            const processTarget = () => {
              if (cancelled) return;
              
              // Mark this node as processing
              onNodeStatus(targetNode.id, 'processing');
              
              // Find all outgoing edges from this node
              const nextEdges = edges.filter(e => e.source === targetNode.id);
              
              // If this has outgoing edges, propagate through them
              if (nextEdges.length > 0) {
                // Wait a bit before sending to the next node
                const waitBeforeSending = () => {
                  nextEdges.forEach(nextEdge => {
                    const nextTarget = getNode(nextEdge.target);
                    if (nextTarget) {
                      // Create a function to send data along this edge
                      const sendToNext = () => {
                        onEdgeStatus(nextEdge.id, true);
                        
                        // Create flow for animation
                        const nextFlow = createDataFlow(
                          nextEdge.source,
                          nextEdge.target,
                          nextEdge.id,
                          getRandomMessage(targetNode.data.nodeType),
                          targetNode.data.nodeType === 'llm' ? 'response' : 'data'
                        );
                        
                        flowsInProgress.add(nextFlow.id);
                        onDataFlow(nextFlow);
                        
                        // Schedule processing at the next target
                        const processNextTarget = () => {
                          if (cancelled) return;
                          
                          onNodeStatus(nextTarget.id, 'processing');
                          
                          // If this is a terminal node, mark as success
                          if (edges.filter(e => e.source === nextTarget.id).length === 0) {
                            const finishSimulation = () => {
                              onNodeStatus(nextTarget.id, 'success');
                            };
                            timeouts.push(addStep(finishSimulation));
                          } else {
                            // Continue the pattern recursively
                            simulateNodeProcessing(nextTarget.id, currentTime + 1500);
                          }
                        };
                        
                        timeouts.push(addStep(processNextTarget));
                      };
                      
                      timeouts.push(addStep(sendToNext));
                    }
                  });
                };
                
                timeouts.push(addStep(waitBeforeSending));
              } else {
                // This is a terminal node
                const completeNode = () => {
                  onNodeStatus(targetNode.id, 'success');
                };
                
                timeouts.push(addStep(completeNode));
              }
            };
            
            timeouts.push(addStep(processTarget));
          };
          
          timeouts.push(addStep(sendData));
          currentTime += 1500;
        }
      });
    }
  };
  
  // Recursive function to simulate node processing and propagation
  const simulateNodeProcessing = (nodeId: string, startTime: number) => {
    const node = getNode(nodeId);
    if (!node || cancelled) return;
    
    let currentTime = startTime;
    
    // Set this node as active
    const activateNode = () => {
      onNodeStatus(nodeId, 'processing');
    };
    
    timeouts.push(addStep(activateNode));
    currentTime += 1000;
    
    // Process the node
    const processNode = () => {
      // Find outgoing edges
      const outEdges = edges.filter(e => e.source === nodeId);
      
      // If this is a terminal node, mark as success
      if (outEdges.length === 0) {
        onNodeStatus(nodeId, 'success');
        return;
      }
      
      // Send data along each edge
      outEdges.forEach(edge => {
        const targetNode = getNode(edge.target);
        if (targetNode && !cancelled) {
          const sendData = () => {
            onEdgeStatus(edge.id, true);
            
            // Create flow for animation
            const flow = createDataFlow(
              edge.source,
              edge.target,
              edge.id,
              getRandomMessage(node.data.nodeType),
              node.data.nodeType === 'llm' ? 'response' : 'data'
            );
            
            flowsInProgress.add(flow.id);
            onDataFlow(flow);
            
            // Schedule processing at the target node
            const processTarget = () => {
              if (cancelled) return;
              onNodeStatus(targetNode.id, 'processing');
              simulateNodeProcessing(targetNode.id, currentTime + 1500);
            };
            
            timeouts.push(addStep(processTarget));
          };
          
          timeouts.push(addStep(sendData));
          currentTime += 1500;
        }
      });
    };
    
    timeouts.push(addStep(processNode));
  };
  
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