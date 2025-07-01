/**
 * Utilities for managing data flow visualization animations
 */

import { Edge } from 'reactflow';

// Data flow animation types
export type DataFlowType = 'query' | 'response' | 'tool_call' | 'observation' | 'reflection' | 'plan' | 'message' | 'data' | 'error';

// Message animation speed control
let globalSpeedMultiplier = 1; // Default normal speed

/**
 * Set the global animation speed multiplier
 * @param speed Speed multiplier (0.5 = slow, 1 = normal, 2 = fast)
 */
export const setSpeedMultiplier = (speed: number) => {
  globalSpeedMultiplier = Math.max(0.1, Math.min(5, speed)); // Clamp between 0.1 and 5
};

/**
 * Get the current animation speed multiplier
 */
export const getSpeedMultiplier = () => globalSpeedMultiplier;

/**
 * Interface for data flow messages
 */
export interface DataFlowMessage {
  id: string;
  edgeId: string;
  source: string;
  target: string;
  content: string;
  timestamp: number;
  type: DataFlowType;
  progress: number;
  complete?: boolean;
}

/**
 * Interface for edge points
 */
export interface EdgePoints {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
}

/**
 * Map of active data flows
 */
const activeFlows = new Map<string, { 
  message: DataFlowMessage;
  startTime: number;
  duration: number;
  animationFrameId?: number;
}>();

/**
 * Simulates a pattern flow by creating data flow messages
 * @param nodes Flow nodes
 * @param edges Flow edges
 * @param handleNodeStatus Callback to update node status
 * @param handleEdgeStatus Callback to update edge animation state
 * @param handleDataFlow Callback when a flow is created
 * @param query Input query for simulation
 * @param handleAddStep Callback for step-by-step mode
 * @param speedFactor Speed multiplier for animation
 * @returns Object with cleanup function
 */
export const simulatePatternFlow = (
  nodes: any[],
  edges: Edge[], 
  handleNodeStatus: (nodeId: string, status: string | null) => void,
  handleEdgeStatus: (edgeId: string, animated: boolean) => void,
  handleDataFlow: (flow: DataFlowMessage) => void,
  query: string = '',
  handleAddStep?: (step: () => void) => number | null,
  speedFactor: number = 1
) => {
  if (!edges || edges.length === 0) return { cleanup: () => {} };
  
  // Clear any existing flows first
  resetDataFlow();
  
  // Keep track of timeouts for cleanup
  const timeouts: (number | null)[] = [];
  
  // Keep track of visited nodes for non-linear flows
  const visitedNodes = new Set<string>();
  const visitedEdges = new Set<string>();
  
  // Get starting nodes (usually input nodes)
  const startNodes = nodes.filter(node => 
    node.data?.nodeType === 'input' || 
    edges.every(edge => edge.target !== node.id)
  );
  
  if (startNodes.length === 0) return { cleanup: () => {} };
  
  // Process a node and its outgoing edges
  const processNode = (nodeId: string, delay: number = 0) => {
    // Skip if already processed
    if (visitedNodes.has(nodeId)) return;
    visitedNodes.add(nodeId);
    
    // Find outgoing edges
    const outgoingEdges = edges.filter(edge => edge.source === nodeId);
    
    // Set this node as active with a delay
    const nodeActivationTimeout = handleAddStep ? 
      handleAddStep(() => handleNodeStatus(nodeId, 'processing')) :
      setTimeout(() => handleNodeStatus(nodeId, 'processing'), delay);
    
    if (typeof nodeActivationTimeout === 'number') {
      timeouts.push(nodeActivationTimeout);
    }
    
    // Generate content based on node type
    const node = nodes.find(n => n.id === nodeId);
    const nodeType = node?.data?.nodeType || 'default';
    
    // Wait a bit, then process outgoing edges
    const processEdgesTimeout = handleAddStep ? 
      handleAddStep(() => {
        // Complete this node after a delay
        const nodeCompleteTimeout = handleAddStep ? 
          handleAddStep(() => handleNodeStatus(nodeId, 'success')) :
          setTimeout(() => handleNodeStatus(nodeId, 'success'), 800 / speedFactor);
        
        if (typeof nodeCompleteTimeout === 'number') {
          timeouts.push(nodeCompleteTimeout);
        }
        
        // Process each outgoing edge
        outgoingEdges.forEach((edge, index) => {
          if (visitedEdges.has(edge.id)) return;
          visitedEdges.add(edge.id);
          
          const targetNodeDelay = 1000 / speedFactor + (index * 500 / speedFactor);
          
          // Animate edge
          const animateEdgeTimeout = handleAddStep ? 
            handleAddStep(() => handleEdgeStatus(edge.id, true)) :
            setTimeout(() => handleEdgeStatus(edge.id, true), 100);
          
          if (typeof animateEdgeTimeout === 'number') {
            timeouts.push(animateEdgeTimeout);
          }
          
          // Create flow message
          const messageTypes: DataFlowType[] = ['message', 'data', 'response', 'query'];
          const messageType = messageTypes[Math.floor(Math.random() * messageTypes.length)];
          
          const flow: DataFlowMessage = {
            id: `flow-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            edgeId: edge.id,
            source: edge.source,
            target: edge.target,
            content: `${messageType} from ${edge.source} to ${edge.target}`,
            timestamp: Date.now(),
            type: messageType,
            progress: 0
          };
          
          // Add flow with a delay
          const addFlowTimeout = handleAddStep ? 
            handleAddStep(() => handleDataFlow(flow)) :
            setTimeout(() => handleDataFlow(flow), 200);
          
          if (typeof addFlowTimeout === 'number') {
            timeouts.push(addFlowTimeout);
          }
          
          // Process target node
          const processTargetTimeout = handleAddStep ? 
            handleAddStep(() => processNode(edge.target, 0)) :
            setTimeout(() => processNode(edge.target, 0), targetNodeDelay);
          
          if (typeof processTargetTimeout === 'number') {
            timeouts.push(processTargetTimeout);
          }
        });
      }) :
      setTimeout(() => {
        // Complete this node after a delay
        const nodeCompleteTimeout = setTimeout(() => handleNodeStatus(nodeId, 'success'), 800 / speedFactor);
        timeouts.push(nodeCompleteTimeout);
        
        // Process each outgoing edge
        outgoingEdges.forEach((edge, index) => {
          if (visitedEdges.has(edge.id)) return;
          visitedEdges.add(edge.id);
          
          const targetNodeDelay = 1000 / speedFactor + (index * 500 / speedFactor);
          
          // Animate edge
          const animateEdgeTimeout = setTimeout(() => handleEdgeStatus(edge.id, true), 100);
          timeouts.push(animateEdgeTimeout);
          
          // Create flow message
          const messageTypes: DataFlowType[] = ['message', 'data', 'response', 'query'];
          const messageType = messageTypes[Math.floor(Math.random() * messageTypes.length)];
          
          const flow: DataFlowMessage = {
            id: `flow-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            edgeId: edge.id,
            source: edge.source,
            target: edge.target,
            content: `${messageType} from ${edge.source} to ${edge.target}`,
            timestamp: Date.now(),
            type: messageType,
            progress: 0
          };
          
          // Add flow with a delay
          const addFlowTimeout = setTimeout(() => handleDataFlow(flow), 200);
          timeouts.push(addFlowTimeout);
          
          // Process target node
          const processTargetTimeout = setTimeout(() => processNode(edge.target, 0), targetNodeDelay);
          timeouts.push(processTargetTimeout);
        });
      }, delay + 500 / speedFactor);
    
    if (typeof processEdgesTimeout === 'number') {
      timeouts.push(processEdgesTimeout);
    }
  };
  
  // Start processing from all start nodes
  startNodes.forEach((node, index) => {
    const startDelay = index * 500 / speedFactor;
    const startNodeTimeout = handleAddStep ? 
      handleAddStep(() => processNode(node.id, 0)) :
      setTimeout(() => processNode(node.id, 0), startDelay);
    
    if (typeof startNodeTimeout === 'number') {
      timeouts.push(startNodeTimeout);
    }
  });
  
  // Return cleanup function to cancel all timeouts
  const cleanup = () => {
    timeouts.forEach(timeoutId => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    });
    resetDataFlow();
  };
  
  return { cleanup };
};

/**
 * Creates a data flow
 * @param message Flow message data
 * @param duration Animation duration in ms
 * @param onComplete Callback when animation completes
 */
export const createDataFlow = (
  message: DataFlowMessage, 
  duration: number = 2000,
  onComplete?: (id: string) => void
) => {
  // Scale duration based on speed multiplier
  const adjustedDuration = duration / (globalSpeedMultiplier || 1);
  
  // Store flow data
  activeFlows.set(message.id, {
    message,
    startTime: performance.now(),
    duration: adjustedDuration
  });
  
  // Set up animation loop
  const animate = (timestamp: number) => {
    const flowData = activeFlows.get(message.id);
    if (!flowData) return;
    
    const elapsed = timestamp - flowData.startTime;
    const progress = Math.min(1, elapsed / flowData.duration);
    
    // Update message progress
    message.progress = progress;
    
    if (progress < 1) {
      // Continue animation
      flowData.animationFrameId = requestAnimationFrame(animate);
    } else {
      // Animation complete
      message.complete = true;
      
      // Call completion callback after a short delay
      setTimeout(() => {
        if (onComplete) onComplete(message.id);
        activeFlows.delete(message.id);
      }, 500); // Leave complete state visible briefly
    }
  };
  
  // Start animation
  activeFlows.get(message.id)!.animationFrameId = requestAnimationFrame(animate);
  
  return message.id;
};

/**
 * Reset all data flows
 */
export const resetDataFlow = () => {
  // Cancel all active animations
  activeFlows.forEach(flow => {
    if (flow.animationFrameId) {
      cancelAnimationFrame(flow.animationFrameId);
    }
  });
  
  // Clear all flows
  activeFlows.clear();
};

/**
 * Get animation style parameters based on message type
 * @param type Message type
 * @param params Optional style parameters
 * @returns Style object for the animation
 */
export const getDataFlowAnimationStyle = (
  type: DataFlowType = 'message',
  params?: { color: string; pulseSpeed: number }
) => {
  // Default values
  let color = 'rgba(59, 130, 246, 0.9)'; // Blue
  let pulseSpeed = 1;
  
  // Override with params if provided
  if (params) {
    color = params.color;
    pulseSpeed = params.pulseSpeed;
  } else {
    // Set defaults based on type
    switch (type) {
      case 'query':
        color = 'rgba(59, 130, 246, 0.9)'; // Blue
        pulseSpeed = 1.2;
        break;
      case 'response':
        color = 'rgba(16, 185, 129, 0.9)'; // Green
        pulseSpeed = 0.8;
        break;
      case 'tool_call':
        color = 'rgba(245, 158, 11, 0.9)'; // Amber
        pulseSpeed = 1.5;
        break;
      case 'observation':
        color = 'rgba(139, 92, 246, 0.9)'; // Purple
        pulseSpeed = 0.9;
        break;
      case 'reflection':
        color = 'rgba(236, 72, 153, 0.9)'; // Pink
        pulseSpeed = 0.7;
        break;
      case 'plan':
        color = 'rgba(22, 163, 74, 0.9)'; // Emerald
        pulseSpeed = 1;
        break;
      case 'error':
        color = 'rgba(239, 68, 68, 0.9)'; // Red
        pulseSpeed = 1.8;
        break;
      case 'data':
        color = 'rgba(234, 179, 8, 0.9)'; // Yellow
        pulseSpeed = 1.1;
        break;
      default:
        // Default message style
        color = 'rgba(59, 130, 246, 0.9)'; // Blue
        pulseSpeed = 1;
    }
  }
  
  return { color, pulseSpeed };
};

/**
 * Get animation parameters for node data flow
 * @param nodeType Type of node
 * @returns Animation parameters
 */
export const getNodeDataFlowParams = (nodeType: string) => {
  // Define colors for different node types
  switch (nodeType) {
    case 'user':
      return { 
        color: 'rgba(59, 130, 246, 0.9)', // Blue
        pulseSpeed: 1.2,
        stroke: 'rgba(59, 130, 246, 0.9)',
        strokeWidth: 4,
        fill: 'rgba(59, 130, 246, 0.2)'
      };
    case 'agent':
      return { 
        color: 'rgba(16, 185, 129, 0.9)', // Green
        pulseSpeed: 1,
        stroke: 'rgba(16, 185, 129, 0.9)',
        strokeWidth: 4,
        fill: 'rgba(16, 185, 129, 0.2)'
      };
    case 'tool':
      return { 
        color: 'rgba(245, 158, 11, 0.9)', // Amber
        pulseSpeed: 1.5,
        stroke: 'rgba(245, 158, 11, 0.9)',
        strokeWidth: 4,
        fill: 'rgba(245, 158, 11, 0.2)'
      };
    case 'reflection':
      return { 
        color: 'rgba(236, 72, 153, 0.9)', // Pink
        pulseSpeed: 0.7,
        stroke: 'rgba(236, 72, 153, 0.9)',
        strokeWidth: 4,
        fill: 'rgba(236, 72, 153, 0.2)'
      };
    case 'environment':
      return { 
        color: 'rgba(139, 92, 246, 0.9)', // Purple
        pulseSpeed: 0.9,
        stroke: 'rgba(139, 92, 246, 0.9)',
        strokeWidth: 4,
        fill: 'rgba(139, 92, 246, 0.2)'
      };
    case 'planner':
      return { 
        color: 'rgba(22, 163, 74, 0.9)', // Emerald
        pulseSpeed: 1,
        stroke: 'rgba(22, 163, 74, 0.9)',
        strokeWidth: 4,
        fill: 'rgba(22, 163, 74, 0.2)'
      };
    case 'evaluator':
      return { 
        color: 'rgba(234, 179, 8, 0.9)', // Yellow
        pulseSpeed: 1.1,
        stroke: 'rgba(234, 179, 8, 0.9)',
        strokeWidth: 4,
        fill: 'rgba(234, 179, 8, 0.2)'
      };
    case 'error':
      return { 
        color: 'rgba(239, 68, 68, 0.9)', // Red
        pulseSpeed: 1.8,
        stroke: 'rgba(239, 68, 68, 0.9)',
        strokeWidth: 4,
        fill: 'rgba(239, 68, 68, 0.2)'
      };
    default:
      // Default node style
      return { 
        color: 'rgba(59, 130, 246, 0.9)', // Blue
        pulseSpeed: 1,
        stroke: 'rgba(59, 130, 246, 0.9)',
        strokeWidth: 4,
        fill: 'rgba(59, 130, 246, 0.2)'
      };
  }
};

/**
 * Truncate flow content to a specific length
 * @param content Content to truncate
 * @param maxLength Maximum length
 * @returns Truncated content
 */
export const truncateFlowContent = (content: string, maxLength: number = 30): string => {
  if (content.length <= maxLength) return content;
  return `${content.substring(0, maxLength)}...`;
};