import { useTheme } from '@/components/theme/ThemeProvider';
import { DataFlowType } from './dataFlowUtils';

/**
 * Simplified utility to provide consistent visualization theming
 */
export function useVisualizationTheme() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  /**
   * Get color for a specific node type
   */
  const getNodeColor = (nodeType: string = 'agent') => {
    switch(nodeType.toLowerCase()) {
      case 'user':
        return '#60a5fa'; // Blue
      case 'agent':
        return '#34d399'; // Green
      case 'llm':
        return '#2563eb'; // Deeper Blue
      case 'tool':
        return '#fbbf24'; // Yellow
      case 'router':
        return '#f59e0b'; // Amber
      case 'input':
        return '#6366f1'; // Indigo
      case 'output':
        return '#10b981'; // Emerald
      case 'aggregator':
        return '#8b5cf6'; // Purple
      case 'environment':
        return '#a78bfa'; // Violet
      case 'reflection':
        return '#f472b6'; // Pink
      case 'planner':
        return '#22d3ee'; // Cyan
      case 'evaluator':
        return '#f59e0b'; // Amber
      default:
        return '#94a3b8'; // Slate (default)
    }
  };
  
  /**
   * Get styling for data flows based on type
   */
  const getFlowStyle = (type?: DataFlowType) => {
    const defaults = {
      color: '#64748b',
      textColor: undefined,
      strokeWidth: 1.5,
      dotSize: 5,
      pulseSpeed: 1,
      fill: undefined
    };
    
    switch(type) {
      case 'query':
        return {
          ...defaults,
          color: '#2563eb',
          strokeWidth: 2,
          dotSize: 6,
        };
      case 'response':
        return {
          ...defaults,
          color: '#10b981',
          strokeWidth: 2,
          dotSize: 6,
        };
      case 'tool_call':
        return {
          ...defaults,
          color: '#d97706',
          strokeWidth: 1.5,
          dotSize: 5,
        };
      case 'observation':
        return {
          ...defaults,
          color: '#7c3aed',
          strokeWidth: 1.5,
          dotSize: 5,
        };
      case 'reflection':
        return {
          ...defaults,
          color: '#db2777',
          strokeWidth: 1.5,
          dotSize: 5,
        };
      case 'plan':
        return {
          ...defaults,
          color: '#06b6d4',
          strokeWidth: 1.5,
          dotSize: 5,
        };
      case 'message':
        return {
          ...defaults,
          color: '#8b5cf6',
          strokeWidth: 1.5,
          dotSize: 5,
        };
      case 'data':
        return {
          ...defaults,
          color: '#0284c7',
          strokeWidth: 1.5,
          dotSize: 5,
        };
      case 'error':
        return {
          ...defaults,
          color: '#dc2626',
          strokeWidth: 2,
          dotSize: 6,
        };
      default:
        return defaults;
    }
  };
  
  /**
   * Edge styling for flow graphs
   */
  const edges = {
    default: {
      stroke: isDarkMode ? '#475569' : '#94a3b8',
      strokeWidth: 1.5,
    },
    animated: {
      stroke: '#3b82f6',
      strokeWidth: 2,
    }
  };
  
  /**
   * Background styling for flow graphs
   */
  const background = {
    gap: 12,
    size: 1,
    color: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
  };
  
  return {
    theme,
    isDarkMode,
    getNodeColor,
    getFlowStyle,
    edges,
    background
  };
}

export default useVisualizationTheme;