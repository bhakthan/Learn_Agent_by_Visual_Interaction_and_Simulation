// Utility functions for data flow animations and visual representations

export interface DataFlowPayload {
  id: string;
  source: string;
  target: string;
  content: string;
  timestamp: number;
  type?: 'message' | 'data' | 'response' | 'error';
}

export interface DataFlowVisualParams {
  speed?: 'slow' | 'medium' | 'fast';
  color?: string;
  size?: 'small' | 'medium' | 'large';
  pulseEffect?: boolean;
  label?: string;
}

/**
 * Creates a data flow payload to represent information flowing between nodes
 */
export const createDataFlow = (
  source: string,
  target: string,
  content: string,
  type: 'message' | 'data' | 'response' | 'error' = 'message'
): DataFlowPayload => {
  return {
    id: `flow-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    source,
    target,
    content,
    timestamp: Date.now(),
    type
  };
};

/**
 * Gets the appropriate animation style for a data flow type
 */
export const getDataFlowAnimationStyle = (
  type: 'message' | 'data' | 'response' | 'error',
  params: DataFlowVisualParams = {}
) => {
  const { speed = 'medium', pulseEffect = false } = params;
  
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
  
  // Calculate size of the flow indicator
  const sizeMap = {
    small: 6,
    medium: 8,
    large: 10
  };
  
  const color = colorMap[type] || colorMap.default;
  
  return {
    stroke: color,
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
  return `${content.substring(0, maxLength)}...`;
};

/**
 * Maps node type to appropriate data flow visualization parameters
 */
export const getNodeDataFlowParams = (nodeType?: string): DataFlowVisualParams => {
  switch (nodeType) {
    case 'llm':
      return { color: '#3b82f6', size: 'medium', speed: 'medium' };
    case 'router':
      return { color: '#f59e0b', size: 'small', speed: 'fast' };
    case 'aggregator':
      return { color: '#10b981', size: 'large', speed: 'slow', pulseEffect: true };
    case 'evaluator':
      return { color: '#8b5cf6', size: 'medium', speed: 'medium' };
    case 'tool':
      return { color: '#ef4444', size: 'medium', speed: 'fast' };
    case 'planner':
      return { color: '#06b6d4', size: 'medium', speed: 'medium' };
    case 'executor':
      return { color: '#d946ef', size: 'medium', speed: 'fast' };
    case 'input':
      return { color: '#475569', size: 'medium', speed: 'medium' };  
    case 'output':
      return { color: '#16a34a', size: 'medium', speed: 'medium' };
    default:
      return { color: '#64748b', size: 'medium', speed: 'medium' };
  }
};