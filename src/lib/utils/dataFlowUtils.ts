// Utility functions for data flow animations and visual representations

export interface DataFlowPayload {
  id: string;
  source: string;
  target: string;
  content: string;
  timestamp: number;
  type?: 'message' | 'data' | 'response' | 'error';
  category?: 'user-input' | 'system-message' | 'tool-call' | 'reasoning' | 'decision';
}

export interface DataFlowVisualParams {
  speed?: 'slow' | 'medium' | 'fast';
  color?: string;
  size?: 'small' | 'medium' | 'large';
  pulseEffect?: boolean;
  label?: string;
  category?: string;
  detailLevel?: 'basic' | 'detailed' | 'timeline';
}

/**
 * Creates a data flow payload to represent information flowing between nodes
 */
export const createDataFlow = (
  source: string,
  target: string,
  content: string,
  type: 'message' | 'data' | 'response' | 'error' = 'message',
  category?: 'user-input' | 'system-message' | 'tool-call' | 'reasoning' | 'decision'
): DataFlowPayload => {
  return {
    id: `flow-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    source,
    target,
    content,
    timestamp: Date.now(),
    type,
    category
  };
};

/**
 * Gets the appropriate animation style for a data flow type
 */
export const getDataFlowAnimationStyle = (
  type: 'message' | 'data' | 'response' | 'error',
  params: DataFlowVisualParams = {}
) => {
  const { speed = 'medium', pulseEffect = false, detailLevel = 'basic' } = params;
  
  // Calculate animation duration based on speed
  const durationMap = {
    slow: 1.5,
    medium: 1,
    fast: 0.5
  };
  
  // Calculate color based on type
  const colorMap = {
    message: params.color || '#3b82f6', // blue
    data: params.color || '#10b981', // green
    response: params.color || '#8b5cf6', // purple
    error: params.color || '#ef4444', // red
    default: '#64748b' // gray
  };
  
  // Calculate size of the flow indicator - bigger for detailed mode
  const sizeMultiplier = detailLevel === 'detailed' ? 1.5 : 1;
  const sizeMap = {
    small: 6 * sizeMultiplier,
    medium: 8 * sizeMultiplier,
    large: 10 * sizeMultiplier
  };
  
  const color = colorMap[type] || colorMap.default;
  
  return {
    stroke: color,
    fill: color + '15', // Light background color with opacity
    strokeWidth: sizeMap[params.size || 'medium'],
    animationDuration: `${durationMap[speed]}s`,
    strokeDasharray: pulseEffect ? '5 5' : undefined,
    zIndex: 1000,
    ... (type === 'error' ? { strokeDasharray: '5 5' } : {})
  };
};

/**
 * Truncates content to be displayed in flow visualizations
 */
export const truncateFlowContent = (content: string, maxLength: number = 30): string => {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + "...";
};

/**
 * Maps node type to appropriate data flow visualization parameters
 */
export const getNodeDataFlowParams = (nodeType?: string): DataFlowVisualParams => {
  switch (nodeType) {
    case 'llm':
      return { 
        color: '#3b82f6', 
        size: 'medium', 
        speed: 'medium', 
        category: 'reasoning'
      };
    case 'router':
      return { 
        color: '#f59e0b', 
        size: 'small', 
        speed: 'fast',
        category: 'decision' 
      };
    case 'aggregator':
      return { 
        color: '#10b981', 
        size: 'large', 
        speed: 'slow', 
        pulseEffect: true,
        category: 'system-message'
      };
    case 'evaluator':
      return { 
        color: '#8b5cf6', 
        size: 'medium', 
        speed: 'medium',
        category: 'reasoning'
      };
    case 'tool':
      return { 
        color: '#ef4444', 
        size: 'medium', 
        speed: 'fast',
        category: 'tool-call'
      };
    case 'planner':
      return { 
        color: '#06b6d4', 
        size: 'medium', 
        speed: 'medium',
        category: 'reasoning'
      };
    case 'executor':
      return { 
        color: '#d946ef', 
        size: 'medium', 
        speed: 'fast',
        category: 'system-message'
      };
    case 'input':
      return { 
        color: '#475569', 
        size: 'medium', 
        speed: 'medium',
        category: 'user-input'
      };  
    case 'output':
      return { 
        color: '#16a34a', 
        size: 'medium', 
        speed: 'medium',
        category: 'system-message'
      };
    default:
      return { 
        color: '#64748b', 
        size: 'medium', 
        speed: 'medium',
        category: 'system-message'
      };
  }
};

/**
 * Generates message content based on node type and context
 */
export const generateFlowContent = (
  sourceType: string, 
  targetType: string,
  context?: string
): string => {
  // Basic templates for different node interactions
  const templates: Record<string, Record<string, string[]>> = {
    input: {
      llm: ["Processing user query: '{context}'", "User input: '{context}'"],
      router: ["Determining routing for: '{context}'"],
      default: ["Input: '{context}'"]
    },
    llm: {
      output: ["Generated response: '{context}'", "AI response ready"],
      evaluator: ["Submitting for evaluation", "Requesting quality check"],
      aggregator: ["Contributing to aggregated response", "Adding AI insight to collection"],
      router: ["Providing options to router"],
      default: ["AI processing complete"]
    },
    router: {
      llm: ["Routing to appropriate model", "Selected agent for processing"],
      tool: ["Selecting tool: '{context}'", "Dispatching to external tool"],
      executor: ["Routing task for execution"],
      default: ["Routing decision made"]
    },
    aggregator: {
      output: ["Combined results ready", "Aggregated multiple inputs"],
      evaluator: ["Submitting aggregated result for quality check"],
      default: ["Aggregation complete"]
    },
    evaluator: {
      llm: ["Feedback: '{context}'", "Quality assessment returned"],
      output: ["Evaluation passed: '{context}'"],
      default: ["Evaluation complete"]
    },
    tool: {
      aggregator: ["Tool result ready for aggregation"],
      llm: ["Tool output for processing: '{context}'"],
      default: ["Tool execution complete"]
    },
    planner: {
      executor: ["Execution plan ready", "Tasks queued for execution"],
      default: ["Planning complete"]
    },
    executor: {
      output: ["Execution results: '{context}'"],
      evaluator: ["Submitting execution results for evaluation"],
      default: ["Execution complete"]
    },
    default: {
      default: ["Processing data", "Transferring information"]
    }
  };
  
  // Special case handling for tool nodes to guarantee toolName is defined
  if (sourceType === 'tool' && !context) {
    context = 'External API';
  }
  
  // Get template options for this node type pair
  const sourceTemplates = templates[sourceType] || templates.default;
  const targetOptions = sourceTemplates[targetType] || sourceTemplates.default;
  
  // Select a random template from available options
  const template = targetOptions[Math.floor(Math.random() * targetOptions.length)];
  
  // Replace context placeholder if available
  const safeContext = context || '';
  return template.replace(/{context}/g, truncateFlowContent(safeContext, 15));
};

/**
 * Simulates a typical flow through a pattern based on its structure
 */
export const simulatePatternFlow = (
  nodes: any[],
  edges: any[],
  onNodeStatus: (nodeId: string, status: string | null) => void,
  onEdgeStatus: (edgeId: string, animated: boolean) => void,
  onDataFlow: (flow: any) => void,
  inputMessage: string = "Sample query", // Default value provided
  queueStepFn?: (stepFn: () => void) => NodeJS.Timeout | null,
  speedFactor: number = 1
) => {
  // Clear any timers
  const timers: NodeJS.Timeout[] = [];
  
  // Find the input node (usually the first one)
  const inputNode = nodes.find(node => node.data.nodeType === 'input') || nodes[0];
  if (!inputNode) return { cleanup: () => timers.forEach(clearTimeout) };
  
  // Track visited nodes to avoid loops
  const visitedNodes = new Set<string>();
  const activeFlows = new Set<string>();
  
  // Process a node and its outgoing connections
  const processNode = (nodeId: string, delay: number, messageContext?: string) => {
    // Skip if already processed (prevent cycles)
    if (visitedNodes.has(nodeId)) return;
    visitedNodes.add(nodeId);
    
    // Create a step function that will be either queued or executed directly
    const executeNodeStep = () => {
      // Update node status to processing
      onNodeStatus(nodeId, 'processing');
      
      // Find the current node
      const currentNode = nodes.find(n => n.id === nodeId);
      if (!currentNode) return;
      
      // Find outgoing edges
      const outgoingEdges = edges.filter(e => e.source === nodeId);
      
      // After processing delay, update status and process outgoing connections
      const processEdges = () => {
        // Update node status to success
        onNodeStatus(nodeId, 'success');
        
        // Process each outgoing connection
        outgoingEdges.forEach((edge, index) => {
          // Create a function to handle this edge
          const processEdgeStep = () => {
            // Update edge animation
            onEdgeStatus(edge.id, true);
            
            // Find target node
            const targetNode = nodes.find(n => n.id === edge.target);
            if (!targetNode) return;
            
            // Generate appropriate message for this connection
            const nodeType = currentNode.data.nodeType || 'default';
            const targetType = targetNode.data.nodeType || 'default'; 
            const flowContent = generateFlowContent(nodeType, targetType, messageContext);
            
            // Create data flow
            const flowId = `flow-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            activeFlows.add(flowId);
            
            // Determine flow type based on node types
            let flowType: 'message' | 'data' | 'response' | 'error' = 'message';
            if (nodeType === 'llm') flowType = 'response';
            else if (nodeType === 'tool' || nodeType === 'aggregator') flowType = 'data';
            else if (Math.random() > 0.95) flowType = 'error'; // 5% chance of error
            
            // Set the toolName if this is a tool node (fixes the toolName undefined error)
            const localMessageContext = nodeType === 'tool' 
              ? (currentNode.data.label || 'External API')
              : messageContext;
            
            const newFlow = {
              id: flowId,
              edgeId: edge.id,
              source: edge.source,
              target: edge.target,
              content: flowContent || "Processing data...", // Ensure content is never undefined
              timestamp: Date.now(),
              type: flowType,
              progress: 0,
              complete: false,
              label: flowType === 'error' ? 'Error' : undefined
            };
            
            // Emit the flow
            onDataFlow(newFlow);
            
            // When flow completes, process the next node
            // Calculate a variable delay based on node type
            let targetDelay = 1000 / speedFactor; // default
            if (targetType === 'aggregator') targetDelay = 2000 / speedFactor;
            else if (targetType === 'router') targetDelay = 800 / speedFactor;
            else if (targetType === 'llm') targetDelay = 1500 / speedFactor;
            
            // Process the target node after flow completion + targetDelay
            const processTargetNode = () => {
              activeFlows.delete(flowId);
              processNode(edge.target, 100 / speedFactor, localMessageContext);
            };
            
            // Either queue or execute the target node processing
            if (queueStepFn) {
              const timer = queueStepFn(processTargetNode);
              if (timer) timers.push(timer);
            } else {
              const timer = setTimeout(processTargetNode, targetDelay);
              timers.push(timer);
            }
          };
          
          // Either queue this edge step or execute it directly
          if (queueStepFn) {
            const timer = queueStepFn(processEdgeStep);
            if (timer) timers.push(timer);
          } else {
            // Add a slight delay between multiple edges from the same node
            const timer = setTimeout(processEdgeStep, index * 300 / speedFactor);
            timers.push(timer);
          }
        });
      };
      
      // Either queue the edge processing or execute it directly
      if (queueStepFn) {
        const timer = queueStepFn(processEdges);
        if (timer) timers.push(timer);
      } else {
        const processingTimer = setTimeout(processEdges, 1200 / speedFactor);
        timers.push(processingTimer);
      }
    };
    
    // Either queue the node execution or execute it directly
    if (queueStepFn) {
      const timer = queueStepFn(executeNodeStep);
      if (timer) timers.push(timer);
    } else {
      const timer = setTimeout(executeNodeStep, delay);
      timers.push(timer);
    }
  };
  
  // Start processing from the input node
  processNode(inputNode.id, 100 / speedFactor, inputMessage);
  
  // Return a cleanup function to cancel all timers
  return {
    cleanup: () => timers.forEach(clearTimeout)
  };
};