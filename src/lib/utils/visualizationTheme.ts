/**
 * Standardized visualization theme to ensure consistent styling across all components
 */
import { useTheme } from '@/components/theme/ThemeProvider';

// Node types with standardized colors
export type NodeType = 'user' | 'agent' | 'tool' | 'reflection' | 'environment' | 'planner' | 'evaluator' | 'input' | 'output' | 'error' | 'default';

// Flow types with standardized colors
export type FlowType = 'query' | 'response' | 'tool_call' | 'observation' | 'reflection' | 'plan' | 'message' | 'data' | 'error';

// Interface for node style parameters
export interface NodeStyleParams {
  backgroundColor: string;
  borderColor: string;
  color: string;
  handleColor: string;
  boxShadow?: string;
  fill: string;
  stroke: string;
  strokeWidth: number;
  pulseSpeed: number;
}

// Interface for flow style parameters
export interface FlowStyleParams {
  color: string;
  pulseSpeed: number;
  strokeWidth: number;
  fill: string;
  dotSize?: number;
  textColor?: string;
  label?: string;
}

/**
 * Get the standardized style parameters for a node type
 * @param nodeType Type of node
 * @param isDarkMode Whether dark mode is active
 * @returns Style parameters object
 */
export const getNodeStyleParams = (nodeType: NodeType = 'default', isDarkMode: boolean = false): NodeStyleParams => {
  // Default style
  const defaultStyle: NodeStyleParams = {
    backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.7)',
    color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
    handleColor: 'rgba(59, 130, 246, 0.9)',
    fill: 'rgba(59, 130, 246, 0.2)',
    stroke: 'rgba(59, 130, 246, 0.9)',
    strokeWidth: 4,
    pulseSpeed: 1
  };

  // Node type specific styles
  switch (nodeType) {
    case 'user':
    case 'input':
      return {
        backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgba(59, 130, 246, 0.7)',
        color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
        handleColor: 'rgba(59, 130, 246, 0.9)',
        fill: 'rgba(59, 130, 246, 0.2)',
        stroke: 'rgba(59, 130, 246, 0.9)',
        strokeWidth: 4,
        pulseSpeed: 1.2
      };
    case 'agent':
      return {
        backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
        borderColor: 'rgba(16, 185, 129, 0.7)',
        color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
        handleColor: 'rgba(16, 185, 129, 0.9)',
        fill: 'rgba(16, 185, 129, 0.2)',
        stroke: 'rgba(16, 185, 129, 0.9)',
        strokeWidth: 4,
        pulseSpeed: 1
      };
    case 'tool':
      return {
        backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)',
        borderColor: 'rgba(245, 158, 11, 0.7)',
        color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
        handleColor: 'rgba(245, 158, 11, 0.9)',
        fill: 'rgba(245, 158, 11, 0.2)',
        stroke: 'rgba(245, 158, 11, 0.9)',
        strokeWidth: 4,
        pulseSpeed: 1.5
      };
    case 'reflection':
      return {
        backgroundColor: isDarkMode ? 'rgba(236, 72, 153, 0.2)' : 'rgba(236, 72, 153, 0.1)',
        borderColor: 'rgba(236, 72, 153, 0.7)',
        color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
        handleColor: 'rgba(236, 72, 153, 0.9)',
        fill: 'rgba(236, 72, 153, 0.2)',
        stroke: 'rgba(236, 72, 153, 0.9)',
        strokeWidth: 4,
        pulseSpeed: 0.7
      };
    case 'environment':
    case 'output':
      return {
        backgroundColor: isDarkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)',
        borderColor: 'rgba(139, 92, 246, 0.7)',
        color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
        handleColor: 'rgba(139, 92, 246, 0.9)',
        fill: 'rgba(139, 92, 246, 0.2)',
        stroke: 'rgba(139, 92, 246, 0.9)',
        strokeWidth: 4,
        pulseSpeed: 0.9
      };
    case 'planner':
      return {
        backgroundColor: isDarkMode ? 'rgba(22, 163, 74, 0.2)' : 'rgba(22, 163, 74, 0.1)',
        borderColor: 'rgba(22, 163, 74, 0.7)',
        color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
        handleColor: 'rgba(22, 163, 74, 0.9)',
        fill: 'rgba(22, 163, 74, 0.2)',
        stroke: 'rgba(22, 163, 74, 0.9)',
        strokeWidth: 4,
        pulseSpeed: 1
      };
    case 'evaluator':
      return {
        backgroundColor: isDarkMode ? 'rgba(234, 179, 8, 0.2)' : 'rgba(234, 179, 8, 0.1)',
        borderColor: 'rgba(234, 179, 8, 0.7)',
        color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
        handleColor: 'rgba(234, 179, 8, 0.9)',
        fill: 'rgba(234, 179, 8, 0.2)',
        stroke: 'rgba(234, 179, 8, 0.9)',
        strokeWidth: 4,
        pulseSpeed: 1.1
      };
    case 'error':
      return {
        backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
        borderColor: 'rgba(239, 68, 68, 0.7)',
        color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
        handleColor: 'rgba(239, 68, 68, 0.9)',
        fill: 'rgba(239, 68, 68, 0.2)',
        stroke: 'rgba(239, 68, 68, 0.9)',
        strokeWidth: 4,
        pulseSpeed: 1.8
      };
    default:
      return defaultStyle;
  }
};

/**
 * Get the standardized style parameters for a flow type
 * @param flowType Type of data flow
 * @param isDarkMode Whether dark mode is active
 * @returns Style parameters object
 */
export const getFlowStyleParams = (flowType: FlowType = 'message', isDarkMode: boolean = false): FlowStyleParams => {
  const textColor = isDarkMode ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.9)';

  // Default style
  const defaultStyle: FlowStyleParams = {
    color: 'rgba(59, 130, 246, 0.9)', // Blue
    pulseSpeed: 1,
    strokeWidth: 4,
    fill: 'rgba(59, 130, 246, 0.2)',
    dotSize: 6,
    textColor
  };

  // Flow type specific styles
  switch (flowType) {
    case 'query':
      return {
        color: 'rgba(59, 130, 246, 0.9)', // Blue
        pulseSpeed: 1.2,
        strokeWidth: 4,
        fill: 'rgba(59, 130, 246, 0.2)',
        dotSize: 6,
        textColor,
        label: 'query'
      };
    case 'response':
      return {
        color: 'rgba(16, 185, 129, 0.9)', // Green
        pulseSpeed: 0.8,
        strokeWidth: 4,
        fill: 'rgba(16, 185, 129, 0.2)',
        dotSize: 6,
        textColor,
        label: 'response'
      };
    case 'tool_call':
      return {
        color: 'rgba(245, 158, 11, 0.9)', // Amber
        pulseSpeed: 1.5,
        strokeWidth: 4,
        fill: 'rgba(245, 158, 11, 0.2)',
        dotSize: 6,
        textColor,
        label: 'tool call'
      };
    case 'observation':
      return {
        color: 'rgba(139, 92, 246, 0.9)', // Purple
        pulseSpeed: 0.9,
        strokeWidth: 4,
        fill: 'rgba(139, 92, 246, 0.2)',
        dotSize: 6,
        textColor,
        label: 'observation'
      };
    case 'reflection':
      return {
        color: 'rgba(236, 72, 153, 0.9)', // Pink
        pulseSpeed: 0.7,
        strokeWidth: 4,
        fill: 'rgba(236, 72, 153, 0.2)',
        dotSize: 6,
        textColor,
        label: 'reflection'
      };
    case 'plan':
      return {
        color: 'rgba(22, 163, 74, 0.9)', // Emerald
        pulseSpeed: 1,
        strokeWidth: 4,
        fill: 'rgba(22, 163, 74, 0.2)',
        dotSize: 6,
        textColor,
        label: 'plan'
      };
    case 'message':
      return {
        color: 'rgba(59, 130, 246, 0.9)', // Blue
        pulseSpeed: 1,
        strokeWidth: 4,
        fill: 'rgba(59, 130, 246, 0.2)',
        dotSize: 6,
        textColor,
        label: 'message'
      };
    case 'data':
      return {
        color: 'rgba(234, 179, 8, 0.9)', // Yellow
        pulseSpeed: 1.1,
        strokeWidth: 4,
        fill: 'rgba(234, 179, 8, 0.2)',
        dotSize: 6,
        textColor,
        label: 'data'
      };
    case 'error':
      return {
        color: 'rgba(239, 68, 68, 0.9)', // Red
        pulseSpeed: 1.8,
        strokeWidth: 4,
        fill: 'rgba(239, 68, 68, 0.2)',
        dotSize: 6,
        textColor,
        label: 'error'
      };
    default:
      return defaultStyle;
  }
};

/**
 * React hook to get standardized visualization theme based on current theme
 * @returns Object containing theme-aware styling functions
 */
export const useVisualizationTheme = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  return {
    isDarkMode,
    getNodeStyle: (nodeType: NodeType = 'default') => getNodeStyleParams(nodeType, isDarkMode),
    getFlowStyle: (flowType: FlowType = 'message') => getFlowStyleParams(flowType, isDarkMode),
    // Common animation parameters
    animations: {
      // Animation durations in ms
      fast: isDarkMode ? 120 : 150,
      normal: isDarkMode ? 200 : 250,
      slow: isDarkMode ? 300 : 350,
      
      // Animation easings
      spring: { type: 'spring', stiffness: 500, damping: 25 },
      bounce: { type: 'spring', stiffness: 300, damping: 10 },
      smooth: { duration: 0.3, ease: [0.32, 0.72, 0, 1] },
    },
    // Edge styles
    edges: {
      default: {
        stroke: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
        strokeWidth: 1.5,
      },
      animated: {
        stroke: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
        strokeWidth: 2,
      },
      highlighted: {
        stroke: 'var(--primary)',
        strokeWidth: 2.5,
      }
    },
    // Background styles for ReactFlow
    background: {
      color: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.5)',
      gap: 12,
      size: 1,
    },
    // Common font styles
    fonts: {
      primary: 'Inter, sans-serif',
      monospace: 'Fira Mono, monospace',
    }
  };
};