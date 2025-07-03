/**
 * Utility functions for managing data flows in visualizations
 */

// Export type for data flow message types
export type DataFlowType = 
  'query' | 'response' | 'tool_call' | 'observation' | 
  'reflection' | 'plan' | 'message' | 'data' | 'error';

// Base data flow message interface
export interface BaseDataFlow {
  id: string;
  edgeId: string;
  source: string;
  target: string;
  content: string;
  timestamp: number;
  type: DataFlowType;
  progress: number;
  label?: string;
  complete?: boolean;
}

// Function to get animation speed multiplier
export function getSpeedMultiplier(speedSetting: number | string): number {
  if (typeof speedSetting === 'number') {
    return speedSetting;
  }
  
  switch(speedSetting) {
    case 'very-slow': return 0.3;
    case 'slow': return 0.6;
    case 'normal': return 1;
    case 'fast': return 1.8;
    case 'very-fast': return 3;
    default: return 1;
  }
}

/**
 * Get the appropriate styling for a data flow based on its type
 */
export function getNodeDataFlowParams(nodeType: string | undefined) {
  switch(nodeType?.toLowerCase()) {
    case 'user':
      return { color: '#60a5fa', pulseSpeed: 1.2 };
    case 'agent':
      return { color: '#34d399', pulseSpeed: 1 };
    case 'tool':
      return { color: '#fbbf24', pulseSpeed: 1.3 };
    case 'environment':
      return { color: '#a78bfa', pulseSpeed: 0.9 };
    case 'reflection':
      return { color: '#f472b6', pulseSpeed: 0.8 };
    case 'planner':
      return { color: '#22d3ee', pulseSpeed: 1.1 };
    case 'evaluator':
      return { color: '#f59e0b', pulseSpeed: 1.4 };
    default:
      return { color: '#94a3b8', pulseSpeed: 1 };
  }
}

/**
 * Get animation style parameters based on message type
 */
export function getDataFlowAnimationStyle(
  type?: DataFlowType,
  params?: { color: string; pulseSpeed: number }
) => {
  // Default values
  const defaults = {
    color: '#64748b',
    textColor: undefined,
    strokeWidth: 1.5,
    dotSize: 5,
    pulseSpeed: 1,
    fill: undefined
  };
  
  // Use custom params if provided
  if (params) {
    return {
      ...defaults,
      color: params.color,
      pulseSpeed: params.pulseSpeed
    };
  }
  
  // Type-specific styles
  switch(type) {
    case 'query':
      return {
        ...defaults,
        color: '#2563eb',
        strokeWidth: 2,
        dotSize: 6,
        pulseSpeed: 1.2
      };
    case 'response':
      return {
        ...defaults,
        color: '#10b981',
        strokeWidth: 2,
        dotSize: 6,
        pulseSpeed: 1
      };
    case 'tool_call':
      return {
        ...defaults,
        color: '#d97706',
        strokeWidth: 1.5,
        dotSize: 5,
        pulseSpeed: 1.3
      };
    case 'observation':
      return {
        ...defaults,
        color: '#7c3aed',
        strokeWidth: 1.5,
        dotSize: 5,
        pulseSpeed: 0.9
      };
    case 'reflection':
      return {
        ...defaults,
        color: '#db2777',
        strokeWidth: 1.5,
        dotSize: 5,
        pulseSpeed: 0.8
      };
    case 'plan':
      return {
        ...defaults,
        color: '#06b6d4',
        strokeWidth: 1.5,
        dotSize: 5,
        pulseSpeed: 1.1
      };
    case 'message':
      return {
        ...defaults,
        color: '#8b5cf6',
        strokeWidth: 1.5,
        dotSize: 5,
        pulseSpeed: 1
      };
    case 'data':
      return {
        ...defaults,
        color: '#0284c7',
        strokeWidth: 1.5,
        dotSize: 5,
        pulseSpeed: 1.2
      };
    case 'error':
      return {
        ...defaults,
        color: '#dc2626',
        strokeWidth: 2,
        dotSize: 6,
        pulseSpeed: 1.5
      };
    default:
      return defaults;
  }
};

// Utility to truncate flow content for display
export const truncateFlowContent = (content: string, maxLength: number = 30): string => {
  if (content.length <= maxLength) return content;
  return `${content.substring(0, maxLength)}...`;
};

/**
 * Simulates a pattern flow with specific messages
 */
export const simulatePatternFlow = (
  pattern: string,
  onAddFlow: (flow: BaseDataFlow) => void,
  onUpdateNodeStatus: (nodeId: string, status: string) => void,
  speed: number = 1
) => {
  const flows: any[] = [];
  let timeouts: NodeJS.Timeout[] = [];
  
  // Function to create a flow
  const createFlow = (
    source: string,
    target: string,
    content: string,
    type: DataFlowType,
    delay: number,
    label?: string
  ) => {
    const id = `flow-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const edgeId = `${source}-${target}`;
    
    // Get source node ready
    const sourceTimeout = setTimeout(() => {
      onUpdateNodeStatus(source, 'active');
    }, delay);
    timeouts.push(sourceTimeout);
    
    // Create flow after a short delay
    const flowTimeout = setTimeout(() => {
      const flow: BaseDataFlow = {
        id,
        edgeId,
        source,
        target,
        content,
        timestamp: Date.now(),
        type,
        progress: 0,
        label: label || content
      };
      
      onAddFlow(flow);
      flows.push(flow);
      
      // Activate target node after flow completes
      const targetTimeout = setTimeout(() => {
        onUpdateNodeStatus(target, 'active');
      }, 2000 / speed);
      timeouts.push(targetTimeout);
      
    }, delay + 200);
    timeouts.push(flowTimeout);
  };
  
  // Reset all flows and timeouts
  const resetDataFlow = () => {
    timeouts.forEach(clearTimeout);
    timeouts = [];
  };
  
  // Return flow control functions
  return {
    createDataFlow: createFlow,
    resetDataFlow,
    getSpeedMultiplier
  };
};

// Export all the utility functions
export { simulatePatternFlow, getDataFlowAnimationStyle, createDataFlow, resetDataFlow, getSpeedMultiplier };

// Helper to create a flow
function createDataFlow(
  source: string,
  target: string,
  content: string,
  type: DataFlowType,
  onAddFlow: (flow: BaseDataFlow) => void
) {
  const id = `flow-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const edgeId = `${source}-${target}`;
  
  const flow: BaseDataFlow = {
    id,
    edgeId,
    source,
    target,
    content,
    timestamp: Date.now(),
    type,
    progress: 0
  };
  
  onAddFlow(flow);
  return flow;
}

// Helper to reset data flows
function resetDataFlow(timeouts: NodeJS.Timeout[]) {
  timeouts.forEach(clearTimeout);
}