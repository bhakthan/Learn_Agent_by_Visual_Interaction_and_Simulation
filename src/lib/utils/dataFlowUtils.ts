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
 * @param patternId Pattern identifier
 * @param edges Flow edges
 * @param onCreateFlow Callback when a flow is created
 */
export const simulatePatternFlow = (
  patternId: string, 
  edges: Edge[], 
  onCreateFlow: (flow: DataFlowMessage) => void
) => {
  if (!edges || edges.length === 0) return;
  
  // Clear any existing flows first
  resetDataFlow();
  
  // Create sequential flows along edges
  const createSequentialFlows = async (index = 0) => {
    if (index >= edges.length) return;
    
    const edge = edges[index];
    const messageTypes: DataFlowType[] = ['message', 'data', 'response', 'query'];
    const messageType = messageTypes[Math.floor(Math.random() * messageTypes.length)];
    
    // Create a flow message
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
    
    // Call the callback to add the flow
    onCreateFlow(flow);
    
    // Wait for a delay proportional to the animation speed before creating the next flow
    const delay = 1200 / (globalSpeedMultiplier || 1);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Create the next flow
    createSequentialFlows(index + 1);
  };
  
  // Start creating flows
  createSequentialFlows();
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
 * Truncate flow content to a specific length
 * @param content Content to truncate
 * @param maxLength Maximum length
 * @returns Truncated content
 */
export const truncateFlowContent = (content: string, maxLength: number = 30): string => {
  if (content.length <= maxLength) return content;
  return `${content.substring(0, maxLength)}...`;
};